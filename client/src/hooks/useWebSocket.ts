import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import type { WebSocketMessage } from '../types';
import { setWebSocketRef, useWebSocketActions } from './useWebSocketActions';

export const useWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    // Prevent multiple connections
    if (wsRef.current?.readyState === WebSocket.CONNECTING || 
        wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected or connecting');
      return;
    }

    // WebSocket URL configuration for different environments
    let wsUrl: string;
    
    if (import.meta.env.DEV) {
      // Development - connect to local server
      wsUrl = 'ws://localhost:4000';
    } else {
      // Production - use environment variable or fallback
      const backendUrl = import.meta.env.VITE_WEBSOCKET_URL || 'wss://h3chat-production.up.railway.app';
      wsUrl = backendUrl.replace(/^https?:/, backendUrl.startsWith('https') ? 'wss:' : 'ws:');
    }
    
    console.log('[WebSocket] Connecting to:', wsUrl);
    wsRef.current = new WebSocket(wsUrl);
    
    // Update the singleton reference
    setWebSocketRef(wsRef.current);

    wsRef.current.onopen = () => {
      console.log('[WebSocket] Connected');
      useChatStore.getState().setConnected(true);
    };

    wsRef.current.onclose = () => {
      console.log('[WebSocket] Disconnected');
      useChatStore.getState().setConnected(false);
      setWebSocketRef(null);
      
      // Reconnect after 3 seconds, but only if not manually closed
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          connect();
        }
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('[WebSocket] Received:', message);
        
        handleMessage(message);
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };
  }, []); // Remove dependencies to prevent restart loops

  const handleMessage = useCallback((message: WebSocketMessage) => {
    const store = useChatStore.getState();
    
    switch (message.type) {
      case 'init':
        if (message.id) store.setClientId(message.id);
        if (message.h3Resolution) store.setH3Resolution(message.h3Resolution);
        store.addMessage({
          type: 'system',
          text: `Connected! Your ID: ${message.id}. H3 Resolution: ${message.h3Resolution}`,
          ts: Date.now()
        });
        break;

      case 'joined':
        store.addMessage({
          type: 'system',
          text: `Registered on server (ID: ${message.id})`,
          ts: Date.now()
        });
        break;

      case 'presence_update':
        if (message.id && message.name && message.h3) {
          store.updateUser({
            id: message.id,
            name: message.name,
            h3: message.h3,
            ts: Date.now()
          });
        }
        break;

      case 'chat':
        if (message.id && message.name && message.text && message.ts) {
          store.addMessage({
            type: 'chat',
            id: message.id,
            name: message.name,
            text: message.text,
            h3: message.h3 || '',
            ts: message.ts
          });
        }
        break;

      case 'left':
        if (message.id) {
          store.removeUser(message.id);
          store.addMessage({
            type: 'system',
            text: `${message.name} left the chat`,
            ts: Date.now()
          });
        }
        break;

      case 'error':
        store.addMessage({
          type: 'system',
          text: `Error: ${message.message}`,
          ts: Date.now()
        });
        break;

      case 'sent':
        // Message sent confirmation - could add UI feedback here
        break;
    }
  }, []); // No dependencies needed

  // Get WebSocket actions from the separate hook
  const actions = useWebSocketActions();

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []); // Empty dependency array - connect only once

  // Separate effect for presence updates
  useEffect(() => {
    const presenceInterval = setInterval(() => {
      const store = useChatStore.getState();
      if (store.myH3) actions.sendPresence();
    }, 10000);

    return () => clearInterval(presenceInterval);
  }, [actions.sendPresence]);

  // Separate effect for cleanup
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const store = useChatStore.getState();
      const staleUsers: string[] = [];
      
      store.nearbyUsers.forEach((user, userId) => {
        if (now - user.ts > 30000) {
          staleUsers.push(userId);
        }
      });
      
      staleUsers.forEach(userId => {
        store.removeUser(userId);
      });
    }, 5000);

    return () => clearInterval(cleanupInterval);
  }, []); // No dependencies needed

  return actions;
};