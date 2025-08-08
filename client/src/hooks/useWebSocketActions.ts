import { useCallback } from 'react';
import { useChatStore } from '../store/chatStore';

// Singleton WebSocket reference
let ws: WebSocket | null = null;

const sendMessage = (message: object) => {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
    console.log('[WebSocket] Sent:', message);
  } else {
    console.warn('[WebSocket] Not connected');
  }
};

export const useWebSocketActions = () => {
  const sendJoin = useCallback((h3Override?: string) => {
    const store = useChatStore.getState();
    sendMessage({
      type: 'join',
      name: store.nickname,
      h3: h3Override || store.myH3
    });
  }, []);

  const sendPresence = useCallback((h3Override?: string) => {
    const store = useChatStore.getState();
    sendMessage({
      type: 'presence',
      h3: h3Override || store.myH3
    });
  }, []);

  const sendChat = useCallback((text: string) => {
    const store = useChatStore.getState();
    sendMessage({
      type: 'chat',
      text,
      radius: store.radius,
      h3: store.myH3
    });
  }, []);

  return {
    sendJoin,
    sendPresence,
    sendChat
  };
};

// Export function to set WebSocket reference
export const setWebSocketRef = (websocket: WebSocket | null) => {
  ws = websocket;
};