export interface User {
  id: string;
  name: string;
  h3: string;
  ts: number;
}

export interface ChatMessage {
  type: 'chat';
  id: string;
  name: string;
  text: string;
  h3: string;
  ts: number;
}

export interface SystemMessage {
  type: 'system';
  text: string;
  ts: number;
}

export type Message = ChatMessage | SystemMessage;

export interface WebSocketMessage {
  type: 'init' | 'joined' | 'presence_update' | 'chat' | 'left' | 'error' | 'sent';
  id?: string;
  name?: string;
  text?: string;
  h3?: string;
  ts?: number;
  message?: string;
  h3Resolution?: number;
}

export interface ChatState {
  connected: boolean;
  clientId: string | null;
  myH3: string | null;
  nickname: string;
  messages: Message[];
  nearbyUsers: Map<string, User>;
  h3Resolution: number;
  radius: number;
  
  // Actions
  setConnected: (connected: boolean) => void;
  setClientId: (id: string) => void;
  setMyH3: (h3: string | null) => void;
  setNickname: (nickname: string) => void;
  addMessage: (message: Message) => void;
  setNearbyUsers: (users: Map<string, User>) => void;
  updateUser: (user: User) => void;
  removeUser: (userId: string) => void;
  setH3Resolution: (resolution: number) => void;
  setRadius: (radius: number) => void;
}