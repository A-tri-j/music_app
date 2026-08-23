import { X, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Repeat1, Music2 } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import { formatTime } from '../../utils/formatTime'

export default function FullPlayer() {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const progress = usePlayerStore((s) => s.progress)
  const duration = usePlayerStore((s) => s.duration)
  const isShuffled = usePlayerStore((s) => s.isShuffled)
  const repeatMode = usePlayerStore((s) => s.repeatMode)
  const isFullScreen = usePlayerStore((s) => s.isFullScreen)

  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const playNext = usePlayerStore((s) => s.playNext)
  const playPrevious = usePlayerStore((s) => s.playPrevious)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat)
  const setFullScreen = usePlayerStore((s) => s.setFullScreen)
  const setProgress = usePlayerStore((s) => s.setProgress)

  if (!isFullScreen || !currentSong) return null

  const handleSeek = (e) => {
    const newTime = Number(e.target.value)
    setProgress(newTime)

    if (currentSong?.source === 'youtube') {
      window.dispatchEvent(new CustomEvent('yt-seek', { detail: newTime }))
    } else {
      const audioEl = document.querySelector('audio')
      if (audioEl) audioEl.currentTime = newTime
    }
  }

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] text-[var(--text-primary)] z-50 flex flex-col items-center justify-between p-6 sm:p-10 animate-slide-up backdrop-blur-2xl overflow-y-auto">
      {/* Top bar */}
      <div className="w-full max-w-md flex items-center justify-between">
        <button
          onClick={() => setFullScreen(false)}
          className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--card-border)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition active:scale-95 cursor-pointer shadow-sm"
        >
          <X size={20} />
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Now Playing</span>
        <div className="w-10"></div>
      </div>

      {/* Center Artwork */}
      <div className="my-auto flex flex-col items-center max-w-md w-full py-4">
        <div className="relative mb-8">
          {currentSong.cover_url ? (
            <img
              src={currentSong.cover_url}
              alt={currentSong.title}
              className={`w-64 h-64 sm:w-72 sm:h-72 rounded-3xl object-cover shadow-2xl ring-1 ring-[var(--card-border)] ${
                isPlaying ? 'animate-pulse-soft' : ''
              }`}
            />
          ) : (
            <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-[var(--bg-card)] border border-[var(--card-border)] flex items-center justify-center text-[var(--accent-color)] shadow-2xl">
              <Music2 size={64} />
            </div>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-center text-[var(--text-primary)] truncate max-w-xs sm:max-w-sm">
          {currentSong.title}
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1 font-medium">
          {currentSong.artist_name || currentSong.artist || 'Unknown Artist'}
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-sm mt-8">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={progress}
            onChange={handleSeek}
            className="w-full accent-[var(--accent-color)] cursor-pointer h-1.5 rounded-lg bg-[var(--bg-secondary)]"
          />
          <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2 font-mono">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 mt-8">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition active:scale-90 cursor-pointer ${
              isShuffled ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Shuffle size={20} />
          </button>
          <button
            onClick={playPrevious}
            className="p-2 text-[var(--text-primary)] hover:scale-110 active:scale-95 transition cursor-pointer"
          >
            <SkipBack size={26} />
          </button>
          <button
            onClick={togglePlay}
            className="btn-3d w-16 h-16 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white shadow-xl cursor-pointer"
          >
            {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="ml-1" />}
          </button>
          <button
            onClick={playNext}
            className="p-2 text-[var(--text-primary)] hover:scale-110 active:scale-95 transition cursor-pointer"
          >
            <SkipForward size={26} />
          </button>
          <button
            onClick={cycleRepeat}
            className={`p-2 transition active:scale-90 cursor-pointer ${
              repeatMode !== 'off' ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}