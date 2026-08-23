import { Play, Pause, SkipForward, SkipBack, Music2 } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'

export default function MiniPlayer() {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const playNext = usePlayerStore((s) => s.playNext)
  const playPrevious = usePlayerStore((s) => s.playPrevious)
  const setFullScreen = usePlayerStore((s) => s.setFullScreen)

  if (!currentSong) return null

  return (
    <div
      className="fixed bottom-[70px] left-3 right-3 sm:left-auto sm:right-6 sm:w-[420px] bg-[var(--bg-card)]/95 backdrop-blur-xl border border-[var(--card-border)] rounded-2xl flex items-center p-2.5 gap-3 z-40 cursor-pointer shadow-2xl transition-all duration-300 hover:scale-[1.01]"
      onClick={() => setFullScreen(true)}
    >
      {/* Cover / Animation */}
      <div className="relative flex-shrink-0">
        {currentSong.cover_url ? (
          <img
            src={currentSong.cover_url}
            alt={currentSong.title}
            className={`w-11 h-11 rounded-xl object-cover shadow-sm ${isPlaying ? 'animate-pulse-soft' : ''}`}
          />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-[var(--accent-color)] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <Music2 size={20} />
          </div>
        )}
        {isPlaying && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-color)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent-color)]"></span>
          </span>
        )}
      </div>

      {/* Song details */}
      <div className="flex-1 min-w-0 pr-1">
        <p className="text-xs sm:text-sm font-semibold truncate text-[var(--text-primary)]">{currentSong.title}</p>
        <p className="text-[11px] text-[var(--text-muted)] truncate">{currentSong.artist_name || currentSong.artist || 'Playing Now'}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); playPrevious() }}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition hover:scale-110 active:scale-95 cursor-pointer"
          title="Previous"
        >
          <SkipBack size={17} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); togglePlay() }}
          className="btn-3d w-8 h-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white cursor-pointer shadow-md"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" className="ml-0.5" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); playNext() }}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition hover:scale-110 active:scale-95 cursor-pointer"
          title="Next"
        >
          <SkipForward size={17} />
        </button>
      </div>
    </div>
  )
}