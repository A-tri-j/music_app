import { create } from 'zustand'
import api from '../services/api'

export const usePlayerStore = create((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [],
  currentIndex: 0,
  progress: 0,
  duration: 0,
  volume: 1,
  isShuffled: false,
  repeatMode: 'off',
  isFullScreen: false,

  // Session tracking
  currentSessionId: null,
  sessionStartTime: null,
  accumulatedSeconds: 0,
  totalSessionsEnded: 0,

  playSong: async (song, queue = []) => {
    await get().endCurrentSession()

    const newQueue = queue.length > 0 ? queue : [song]
    const index = newQueue.findIndex((s) => s.id === song.id)
    set({
      currentSong: song,
      isPlaying: true,
      queue: newQueue,
      currentIndex: index >= 0 ? index : 0,
      accumulatedSeconds: 0,
    })

    const ytId = song.youtube_id || (typeof song.id === 'string' ? song.id.replace(/^yt-/, '') : String(song.id))
    const title = song.title || 'Unknown Title'
    const artist = song.artist_name || song.artist || song.channel || null

    try {
      const res = await api.post('/analytics/session/start', {
        youtube_id: ytId,
        title: title,
        artist_name: artist,
      })
      set({ currentSessionId: res.data.id, sessionStartTime: Date.now() })
    } catch (err) {
      console.error('Session start failed', err)
      set({ sessionStartTime: Date.now() })
    }
  },

  endCurrentSession: async () => {
    const { currentSessionId, accumulatedSeconds, sessionStartTime } = get()
    if (!currentSessionId) {
      set({ currentSessionId: null, sessionStartTime: null, accumulatedSeconds: 0 })
      return
    }

    const elapsed = sessionStartTime ? (Date.now() - sessionStartTime) / 1000 : 0
    const totalDuration = (accumulatedSeconds || 0) + elapsed

    const token = localStorage.getItem('access_token')
    if (!token) {
      set({ currentSessionId: null, sessionStartTime: null, accumulatedSeconds: 0 })
      return
    }

    try {
      await api.patch(`/analytics/session/${currentSessionId}/end`, {
        duration_listened: Math.round(totalDuration),
      })

      // Every 5th session-e background-e profile refresh koro
      const sessionCount = (get().totalSessionsEnded || 0) + 1
      set({ totalSessionsEnded: sessionCount })
      if (sessionCount % 5 === 0) {
        api.post('/chatbot/refresh-profile').catch(() => {})
      }
    } catch (err) {
      console.error('Session end failed', err)
    }
    set({ currentSessionId: null, sessionStartTime: null, accumulatedSeconds: 0 })
  },

  togglePlay: () =>
    set((state) => {
      const nowPlaying = !state.isPlaying
      if (nowPlaying) {
        return { isPlaying: true, sessionStartTime: Date.now() }
      } else {
        const elapsed = state.sessionStartTime ? (Date.now() - state.sessionStartTime) / 1000 : 0
        return {
          isPlaying: false,
          accumulatedSeconds: state.accumulatedSeconds + elapsed,
          sessionStartTime: null,
        }
      }
    }),

  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),

  playNext: () => {
    const { queue, currentIndex, isShuffled } = get()
    if (queue.length === 0) return
    get().endCurrentSession()

    let nextIndex
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * queue.length)
    } else {
      nextIndex = (currentIndex + 1) % queue.length
    }
    get().playSong(queue[nextIndex], queue)
  },

  playPrevious: () => {
    const { queue, currentIndex } = get()
    if (queue.length === 0) return
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1
    get().playSong(queue[prevIndex], queue)
  },

  toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),

  cycleRepeat: () =>
    set((state) => {
      const modes = ['off', 'all', 'one']
      const nextMode = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length]
      return { repeatMode: nextMode }
    }),

  setFullScreen: (value) => set({ isFullScreen: value }),
}))