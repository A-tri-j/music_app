import { useEffect, useState } from 'react'
import { User as UserIcon, Mail, Hash, ShieldCheck, LogOut, Sparkles, Sun, Moon, Palette, ArrowLeft } from 'lucide-react'
import api from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, fetchUser, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const navigate = useNavigate()
  const [personality, setPersonality] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchUser()
    api
      .get('/users/personality')
      .then((res) => setPersonality(res.data))
      .catch(() => {})
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  if (!user && loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-color)]"></div>
      </div>
    )
  }

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <div className="p-5 pt-6 pb-36 max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Top Header with Back Button */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="btn-3d w-10 h-10 rounded-2xl bg-[var(--bg-card)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer shadow-sm active:scale-95"
          title="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">My Profile</h1>
      </div>

      {/* Main Profile Card */}
      <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-[var(--accent-color)] flex items-center justify-center text-3xl font-bold text-white shadow-md">
            {userInitial}
          </div>

          {/* Title & Badge */}
          <div className="flex-1 text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{user?.name || 'Registered User'}</h2>
            <p className="text-sm text-[var(--accent-color)] font-medium">@{user?.username || 'username'}</p>
            <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="bg-[var(--accent-subtle)] text-[var(--accent-color)] text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 border border-[var(--accent-color)]/20">
                <ShieldCheck size={14} /> Active Account
              </span>
              <span className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs px-3 py-1 rounded-full font-medium border border-[var(--card-border)]">
                Role: {user?.role || 'USER'}
              </span>
            </div>
          </div>
        </div>

        <hr className="border-[var(--card-border)] my-6" />

        {/* Registered Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
          <div className="bg-[var(--bg-secondary)] p-3.5 rounded-xl border border-[var(--card-border)] flex items-center gap-3">
            <UserIcon size={18} className="text-[var(--accent-color)]" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Full Name</p>
              <p className="font-semibold text-[var(--text-primary)]">{user?.name || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] p-3.5 rounded-xl border border-[var(--card-border)] flex items-center gap-3">
            <Hash size={18} className="text-[var(--accent-color)]" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Username</p>
              <p className="font-semibold text-[var(--text-primary)]">@{user?.username || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] p-3.5 rounded-xl border border-[var(--card-border)] flex items-center gap-3 sm:col-span-2">
            <Mail size={18} className="text-[var(--accent-color)]" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Email Address</p>
              <p className="font-semibold text-[var(--text-primary)]">{user?.email || 'No email provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Theme / Appearance Selection */}
      <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
          <Palette size={18} className="text-[var(--accent-color)]" />
          <span>App Appearance & Theme</span>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Choose between our curated Dark Obsidian Sunset theme or the warm, aesthetic Sand Latte theme (no plain white).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Dark Mode Option */}
          <button
            onClick={() => setTheme('dark')}
            className={`card-hover-3d flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#251e33] border-[#ff6464] shadow-md ring-2 ring-[#ff6464]/30 text-white'
                : 'bg-[var(--bg-secondary)] border-[var(--card-border)] text-[var(--text-secondary)] opacity-75'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#12101b] border border-[#3d3153] flex items-center justify-center text-[#ff7b6b]">
              <Moon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white">Midnight Plum</p>
              <p className="text-xs text-[#9c95ab]">Coral pink & deep aubergine</p>
            </div>
            {theme === 'dark' && (
              <span className="w-3 h-3 rounded-full bg-[#ff6464] shadow-[0_0_8px_#ff6464]"></span>
            )}
          </button>

          {/* Glacier Sky Light Mode Option */}
          <button
            onClick={() => setTheme('light')}
            className={`card-hover-3d flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-[#c7d8e6] border-[#2563eb] shadow-md ring-2 ring-[#2563eb]/30 text-[#0f172a]'
                : 'bg-[var(--bg-secondary)] border-[var(--card-border)] text-[var(--text-secondary)] opacity-75'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#e6edf3] border border-[#b8ccdc] flex items-center justify-center text-[#2563eb]">
              <Sun size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[#0f172a]">Glacier Sky</p>
              <p className="text-xs text-[#475569]">Frosted slate & sapphire blue</p>
            </div>
            {theme === 'light' && (
              <span className="w-3 h-3 rounded-full bg-[#2563eb] shadow-[0_0_8px_#2563eb]"></span>
            )}
          </button>
        </div>
      </div>

      {/* Music Personality & Stats */}
      {personality && (
        <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[var(--accent-color)] text-xs font-semibold mb-2">
            <Sparkles size={16} />
            <span>Listening Overview</span>
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">{personality.title}</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--card-border)]">
              <p className="text-[11px] text-[var(--text-muted)]">Total Hours</p>
              <p className="text-sm font-bold text-[var(--text-primary)] mt-1">{personality.total_hours} hrs</p>
            </div>
            <div className="bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--card-border)]">
              <p className="text-[11px] text-[var(--text-muted)]">Top Artist</p>
              <p className="text-xs font-semibold text-[var(--accent-color)] mt-1 truncate">
                {personality.top_artist || 'N/A'}
              </p>
            </div>
            <div className="bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--card-border)]">
              <p className="text-[11px] text-[var(--text-muted)]">Top Genre</p>
              <p className="text-xs font-semibold text-[var(--accent-color)] mt-1 truncate">
                {personality.top_genre || 'N/A'}
              </p>
            </div>
            <div className="bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--card-border)]">
              <p className="text-[11px] text-[var(--text-muted)]">Top Song</p>
              <p className="text-xs font-semibold text-[var(--accent-color)] mt-1 truncate">
                {personality.top_song || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logout Action */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-6 py-3 rounded-2xl transition-all text-sm font-semibold w-full sm:w-auto justify-center active:scale-95 cursor-pointer"
        >
          <LogOut size={16} />
          <span>Logout Account</span>
        </button>
      </div>
    </div>
  )
}