import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../../store/playerStore'

let ytApiLoaded = false
let ytApiLoadingPromise = null

function loadYoutubeApi() {
  if (ytApiLoaded) return Promise.resolve()
  if (ytApiLoadingPromise) return ytApiLoadingPromise

  ytApiLoadingPromise = new Promise((resolve) => {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)

    window.onYouTubeIframeAPIReady = () => {
      ytApiLoaded = true
      resolve()
    }
  })

  return ytApiLoadingPromise
}

export default function YoutubeAudioEngine() {
  const playerRef = useRef(null)
  const containerRef = useRef(null)

  const currentSong = usePlayerStore((s) => s.currentSong)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const volume = usePlayerStore((s) => s.volume)
  const setProgress = usePlayerStore((s) => s.setProgress)
  const setDuration = usePlayerStore((s) => s.setDuration)
  const playNext = usePlayerStore((s) => s.playNext)

  useEffect(() => {
    loadYoutubeApi().then(() => {
      if (!playerRef.current && containerRef.current) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '0',
          width: '0',
          playerVars: {
            autoplay: 1,
            controls: 0,
            enablejsapi: 1,
            origin: window.location.origin,
            rel: 0,
            playsinline: 1,
          },
          events: {
            onReady: (e) => {
              if (e.target?.setVolume) {
                e.target.setVolume(usePlayerStore.getState().volume * 100)
              }
            },
            onStateChange: (e) => {
              if (e.data === window.YT.PlayerState.ENDED) {
                if (usePlayerStore.getState().repeatMode === 'one') {
                  playerRef.current?.seekTo(0)
                  playerRef.current?.playVideo()
                } else {
                  playNext()
                }
              }
            },
            onError: (e) => {
              console.warn('[YouTube Player Warning] Video unplayable or restricted:', e.data)
              // If video owner disables embedding (Error 101/150) or video missing (100), skip to next song
              playNext()
            },
          },
        })
      }
    })
  }, [])

  // Listen for yt-seek events from FullPlayer / seek slider
  useEffect(() => {
    const handler = (e) => {
      if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(e.detail, true)
      }
    }
    window.addEventListener('yt-seek', handler)
    return () => window.removeEventListener('yt-seek', handler)
  }, [])

  // Song change handler
  useEffect(() => {
    if (!currentSong || (currentSong.source !== 'youtube' && !currentSong.youtube_id && !currentSong.id?.startsWith?.('yt-'))) {
      if (playerRef.current?.stopVideo) {
        playerRef.current.stopVideo()
      }
      return
    }

    const rawId = currentSong.youtube_id || (typeof currentSong.id === 'string' ? currentSong.id.replace(/^yt-/, '') : null)
    if (!rawId) return

    const loadAndPlay = () => {
      if (playerRef.current?.loadVideoById) {
        playerRef.current.loadVideoById({
          videoId: rawId,
          suggestedQuality: 'small',
        })
        if (isPlaying) {
          playerRef.current.playVideo()
        }
      }
    }

    if (playerRef.current) {
      loadAndPlay()
    } else {
      const timer = setTimeout(loadAndPlay, 500)
      return () => clearTimeout(timer)
    }

    const durationCheck = setInterval(() => {
      const dur = playerRef.current?.getDuration?.()
      if (dur) {
        setDuration(dur)
        clearInterval(durationCheck)
      }
    }, 300)

    return () => clearInterval(durationCheck)
  }, [currentSong])

  // Play/pause control
  useEffect(() => {
    if (!playerRef.current?.playVideo) return
    if (isPlaying) {
      playerRef.current.playVideo()
    } else {
      playerRef.current.pauseVideo()
    }
  }, [isPlaying])

  // Volume control
  useEffect(() => {
    if (playerRef.current?.setVolume) {
      playerRef.current.setVolume(volume * 100)
    }
  }, [volume])

  // Progress tracking
  useEffect(() => {
    const interval = setInterval(() => {
      const time = playerRef.current?.getCurrentTime?.()
      if (time !== undefined && isPlaying) setProgress(time)
    }, 500)
    return () => clearInterval(interval)
  }, [isPlaying])

  return <div ref={containerRef} style={{ display: 'none' }} />
}
