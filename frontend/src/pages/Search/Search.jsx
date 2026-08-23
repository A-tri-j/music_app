import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Heart, Search as SearchIcon, Sparkles, X, ArrowLeft } from 'lucide-react'
import api from '../../services/api'
import { searchYoutubeSongs } from '../../services/youtube'
import { usePlayerStore } from '../../store/playerStore'

const EXPLORE_CHIPS = [
  '🔥 Trending Hits',
  '✨ Arijit Singh',
  '🎸 Rupam Islam',
  '💖 Romantic Songs',
  '🎵 Anupam Roy',
  '🎧 Bengali Top Hits',
  '⚡ Bollywood Retro',
  '🌿 Acoustic & Chill',
]

export default function Search() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [likedIds, setLikedIds] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [loadingRecs, setLoadingRecs] = useState(true)
  const playSong = usePlayerStore((s) => s.playSong)

  useEffect(() => {
    api.get('/library/likes')
      .then((res) => setLikedIds(new Set(res.data.map((s) => s.youtube_id))))
      .catch(() => {})

    api.get('/recommendations/for-you')
      .then((res) => setRecommendations(res.data || []))
      .catch(() => setRecommendations([]))
      .finally(() => setLoadingRecs(false))
  }, [])

  useEffect(() => {
    if (query.trim() === '') {
      setResults([])
      return
    }
    setLoading(true)
    const delay = setTimeout(() => {
      searchYoutubeSongs(query)
        .then((songs) => setResults(songs))
        .finally(() => setLoading(false))
    }, 500)
    return () => clearTimeout(delay)
  }, [query])

  const toggleLike = async (e, video) => {
    e.stopPropagation()
    const videoId = video.youtube_id || (typeof video.id === 'string' ? video.id.replace(/^yt-/, '') : video.id)
    if (likedIds.has(videoId)) {
      await api.delete(`/library/likes/${videoId}`)
      setLikedIds((prev) => {
        const next = new Set(prev)
        next.delete(videoId)
        return next
      })
    } else {
      await api.post('/library/likes', {
        youtube_id: videoId,
        title: video.title,
        artist_name: video.channel || video.artist || video.artist_name || 'Unknown Artist',
        cover_url: video.thumbnail || video.cover_url,
      })
      setLikedIds((prev) => new Set([...prev, videoId]))
    }
  }

  const handlePlay = (video, queueList = null) => {
    const videoId = video.youtube_id || (typeof video.id === 'string' ? video.id.replace(/^yt-/, '') : video.id)
    const song = {
      id: `yt-${videoId}`,
      title: video.title,
      cover_url: video.thumbnail || video.cover_url,
      source: 'youtube',
      youtube_id: videoId,
      artist_name: video.channel || video.artist || video.artist_name,
    }
    const currentQueue = queueList
      ? queueList.map((item) => {
          const itemVideo = item.song || item
          const itemVidId = itemVideo.youtube_id || (typeof itemVideo.id === 'string' ? itemVideo.id.replace(/^yt-/, '') : itemVideo.id)
          return {
            id: `yt-${itemVidId}`,
            title: itemVideo.title,
            cover_url: itemVideo.thumbnail || itemVideo.cover_url,
            source: 'youtube',
            youtube_id: itemVidId,
            artist_name: itemVideo.channel || itemVideo.artist || itemVideo.artist_name,
          }
        })
      : [song]

    playSong(song, currentQueue)

    api.post('/library/recently-played', {
      youtube_id: videoId,
      title: video.title,
      artist_name: video.channel || video.artist || video.artist_name,
      cover_url: video.thumbnail || video.cover_url,
    }).catch(() => {})
  }

  const handleChipClick = (chip) => {
    const cleanQuery = chip.replace(/^[^\s]+\s+/, '')
    setQuery(cleanQuery)
  }

  return (
    <div className="p-5 pt-6 pb-36 max-w-3xl mx-auto animate-slide-up">
      {/* Top Header with Back Button */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-3d w-10 h-10 rounded-2xl bg-[var(--bg-card)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer shadow-sm active:scale-95"
          title="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Search Music</h1>
      </div>

      <div className="relative mb-4">
        <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Bollywood, Bengali, artists, songs..."
          className="w-full bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-2xl pl-11 pr-10 py-3.5 outline-none text-sm border border-[var(--card-border)] focus:border-[var(--accent-color)] transition-all shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] rounded-full p-1 transition"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Explore quick chips */}
      <div className="flex gap-2.5 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {EXPLORE_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleChipClick(chip)}
            className="card-hover-3d flex-shrink-0 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--card-border)] text-xs text-[var(--text-secondary)] font-medium px-4 py-2 rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {chip}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm mb-4 animate-pulse">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--accent-color)]"></div>
          <span>Searching YouTube database...</span>
        </div>
      )}

      {/* Search Results */}
      {query.trim() !== '' && (
        <div className="flex flex-col gap-2.5 mb-8">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">
            Results for &quot;{query}&quot;
          </h2>
          {results.length === 0 && !loading && (
            <p className="text-[var(--text-muted)] text-sm bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--card-border)]">
              No results found for &quot;{query}&quot;. Try searching another artist or track.
            </p>
          )}
          {results.map((video) => {
            const videoId = video.youtube_id || (typeof video.id === 'string' ? video.id.replace(/^yt-/, '') : video.id)
            const isLiked = likedIds.has(videoId)

            return (
              <div
                key={videoId}
                onClick={() => handlePlay(video, results)}
                className="card-hover-3d flex items-center gap-3.5 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--card-border)] p-3 rounded-2xl cursor-pointer shadow-sm group"
              >
                <img
                  src={video.thumbnail || video.cover_url}
                  alt={video.title}
                  className="w-13 h-13 rounded-xl object-cover flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text-primary)] text-sm truncate group-hover:text-[var(--accent-color)] transition-colors">
                    {video.title}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{video.channel || video.artist}</p>
                </div>
                <button
                  onClick={(e) => toggleLike(e, video)}
                  className="p-2 hover:scale-110 active:scale-90 transition-transform"
                  title={isLiked ? 'Unlike' : 'Like'}
                >
                  <Heart
                    size={18}
                    fill={isLiked ? 'var(--accent-color)' : 'none'}
                    color={isLiked ? 'var(--accent-color)' : 'currentColor'}
                    className={isLiked ? '' : 'text-[var(--text-muted)]'}
                  />
                </button>
                <button className="btn-3d w-8 h-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white flex-shrink-0">
                  <Play size={13} fill="white" color="white" className="ml-0.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Recommended Songs */}
      <div className="mt-2">
        <div className="flex items-center gap-2 mb-3.5">
          <Sparkles size={18} className="text-[var(--accent-color)]" />
          <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
            {query.trim() === '' ? 'Recommended For You' : 'You Might Also Like'}
          </h2>
        </div>

        {loadingRecs && (
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--accent-color)]"></div>
            <span>Loading personalized songs...</span>
          </div>
        )}

        {!loadingRecs && recommendations.length === 0 && (
          <p className="text-[var(--text-muted)] text-sm bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--card-border)]">
            No recommendations yet. Start playing songs to build your profile!
          </p>
        )}

        <div className="flex flex-col gap-2.5">
          {recommendations.map((rec, idx) => {
            const song = rec.song
            const videoId = song.youtube_id
            const isLiked = likedIds.has(videoId)

            return (
              <div
                key={idx}
                onClick={() => handlePlay(song, recommendations)}
                className="card-hover-3d flex items-center gap-3.5 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--card-border)] p-3 rounded-2xl cursor-pointer shadow-sm group"
              >
                <img
                  src={song.cover_url || 'https://placehold.co/48x48/222/fff?text=%E2%99%AA'}
                  alt={song.title}
                  className="w-13 h-13 rounded-xl object-cover flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text-primary)] text-sm truncate group-hover:text-[var(--accent-color)] transition-colors">
                    {song.title}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {song.artist_name || song.artist} {rec.reason ? `• ${rec.reason}` : ''}
                  </p>
                </div>
                <button
                  onClick={(e) => toggleLike(e, song)}
                  className="p-2 hover:scale-110 active:scale-90 transition-transform"
                  title={isLiked ? 'Unlike' : 'Like'}
                >
                  <Heart
                    size={18}
                    fill={isLiked ? 'var(--accent-color)' : 'none'}
                    color={isLiked ? 'var(--accent-color)' : 'currentColor'}
                    className={isLiked ? '' : 'text-[var(--text-muted)]'}
                  />
                </button>
                <button className="btn-3d w-8 h-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white flex-shrink-0">
                  <Play size={13} fill="white" color="white" className="ml-0.5" />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}