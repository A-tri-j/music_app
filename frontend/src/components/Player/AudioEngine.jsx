import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../../store/playerStore'

export default function AudioEngine() {
  const audioRef = useRef(null)
  const currentSong = usePlayerStore((s) => s.currentSong)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const volume = usePlayerStore((s) => s.volume)
  const repeatMode = usePlayerStore((s) => s.repeatMode)
  const setProgress = usePlayerStore((s) => s.setProgress)
  const setDuration = usePlayerStore((s) => s.setDuration)
  const playNext = usePlayerStore((s) => s.playNext)

  useEffect(() => {
    if (!audioRef.current || !currentSong) return
    if (currentSong.source === 'youtube') {
      audioRef.current.pause()
      return
    }
    audioRef.current.src = currentSong.audio_url
    if (isPlaying) audioRef.current.play()
  }, [currentSong])

  useEffect(() => {
    if (!audioRef.current || currentSong?.source === 'youtube') return
    if (isPlaying) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, currentSong])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const handleTimeUpdate = () => {
    if (audioRef.current) setProgress(audioRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration)
  }

  const handleEnded = () => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    } else {
      playNext()
    }
  }

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleEnded}
    />
  )
}