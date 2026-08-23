import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Heart, ListMusic, Plus, Music, Sparkles, ArrowLeft } from 'lucide-react'
import api from '../../services/api'
import { usePlayerStore } from '../../store/playerStore'
import { saveOfflineData, getOfflineData, CACHE_KEYS } from '../../utils/offlineCache'
import Footer from '../../components/Layout/Footer'

export default function Library() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('liked')
  const [likedSongs, setLikedSongs] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [playlistName, setPlaylistName] = useState('')
  const [loading, setLoading] = useState(true)
  const playSong = usePlayerStore((s) => s.playSong)

  const loadData = () => {
    setLoading(true)
    api
      .get('/library/likes')
      .then((res) => {
        setLikedSongs(res.data || [])
        saveOfflineData(CACHE_KEYS.LIKED_SONGS, res.data || [])
      })
      .catch(() => {
        const cached = getOfflineData(CACHE_KEYS.LIKED_SONGS)
        if (cached) setLikedSongs(cached)
      })
      .finally(() => setLoading(false))

    api
      .get('/library/playlists')
      .then((res) => setPlaylists(res.data || []))
      .catch(() => {})
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) return
    await api.post('/library/playlists', { name: playlistName })
    setPlaylistName('')
    loadData()
  }

  const handlePlay = (song) => {
    const playableSong = {
      id: `yt-${song.youtube_id}`,
      title: song.title,
      cover_url: song.cover_url,
      source: 'youtube',
      youtube_id: song.youtube_id,
      artist_name: song.artist_name,
    }
    const queue = likedSongs.map((s) => ({
      id: `yt-${s.youtube_id}`,
      title: s.title,
      cover_url: s.cover_url,
      source: 'youtube',
      youtube_id: s.youtube_id,
      artist_name: s.artist_name,
    }))
    playSong(playableSong, queue)
  }

  return (
    <div className="p-5 pt-6 pb-36 max-w-3xl mx-auto animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-3d w-10 h-10 rounded-2xl bg-[var(--bg-card)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer shadow-sm active:scale-95"
          title="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Your Library</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Saved tracks, favorites & custom playlists</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 border-b border-[var(--card-border)] pb-3">
        <button
          onClick={() => setActiveTab('liked')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'liked'
              ? 'bg-[var(--accent-color)] text-white shadow-md'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Heart size={16} fill={activeTab === 'liked' ? 'white' : 'none'} />
          <span>Liked Songs ({likedSongs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'playlists'
              ? 'bg-[var(--accent-color)] text-white shadow-md'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <ListMusic size={16} />
          <span>Playlists ({playlists.length})</span>
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-color)]"></div>
        </div>
      )}

      {/* Tab 1: Liked Songs */}
      {!loading && activeTab === 'liked' && (
        <div>
          {likedSongs.length === 0 ? (
            <div className="text-center py-12 bg-[var(--bg-card)] rounded-2xl border border-[var(--card-border)] p-6">
              <Heart size={36} className="mx-auto text-[var(--text-muted)] mb-2" />
              <p className="font-semibold text-[var(--text-primary)]">No liked songs yet</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Tap the heart icon on any track to save it here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {likedSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => handlePlay(song)}
                  className="card-hover-3d flex items-center gap-3.5 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--card-border)] p-3 rounded-2xl cursor-pointer shadow-sm group"
                >
                  <img
                    src={song.cover_url || 'https://placehold.co/48x48/222/fff?text=%E2%99%AA'}
                    alt={song.title}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-sm group-hover:scale-105 transition duration-300"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--accent-color)] transition">
                      {song.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{song.artist_name}</p>
                  </div>
                  <button className="btn-3d w-8 h-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white flex-shrink-0">
                    <Play size={13} fill="white" color="white" className="ml-0.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Playlists */}
      {!loading && activeTab === 'playlists' && (
        <div className="space-y-4">
          <div className="flex gap-2.5">
            <input
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Create new playlist..."
              className="flex-1 bg-[var(--bg-card)] rounded-2xl px-4 py-3 outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--card-border)] focus:border-[var(--accent-color)] shadow-sm transition"
            />
            <button
              onClick={handleCreatePlaylist}
              className="btn-3d bg-[var(--accent-color)] text-white px-5 rounded-2xl text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus size={16} />
              <span>Create</span>
            </button>
          </div>

          {playlists.length === 0 ? (
            <div className="text-center py-12 bg-[var(--bg-card)] rounded-2xl border border-[var(--card-border)] p-6">
              <ListMusic size={36} className="mx-auto text-[var(--text-muted)] mb-2" />
              <p className="font-semibold text-[var(--text-primary)]">No playlists created yet</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Enter a playlist title above to organize your music</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  className="card-hover-3d flex items-center gap-3.5 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] p-4 rounded-2xl border border-[var(--card-border)] shadow-sm cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent-color)] flex-shrink-0">
                    <Music size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{pl.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{pl.description || 'Playlist'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Professional Footer */}
      <Footer />
    </div>
  )
}