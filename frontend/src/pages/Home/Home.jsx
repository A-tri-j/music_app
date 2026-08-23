import { useEffect, useState } from 'react'
import { Play, Menu, User, MoreVertical, Music, Sun, Moon, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { usePlayerStore } from '../../store/playerStore'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { saveOfflineData, getOfflineData, CACHE_KEYS } from '../../utils/offlineCache'
import SidebarDrawer from '../../components/Layout/SidebarDrawer'
import Footer from '../../components/Layout/Footer'

export default function Home() {
  const [recommendations, setRecommendations] = useState([])
  const [recentlyPlayed, setRecentlyPlayed] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const playSong = usePlayerStore((s) => s.playSong)
  const currentSong = usePlayerStore((s) => s.currentSong)
  const user = useAuthStore((s) => s.user)
  const { theme, toggleTheme } = useThemeStore()

  const loadHome = () => {
    Promise.all([
      api.get('/recommendations/for-you').catch(() => ({ data: [] })),
      api.get('/library/recently-played').catch(() => ({ data: null })),
    ]).then(([recRes, recentRes]) => {
      setRecommendations(recRes.data || [])

      if (recentRes.data) {
        setRecentlyPlayed(recentRes.data)
        saveOfflineData(CACHE_KEYS.RECENTLY_PLAYED, recentRes.data)
      } else {
        // Fallback to offline cache
        const cached = getOfflineData(CACHE_KEYS.RECENTLY_PLAYED)
        if (cached) setRecentlyPlayed(cached)
      }

      setLoading(false)
    })
  }

  useEffect(() => {
    loadHome()
  }, [])

  useEffect(() => {
    if (currentSong) {
      const timer = setTimeout(() => {
        api.get('/library/recently-played').then((res) => setRecentlyPlayed(res.data || [])).catch(() => { })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [currentSong])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const handlePlayRec = (rec) => {
    const song = rec.song
    const playableSong = {
      id: `yt-${song.youtube_id}`,
      title: song.title,
      cover_url: song.cover_url,
      source: 'youtube',
      youtube_id: song.youtube_id,
      artist_name: song.artist_name || song.artist,
    }
    const queue = recommendations.map((r) => ({
      id: `yt-${r.song.youtube_id}`,
      title: r.song.title,
      cover_url: r.song.cover_url,
      source: 'youtube',
      youtube_id: r.song.youtube_id,
      artist_name: r.song.artist_name || r.song.artist,
    }))
    playSong(playableSong, queue)
  }

  const handlePlayRecent = (song) => {
    const playableSong = {
      id: `yt-${song.youtube_id}`,
      title: song.title,
      cover_url: song.cover_url,
      source: 'youtube',
      youtube_id: song.youtube_id,
      artist_name: song.artist_name,
    }
    const queue = recentlyPlayed.map((s) => ({
      id: `yt-${s.youtube_id}`,
      title: s.title,
      cover_url: s.cover_url,
      source: 'youtube',
      youtube_id: s.youtube_id,
      artist_name: s.artist_name,
    }))
    playSong(playableSong, queue)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[var(--accent-color)]"></div>
      </div>
    )
  }

  const getArtistColor = (artistName = '') => {
    const name = (artistName || '').toLowerCase()
    const isLight = theme === 'light'

    if (isLight) {
      if (name.includes('anupam') || name.includes('roy')) {
        return {
          text: 'text-[#1d4ed8]',
          bg: 'bg-[#2563eb]',
          shadow: 'shadow-[0_4px_12px_rgba(37,99,235,0.3)]',
          color: '#2563eb',
          placeholderBg: 'bg-[#c5d8ea]',
        }
      }
      if (name.includes('rupam') || name.includes('islam')) {
        return {
          text: 'text-[#15803d]',
          bg: 'bg-[#16a34a]',
          shadow: 'shadow-[0_4px_12px_rgba(22,163,74,0.3)]',
          color: '#16a34a',
          placeholderBg: 'bg-[#c8dec9]',
        }
      }
      // Default Glacier Indigo for Light Theme
      return {
        text: 'text-[#4338ca]',
        bg: 'bg-[#4f46e5]',
        shadow: 'shadow-[0_4px_12px_rgba(79,70,229,0.3)]',
        color: '#4f46e5',
        placeholderBg: 'bg-[#cfd5f0]',
      }
    }

    // Dark Mode colors
    if (name.includes('anupam') || name.includes('roy')) {
      return {
        text: 'text-[#60a5fa]',
        bg: 'bg-[#5b8bf7]',
        shadow: 'shadow-[0_4px_12px_rgba(91,139,247,0.35)]',
        color: '#60a5fa',
        placeholderBg: 'bg-[#18233c]',
      }
    }
    if (name.includes('rupam') || name.includes('islam')) {
      return {
        text: 'text-[#4ade80]',
        bg: 'bg-[#68a67d]',
        shadow: 'shadow-[0_4px_12px_rgba(104,166,125,0.35)]',
        color: '#4ade80',
        placeholderBg: 'bg-[#1b2b22]',
      }
    }
    // Default Lavender/Amethyst for Dark Theme
    return {
      text: 'text-[#c084fc]',
      bg: 'bg-[#9d72e7]',
      shadow: 'shadow-[0_4px_12px_rgba(157,114,231,0.35)]',
      color: '#c084fc',
      placeholderBg: 'bg-[#231b36]',
    }
  }

  return (
    <div className="p-5 pt-6 pb-36 max-w-3xl mx-auto animate-slide-up">
      {/* Side Navigation Drawer */}
      <SidebarDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Top Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="w-10 h-10 rounded-2xl bg-[var(--bg-card)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            title="Open Side Menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
              {getGreeting()}, {user?.name || 'User'} 👋
            </h1>
            <p className="text-xs font-semibold text-[var(--accent-color)] tracking-wide mt-0.5 flex items-center gap-1">
              <Sparkles size={13} /> Made For You
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Working Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-2xl bg-[var(--bg-card)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-all duration-200 shadow-sm active:scale-90 cursor-pointer"
            title={theme === 'dark' ? 'Switch to Glacier Light Theme' : 'Switch to Cosmic Dark Theme'}
          >
            {theme === 'dark' ? (
              <Moon size={18} className="text-[#a78bfa] hover:rotate-12 transition-transform duration-300" />
            ) : (
              <Sun size={18} className="text-[#2563eb] hover:rotate-45 transition-transform duration-300" />
            )}
          </button>

          {/* Profile Button */}
          <Link
            to="/profile"
            className="w-10 h-10 rounded-2xl border border-[var(--card-border)] hover:border-[var(--accent-color)] flex items-center justify-center text-[var(--text-primary)] bg-[var(--bg-card)] transition shadow-sm active:scale-95"
            title="Profile"
          >
            <User size={18} />
          </Link>
        </div>
      </header>

      {/* Main Grid of Made For You Songs (10 Songs across 2 Columns) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3.5 mb-8">
        {recommendations.slice(0, 10).map((rec, idx) => {
          const song = rec.song
          const artistDisplay = song.artist_name || song.artist || 'Popular Artist'
          const artistTheme = getArtistColor(artistDisplay)

          return (
            <div
              key={idx}
              onClick={() => handlePlayRec(rec)}
              className="card-hover-3d relative flex items-center gap-2 sm:gap-3.5 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--card-border)] p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl cursor-pointer shadow-md group transition-all duration-200 min-w-0"
            >
              {/* Song Thumbnail or Stylized Theme Placeholder */}
              {song.cover_url ? (
                <img
                  src={song.cover_url}
                  alt={song.title}
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${artistTheme.placeholderBg} border border-[var(--card-border)] flex items-center justify-center flex-shrink-0 ${artistTheme.text} shadow-sm`}>
                  <Music size={18} className="sm:hidden" />
                  <Music size={22} className="hidden sm:block" />
                </div>
              )}

              {/* Title & Details */}
              <div className="flex-1 min-w-0 pr-7 sm:pr-9">
                <h3 className="font-semibold text-[11px] sm:text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--accent-color)] transition-colors leading-tight">
                  {song.title}
                </h3>
                <p className="text-[9px] sm:text-[11px] text-[var(--text-muted)] truncate mt-0.5 font-medium">
                  Because you like
                </p>
                <p className={`text-[9px] sm:text-[11px] ${artistTheme.text} font-bold truncate`}>
                  {artistDisplay}
                </p>
              </div>

              {/* Top-Right Menu / Options */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                }}
                className="absolute top-1.5 sm:top-3 right-1.5 sm:right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 sm:p-1 transition"
                title="Options"
              >
                <MoreVertical size={13} className="sm:hidden" />
                <MoreVertical size={16} className="hidden sm:block" />
              </button>

              {/* Center-Right Play Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePlayRec(rec)
                }}
                className={`btn-3d absolute top-1/2 -translate-y-1/2 right-2 sm:right-3.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full ${artistTheme.bg} flex items-center justify-center text-white ${artistTheme.shadow}`}
                title="Play"
              >
                <Play size={10} fill="white" color="white" className="ml-0.5 sm:hidden" />
                <Play size={13} fill="white" color="white" className="ml-0.5 hidden sm:block" />
              </button>

              {/* Bottom-Right 3-Bar Equalizer Audio Indicator */}
              <div className="absolute bottom-1.5 sm:bottom-2.5 right-2 sm:right-3.5 flex items-end gap-0.5 pointer-events-none opacity-85">
                <span className="w-0.5 h-1.5 rounded-full" style={{ backgroundColor: artistTheme.color }}></span>
                <span className="w-0.5 h-3 rounded-full" style={{ backgroundColor: artistTheme.color }}></span>
                <span className="w-0.5 h-2 rounded-full" style={{ backgroundColor: artistTheme.color }}></span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Curated Mixes & Themed Playlists Section (5 Curated Playlists) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--accent-color)]" />
            <span>Featured Playlists & Mixes</span>
          </h2>
          <span className="text-xs text-[var(--text-muted)] font-medium">5 Curated Mixes</span>
        </div>

        <div className="flex gap-3.5 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {[
            {
              title: 'Bengali Top Hits',
              subtitle: 'Anupam, Rupam & Arijit',
              cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
              songs: [
                { id: 'yt-gEmahl1XMB0', youtube_id: 'gEmahl1XMB0', title: 'Boba Tunnel', artist_name: 'Anupam Roy', cover_url: 'https://i.ytimg.com/vi/gEmahl1XMB0/hqdefault.jpg', source: 'youtube' },
                { id: 'yt-hB37g6k0hG8', youtube_id: 'hB37g6k0hG8', title: 'Benche Thakar Gaan', artist_name: 'Rupam Islam', cover_url: 'https://i.ytimg.com/vi/hB37g6k0hG8/hqdefault.jpg', source: 'youtube' },
                { id: 'yt-q86g6q1g4bE', youtube_id: 'q86g6q1g4bE', title: 'Amake Amar Moto Thakte Dao', artist_name: 'Anupam Roy', cover_url: 'https://i.ytimg.com/vi/q86g6q1g4bE/hqdefault.jpg', source: 'youtube' },
                { id: 'yt-rTzYg_a_oM0', youtube_id: 'rTzYg_a_oM0', title: 'Tumi Jake Bhalobaso', artist_name: 'Anupam Roy', cover_url: 'https://i.ytimg.com/vi/rTzYg_a_oM0/hqdefault.jpg', source: 'youtube' },
              ],
            },
            {
              title: 'Bollywood Romance',
              subtitle: 'Soulful love anthems',
              cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
              songs: [
                { id: 'yt-Umqb9KENgmk', youtube_id: 'Umqb9KENgmk', title: 'Tum Hi Ho', artist_name: 'Arijit Singh', cover_url: 'https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg', source: 'youtube' },
                { id: 'yt-BddP6PYo2gs', youtube_id: 'BddP6PYo2gs', title: 'Kesariya', artist_name: 'Arijit Singh', cover_url: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg', source: 'youtube' },
                { id: 'yt-qZX_AylI9VQ', youtube_id: 'qZX_AylI9VQ', title: 'Channa Mereya', artist_name: 'Arijit Singh', cover_url: 'https://i.ytimg.com/vi/qZX_AylI9VQ/hqdefault.jpg', source: 'youtube' },
                { id: 'yt-sK7riqg2mr4', youtube_id: 'sK7riqg2mr4', title: 'Agar Tum Saath Ho', artist_name: 'Alka Yagnik', cover_url: 'https://i.ytimg.com/vi/sK7riqg2mr4/hqdefault.jpg', source: 'youtube' },
              ],
            },
            {
              title: 'Late Night Acoustic',
              subtitle: 'Peaceful acoustic vibes',
              cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
              songs: [
                { id: 'yt-dWqb-WqbGh8', youtube_id: 'dWqb-WqbGh8', title: 'O Sanam', artist_name: 'Lucky Ali', cover_url: 'https://i.ytimg.com/vi/dWqb-WqbGh8/hqdefault.jpg', source: 'youtube' },
                { id: 'yt-cYOB941gyXI', youtube_id: 'cYOB941gyXI', title: 'Hawayein', artist_name: 'Arijit Singh', cover_url: 'https://i.ytimg.com/vi/cYOB941gyXI/hqdefault.jpg', source: 'youtube' },
                { id: 'yt-TBCgM1qGvhw', youtube_id: 'TBCgM1qGvhw', title: 'Shayad', artist_name: 'Arijit Singh', cover_url: 'https://i.ytimg.com/vi/TBCgM1qGvhw/hqdefault.jpg', source: 'youtube' },
              ],
            },
            {
              title: 'Rock & Energy',
              subtitle: 'Bengali rock & high beats',
              cover_url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop&q=80',
              songs: [
                { id: 'yt-4jZp2Yq6y18', youtube_id: '4jZp2Yq6y18', title: 'Prem Tomake Dilam', artist_name: 'Rupam Islam', cover_url: 'https://i.ytimg.com/vi/4jZp2Yq6y18/hqdefault.jpg', source: 'youtube' },
                { id: 'yt-VOLKJJvfAbg', youtube_id: 'VOLKJJvfAbg', title: 'Bekhayali', artist_name: 'Kabir Singh', cover_url: 'https://i.ytimg.com/vi/VOLKJJvfAbg/hqdefault.jpg', source: 'youtube' },
                { id: 'yt-hB37g6k0hG8', youtube_id: 'hB37g6k0hG8', title: 'Benche Thakar Gaan', artist_name: 'Rupam Islam', cover_url: 'https://i.ytimg.com/vi/hB37g6k0hG8/hqdefault.jpg', source: 'youtube' },
              ],
            },
            {
              title: 'Retro & Soul Classics',
              subtitle: 'Timeless soulful gems',
              cover_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80',
              songs: [
                { id: 'yt-lpdRqn6xOzo', youtube_id: 'lpdRqn6xOzo', title: 'Zaalima', artist_name: 'Arijit Singh', cover_url: 'https://i.ytimg.com/vi/lpdRqn6xOzo/hqdefault.jpg', source: 'youtube' },
                { id: 'yt-z-diRlyLGzo', youtube_id: 'z-diRlyLGzo', title: 'Raabta', artist_name: 'Arijit Singh', cover_url: 'https://i.ytimg.com/vi/z-diRlyLGzo/hqdefault.jpg', source: 'youtube' },
                { id: 'yt-95I5VaR7GeU', youtube_id: '95I5VaR7GeU', title: 'Khairiyat', artist_name: 'Arijit Singh', cover_url: 'https://i.ytimg.com/vi/95I5VaR7GeU/hqdefault.jpg', source: 'youtube' },
                { id: 'yt-Grr0FlC8SQA', youtube_id: 'Grr0FlC8SQA', title: 'Kalank Title Track', artist_name: 'Arijit Singh', cover_url: 'https://i.ytimg.com/vi/Grr0FlC8SQA/hqdefault.jpg', source: 'youtube' },
              ],
            },
          ].map((mix, idx) => (
            <div
              key={idx}
              onClick={() => playSong(mix.songs[0], mix.songs)}
              className="card-hover-3d flex-shrink-0 w-36 sm:w-40 bg-[var(--bg-card)] border border-[var(--card-border)] p-3 rounded-2xl cursor-pointer shadow-sm group"
            >
              <div className="relative overflow-hidden rounded-xl aspect-square mb-2.5">
                <img
                  src={mix.cover_url}
                  alt={mix.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300 shadow-md"
                />
                <button className="btn-3d absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Play size={13} fill="white" color="white" className="ml-0.5" />
                </button>
              </div>
              <h4 className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-color)] transition">
                {mix.title}
              </h4>
              <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{mix.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Played Section */}
      {recentlyPlayed.length > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <span>Recently Played</span>
          </h2>
          <div className="flex gap-3.5 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-hide">
            {recentlyPlayed.map((song, idx) => (
              <div
                key={idx}
                onClick={() => handlePlayRecent(song)}
                className="card-hover-3d flex-shrink-0 w-28 cursor-pointer group"
              >
                <div className="relative overflow-hidden rounded-xl bg-[var(--bg-card)] border border-[var(--card-border)] shadow-sm">
                  <img
                    src={song.cover_url || 'https://placehold.co/112x112/222/fff?text=%E2%99%AA'}
                    alt={song.title}
                    className="w-28 h-28 rounded-xl object-cover shadow-md group-hover:scale-105 transition duration-300"
                  />
                  <button className="btn-3d absolute bottom-2 right-2 bg-[var(--accent-color)] rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Play size={12} fill="white" color="white" className="ml-0.5" />
                  </button>
                </div>
                <p className="text-xs font-medium text-[var(--text-primary)] mt-1.5 truncate">{song.title}</p>
                <p className="text-[11px] text-[var(--text-muted)] truncate">{song.artist_name || ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Professional Footer */}
      <Footer />
    </div>
  )
}