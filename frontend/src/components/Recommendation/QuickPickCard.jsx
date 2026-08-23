import { useEffect, useState } from 'react'
import { X, Play, Sparkles } from 'lucide-react'
import api from '../../services/api'
import { usePlayerStore } from '../../store/playerStore'

const INTERVAL_MS = 15 * 60 * 1000
const INITIAL_DELAY_MS = 4000

export default function QuickPickCard() {
  const [visible, setVisible] = useState(false)
  const [data, setData] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(false)
  const playSong = usePlayerStore((s) => s.playSong)

  const fetchQuickPick = async () => {
    setLoading(true)
    try {
      const res = await api.get('/recommendations/quick-pick')
      if (res.data.songs && res.data.songs.length > 0) {
        setData(res.data)
        setVisible(true)
        setDismissed(false)
      }
    } catch (err) {
      console.error('Quick pick fetch failed', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initialTimer = setTimeout(fetchQuickPick, INITIAL_DELAY_MS)
    const interval = setInterval(fetchQuickPick, INTERVAL_MS)
    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [])

  const handleClose = () => {
    setVisible(false)
    setDismissed(true)
  }

  const handlePlay = (song) => {
    const playableSong = {
      id: `yt-${song.youtube_id}`,
      title: song.title,
      cover_url: song.cover_url,
      source: 'youtube',
      youtube_id: song.youtube_id,
      artist_name: song.artist,
    }
    playSong(playableSong, [playableSong])
  }

  if (!visible || dismissed || !data) return null

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:w-96 z-50 animate-slide-up">
      <div className="bg-[var(--bg-card)]/95 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-[var(--card-border)] ring-1 ring-[var(--accent-color)]/25">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 text-[var(--accent-color)]">
            <Sparkles size={18} className="animate-pulse-soft" />
            <p className="font-bold text-xs uppercase tracking-wider">Quick Recommendations</p>
          </div>
          <button
            onClick={handleClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition p-1 rounded-lg hover:bg-[var(--bg-secondary)]"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-base font-bold text-[var(--text-primary)] mb-0.5">Hi {data.user_name}! 👋</p>
        <p className="text-xs text-[var(--text-muted)] mb-3.5">
          Curated tracks picked just for you:
        </p>

        <div className="flex flex-col gap-2">
          {data.songs.map((song, idx) => (
            <div
              key={idx}
              onClick={() => handlePlay(song)}
              className="card-hover-3d flex items-center gap-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] rounded-xl p-2.5 cursor-pointer transition-all border border-[var(--card-border)] group"
            >
              <img
                src={song.cover_url || 'https://placehold.co/40x40/222/fff?text=%E2%99%AA'}
                alt={song.title}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-color)] transition">
                  {song.title}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] truncate">{song.artist}</p>
              </div>
              <button className="btn-3d w-7 h-7 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <Play size={11} fill="white" color="white" className="ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

