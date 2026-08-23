import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  isOpen: false,
  sessionId: null,
  messages: [], // { role: 'user' | 'assistant', content: string, songs?: [] }
  isLoading: false,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setSessionId: (id) => set({ sessionId: id }),
  setLoading: (val) => set({ isLoading: val }),
}))
