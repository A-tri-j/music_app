import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Clock, Music2, Mic2, Disc, Play, Sparkles, Flame, RefreshCw, ArrowLeft } from 'lucide-react'
import api from '../../services/api'
import { usePlayerStore } from '../../store/playerStore'
import { formatTime } from '../../utils/formatTime'
import { searchYoutubeSongs } from '../../services/youtube'

export default function Stats() {
  const navigate = useNavigate()
  const [dailyStats, setDailyStats] = useState(null)
  const [weeklyStats, setWeeklyStats] = useState([])
  const [personality, setPersonality] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const playSong = usePlayerStore((s) => s.playSong)

  useEffect(() => {
    fetchStatsData()
  }, [])

  const fetchStatsData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const [dailyRes, weeklyRes, personalityRes, recsRes] = await Promise.all([
        api.get('/analytics/stats/daily').catch(() => ({ data: null })),
        api.get('/analytics/stats/weekly').catch(() => ({ data: [] })),
        api.get('/users/personality').catch(() => ({ data: null })),
        api.get('/recommendations/for-you').catch(() => ({ data: [] })),
      ])

      setDailyStats(dailyRes.data)
      setWeeklyStats(weeklyRes.data || [])
      setPersonality(personalityRes.data)
      setRecommendations(recsRes.data || [])
    } catch (err) {
      console.error('Failed to load stats data from backend', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handlePlayRec = async (recItem) => {
    const song = recItem.song
    if (song.audio_url) {
      const playlist = recommendations.map((item) => item.song)
      playSong(song, playlist)
      return
    }

    try {
      const results = await searchYoutubeSongs(`${song.title} ${song.artist_name || ''}`)
      if (results.length > 0) {
        const video = results[0]
        const playableSong = {
          id: video.id || `yt-${video.youtube_id}`,
          title: video.title,
          cover_url: video.thumbnail || video.cover_url,
          source: 'youtube',
          youtube_id: video.youtube_id || (typeof video.id === 'string' ? video.id.replace(/^yt-/, '') : video.id),
          artist_name: video.channel || song.artist_name || 'Unknown Artist',
        }
        const playlist = [playableSong]
        playSong(playableSong, playlist)
      }
    } catch (err) {
      console.error('Failed to play recommended YouTube song', err)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  // Calculate maximum weekly seconds for chart scaling
  const maxWeeklySeconds = Math.max(...weeklyStats.map((w) => w.total_seconds || 0), 1)

  return (
    <div className="p-5 pt-6 pb-36 max-w-3xl mx-auto space-y-6 animate-slide-up">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn-3d w-10 h-10 rounded-2xl bg-[var(--bg-card)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer shadow-sm active:scale-95"
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              <BarChart3 className="text-[var(--accent-color)]" size={22} />
              <span>Listening Stats</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Real-time statistics & listening analytics</p>
          </div>
        </div>

        <button
          onClick={() => fetchStatsData(true)}
          disabled={refreshing}
          className="p-2.5 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] rounded-2xl transition border border-[var(--card-border)] cursor-pointer disabled:opacity-50 shadow-sm active:scale-95"
          title="Refresh Stats"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin text-[var(--accent-color)]' : ''} />
        </button>
      </div>

      {/* Daily Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-hover-3d bg-[var(--bg-card)] border border-[var(--card-border)] p-4 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium">Today's Time</span>
            <Clock size={16} className="text-[var(--accent-color)]" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            {dailyStats ? formatTime(dailyStats.total_seconds || 0) : '0:00'}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Total played today</p>
        </div>

        <div className="card-hover-3d bg-[var(--bg-card)] border border-[var(--card-border)] p-4 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium">Songs Played</span>
            <Music2 size={16} className="text-[var(--accent-color)]" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{dailyStats?.songs_played || 0}</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Sessions started</p>
        </div>

        <div className="card-hover-3d bg-[var(--bg-card)] border border-[var(--card-border)] p-4 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium">Artists Explored</span>
            <Mic2 size={16} className="text-[var(--accent-color)]" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{dailyStats?.unique_artists || 0}</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Unique artists</p>
        </div>

        <div className="card-hover-3d bg-[var(--bg-card)] border border-[var(--card-border)] p-4 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium">Genres Listened</span>
            <Disc size={16} className="text-[var(--accent-color)]" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{dailyStats?.unique_genres || 0}</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Unique genres</p>
        </div>
      </div>

      {/* Weekly Activity Bar Chart */}
      <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-[var(--text-primary)] mb-0.5 flex items-center gap-2">
          <Flame className="text-[var(--accent-color)]" size={18} />
          <span>7-Day Listening Trend</span>
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-6">Daily playback duration for the past 7 days</p>

        {weeklyStats.length > 0 ? (
          <div className="flex items-end justify-between gap-2.5 h-44 pt-6 px-2">
            {weeklyStats.map((item, index) => {
              const heightPercent = Math.max(
                Math.round(((item.total_seconds || 0) / maxWeeklySeconds) * 100),
                8
              )
              const mins = ((item.total_seconds || 0) / 60).toFixed(1)
              const dateLabel = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition font-mono">
                    {mins}m
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[34px] bg-[var(--accent-color)] rounded-t-xl transition-all duration-300 group-hover:brightness-110 shadow-sm"
                  ></div>
                  <span className="text-xs text-[var(--text-muted)] mt-1 font-medium">{dateLabel}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-[var(--text-muted)] text-sm">No weekly listening trend data available yet</div>
        )}
      </div>

      {/* Music Personality Insight */}
      {personality && (
        <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[var(--accent-color)] text-xs font-semibold mb-2">
            <Sparkles size={16} />
            <span>Music Personality Archetype</span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">{personality.title}</h2>
          <p className="text-xs text-[var(--text-muted)] mb-5">{personality.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="bg-[var(--bg-secondary)] border border-[var(--card-border)] p-3 rounded-xl">
              <p className="text-[11px] text-[var(--text-muted)]">Total Hours</p>
              <p className="text-sm font-bold text-[var(--text-primary)] mt-1">{personality.total_hours} hrs</p>
            </div>
            <div className="bg-[var(--bg-secondary)] border border-[var(--card-border)] p-3 rounded-xl">
              <p className="text-[11px] text-[var(--text-muted)]">Top Artist</p>
              <p className="text-xs font-semibold text-[var(--accent-color)] mt-1 truncate">
                {personality.top_artist || 'N/A'}
              </p>
            </div>
            <div className="bg-[var(--bg-secondary)] border border-[var(--card-border)] p-3 rounded-xl">
              <p className="text-[11px] text-[var(--text-muted)]">Top Genre</p>
              <p className="text-xs font-semibold text-[var(--accent-color)] mt-1 truncate">
                {personality.top_genre || 'N/A'}
              </p>
            </div>
            <div className="bg-[var(--bg-secondary)] border border-[var(--card-border)] p-3 rounded-xl">
              <p className="text-[11px] text-[var(--text-muted)]">Top Song</p>
              <p className="text-xs font-semibold text-[var(--accent-color)] mt-1 truncate">
                {personality.top_song || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations For You */}
      {recommendations.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-[var(--text-primary)] mb-3.5 flex items-center gap-2">
            <Sparkles className="text-[var(--accent-color)]" size={18} />
            <span>Recommended For You (AI Insights)</span>
          </h2>

          <div className="flex flex-col gap-2.5">
            {recommendations.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handlePlayRec(item)}
                className="card-hover-3d flex items-center gap-3.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] p-3 rounded-2xl cursor-pointer transition border border-[var(--card-border)] group"
              >
                {item.song.cover_url ? (
                  <img
                    src={item.song.cover_url}
                    alt={item.song.title}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-card)] border border-[var(--card-border)] flex items-center justify-center text-sm flex-shrink-0">
                    🎵
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text-primary)] text-sm truncate group-hover:text-[var(--accent-color)] transition-colors">
                    {item.song.title}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{item.reason}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-[var(--accent-color)] bg-[var(--accent-subtle)] border border-[var(--accent-color)]/20 px-2.5 py-1 rounded-full font-mono font-medium">
                    {Math.round((item.score || 0) * 100)}%
                  </span>
                  <button className="btn-3d w-8 h-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white flex-shrink-0">
                    <Play size={13} fill="white" color="white" className="ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}