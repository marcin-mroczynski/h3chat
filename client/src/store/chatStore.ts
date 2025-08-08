import { create } from 'zustand';
import type { ChatState } from '../types';

export const useChatStore = create<ChatState>((set) => ({
  connected: false,
  clientId: null,
  myH3: null,
  nickname: 'Anonymous',
  messages: [],
  nearbyUsers: new Map(),
  h3Resolution: 8,
  radius: 1,

  setConnected: (connected) => set({ connected }),
  
  setClientId: (clientId) => set({ clientId }),
  
  setMyH3: (myH3) => set({ myH3 }),
  
  setNickname: (nickname) => set({ nickname }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setNearbyUsers: (nearbyUsers) => set({ nearbyUsers }),
  
  updateUser: (user) => set((state) => {
    const newUsers = new Map(state.nearbyUsers);
    newUsers.set(user.id, user);
    return { nearbyUsers: newUsers };
  }),
  
  removeUser: (userId) => set((state) => {
    const newUsers = new Map(state.nearbyUsers);
    newUsers.delete(userId);
    return { nearbyUsers: newUsers };
  }),
  
  setH3Resolution: (h3Resolution) => set({ h3Resolution }),
  
  setRadius: (radius) => set({ radius })
}));