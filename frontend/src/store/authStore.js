import { create } from 'zustand'
import api from '../services/api'
import { usePlayerStore } from './playerStore'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: Boolean(localStorage.getItem('access_token')),

  setUser: (user) => set({ user, isAuthenticated: true }),

  fetchUser: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      set({ user: null, isAuthenticated: false })
      return
    }
    try {
      const res = await api.get('/auth/me')
      set({ user: res.data, isAuthenticated: true })
    } catch {
      localStorage.removeItem('access_token')
      set({ user: null, isAuthenticated: false })
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    try {
      usePlayerStore.getState().pauseSong?.()
      usePlayerStore.setState({ currentSong: null, isPlaying: false, queue: [] })
    } catch {}
    set({ user: null, isAuthenticated: false })
  },
}))
