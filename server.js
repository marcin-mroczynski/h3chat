// server.js
// Minimalny jednoplikiowy serwer Node.js + WebSocket + H3

const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');
const h3 = require('h3-js');
const { nanoid } = require('nanoid');

const PORT = process.env.PORT || 4000;
const H3_RESOLUTION = 8; // domyślne (możesz zmienić)
const PRESENCE_TTL_MS = 30_000; // jak długo uważamy obecność za ważną
const RATE_LIMIT_WINDOW_MS = 1000; // okno dla rate-limit
const RATE_LIMIT_MAX = 5; // max wiadomości na okno

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Lightweight healthcheck for Railway
app.get('/health', (_req, res) => {
  res.status(200).send('ok');
});

// Serve React build files in production, or development files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('./client/dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  });
} else {
  // In development, serve the old HTML file
  app.use(express.static('.'));
}

// In-memory structures
// clientId -> { ws, name, h3, lastSeen, queue (rate-limit info) }
const clients = new Map();
// h3Index -> Set(clientId)
const h3IndexMap = new Map();

function addClientToH3(clientId, h3Index) {
  if (!h3Index) return;
  if (!h3IndexMap.has(h3Index)) h3IndexMap.set(h3Index, new Set());
  h3IndexMap.get(h3Index).add(clientId);
}

function removeClientFromH3(clientId, h3Index) {
  if (!h3Index) return;
  const s = h3IndexMap.get(h3Index);
  if (!s) return;
  s.delete(clientId);
  if (s.size === 0) h3IndexMap.delete(h3Index);
}

function send(ws, obj) {
  try {
    ws.send(JSON.stringify(obj));
  } catch (e) {
    // ignore
  }
}

function broadcastToH3Ring(senderId, senderH3, radius, messageObj) {
  // compute kRing of senderH3 with given radius
  const ring = h3.gridDisk(senderH3, radius || 1);
  console.log(`[DEBUG] Broadcasting from ${senderId} at H3=${senderH3}, radius=${radius}`);
  console.log(`[DEBUG] Ring cells:`, ring);
  console.log(`[DEBUG] Available H3 indexes:`, Array.from(h3IndexMap.keys()));
  
  const sent = new Set();
  for (const h of ring) {
    const set = h3IndexMap.get(h);
    if (!set) {
      console.log(`[DEBUG] No clients in H3 cell: ${h}`);
      continue;
    }
    console.log(`[DEBUG] Found ${set.size} clients in H3 cell: ${h}`);
    for (const cid of set) {
      if (cid === senderId) continue;
      if (sent.has(cid)) continue;
      const c = clients.get(cid);
      if (!c) continue;
      console.log(`[DEBUG] Sending to client: ${cid}`);
      send(c.ws, messageObj);
      sent.add(cid);
    }
  }
  console.log(`[DEBUG] Sent to ${sent.size} clients`);
}

wss.on('connection', function connection(ws, req) {
  const clientId = nanoid();
  clients.set(clientId, { ws, name: null, h3: null, lastSeen: Date.now(), rate: [] });

  // Send assigned id to client
  send(ws, { type: 'init', id: clientId, h3Resolution: H3_RESOLUTION });

  ws.on('message', function incoming(raw) {
    let msg;
    try { msg = JSON.parse(raw); } catch (e) { return; }
    const client = clients.get(clientId);
    if (!client) return;

    client.lastSeen = Date.now();

    // Simple rate limiter: sliding window
    const now = Date.now();
    client.rate = client.rate.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (client.rate.length >= RATE_LIMIT_MAX) {
      send(ws, { type: 'error', message: 'rate_limited' });
      return;
    }

    if (msg.type === 'join') {
      client.name = msg.name || 'Anon';
      const newH3 = msg.h3 || null;
      console.log(`[DEBUG] Client ${clientId} joining with name: ${client.name}, H3: ${newH3}`);
      if (client.h3 !== newH3) {
        removeClientFromH3(clientId, client.h3);
        client.h3 = newH3;
        addClientToH3(clientId, client.h3);
        console.log(`[DEBUG] Client ${clientId} added to H3 index: ${newH3}`);
      }
      // ack join
      send(ws, { type: 'joined', id: clientId });
      
      // Send current users in the same H3 area after join
      if (client.h3) {
        const ring = h3.gridDisk(client.h3, 1); // Check immediate area
        const nearbyUsers = [];
        for (const h of ring) {
          const set = h3IndexMap.get(h);
          if (set) {
            for (const cid of set) {
              if (cid !== clientId) {
                const c = clients.get(cid);
                if (c && c.name && c.h3) {
                  nearbyUsers.push({ 
                    type: 'presence_update', 
                    id: cid, 
                    name: c.name, 
                    h3: c.h3 
                  });
                }
              }
            }
          }
        }
        // Send all nearby users to the newly joined client
        nearbyUsers.forEach(user => send(ws, user));
        console.log(`[DEBUG] Sent ${nearbyUsers.length} nearby users to ${clientId}`);
      }

    } else if (msg.type === 'presence') {
      // update presence (h3)
      const newH3 = msg.h3 || null;
      console.log(`[DEBUG] Client ${clientId} presence update: ${newH3}`);
      if (client.h3 !== newH3) {
        removeClientFromH3(clientId, client.h3);
        client.h3 = newH3;
        addClientToH3(clientId, client.h3);
        console.log(`[DEBUG] Client ${clientId} moved to H3 index: ${newH3}`);
      }
      client.lastSeen = Date.now();

      // notify local neighbors about presence change
      if (client.h3) {
        console.log(`[DEBUG] Broadcasting presence update for ${clientId}`);
        broadcastToH3Ring(clientId, client.h3, 1, { type: 'presence_update', id: clientId, name: client.name, h3: client.h3 });
      }

    } else if (msg.type === 'chat') {
      client.rate.push(now);

      if (!client.h3 && !msg.h3) {
        console.log(`[DEBUG] Client ${clientId} tried to chat without location`);
        send(ws, { type: 'error', message: 'no_location' });
        return;
      }
      const senderH3 = client.h3 || msg.h3;
      const radius = typeof msg.radius === 'number' ? Math.max(0, Math.min(4, msg.radius)) : 1;
      console.log(`[DEBUG] Client ${clientId} (${client.name}) sending chat from H3: ${senderH3}, radius: ${radius}`);
      console.log(`[DEBUG] Message: "${msg.text}"`);

      const payload = {
        type: 'chat',
        id: clientId,
        name: client.name,
        text: msg.text,
        h3: senderH3,
        ts: Date.now(),
      };

      broadcastToH3Ring(clientId, senderH3, radius, payload);

      send(ws, { type: 'sent', ts: Date.now() });

    } else if (msg.type === 'leave') {
      ws.close();
    }
  });

  ws.on('close', function() {
    const client = clients.get(clientId);
    if (client) {
      removeClientFromH3(clientId, client.h3);
      clients.delete(clientId);
      if (client.h3) {
        broadcastToH3Ring(clientId, client.h3, 1, { type: 'left', id: clientId, name: client.name });
      }
    }
  });
});

// Periodic cleanup of stale presences
setInterval(() => {
  const now = Date.now();
  for (const [cid, c] of clients.entries()) {
    if (now - c.lastSeen > PRESENCE_TTL_MS) {
      try { c.ws.terminate(); } catch (e) {}
      removeClientFromH3(cid, c.h3);
      clients.delete(cid);
    }
  }
}, 10_000);

server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
