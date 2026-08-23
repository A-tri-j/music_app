import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Home,
  Search,
  Library,
  BarChart3,
  User,
  X,
  LogOut,
  Sparkles,
  MessageCircle,
  Sun,
  Moon,
  ShieldCheck,
  ChevronRight,
  Music,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useChatStore } from '../../store/chatStore'

export default function SidebarDrawer({ isOpen, onClose }) {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const toggleChat = useChatStore((s) => s.toggleChat)
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/login', { replace: true })
  }

  const handleOpenChat = () => {
    onClose()
    toggleChat()
  }

  if (!isOpen) return null

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      />

      {/* Drawer content */}
      <aside className="relative z-10 w-[290px] sm:w-[320px] max-w-[85vw] h-full bg-[var(--bg-card)] border-r border-[var(--card-border)] shadow-2xl flex flex-col justify-between p-5 overflow-y-auto animate-slide-right">
        {/* Top Header & User Info */}
        <div>
          {/* Close button & Brand title */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)] mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-color)] flex items-center justify-center text-white shadow-md">
                <Music size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">MusicAI Platform</h3>
                <p className="text-[10px] text-[var(--text-muted)]">Smart Streamer</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition active:scale-90 cursor-pointer"
              title="Close Menu"
            >
              <X size={16} />
            </button>
          </div>

          {/* User Profile Card */}
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--card-border)] rounded-2xl mb-6 transition group"
          >
            <div className="w-11 h-11 rounded-xl bg-[var(--accent-color)] flex items-center justify-center text-white font-bold text-base shadow-sm">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs text-[var(--text-primary)] truncate group-hover:text-[var(--accent-color)] transition">
                {user?.name || 'My Account'}
              </p>
              <p className="text-[11px] text-[var(--accent-color)] truncate font-medium">
                @{user?.username || 'username'}
              </p>
            </div>
            <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 mb-2">
              Navigation
            </p>

            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition group"
            >
              <Home size={17} className="text-[var(--accent-color)] group-hover:scale-110 transition-transform" />
              <span>Home Feed</span>
            </Link>

            <Link
              to="/search"
              onClick={onClose}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition group"
            >
              <Search size={17} className="text-[var(--accent-color)] group-hover:scale-110 transition-transform" />
              <span>Search & Discover</span>
            </Link>

            <Link
              to="/library"
              onClick={onClose}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition group"
            >
              <Library size={17} className="text-[var(--accent-color)] group-hover:scale-110 transition-transform" />
              <span>Your Library & Playlists</span>
            </Link>

            <Link
              to="/stats"
              onClick={onClose}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition group"
            >
              <BarChart3 size={17} className="text-[var(--accent-color)] group-hover:scale-110 transition-transform" />
              <span>Listening Analytics</span>
            </Link>

            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition group"
            >
              <User size={17} className="text-[var(--accent-color)] group-hover:scale-110 transition-transform" />
              <span>Account & Settings</span>
            </Link>
          </div>

          {/* Verified Platform Capabilities & Features */}
          <div className="mt-5 pt-4 border-t border-[var(--card-border)] space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 mb-1">
              Platform Features & Tools
            </p>

            {/* 1. Listening Time & Stats */}
            <Link
              to="/stats"
              onClick={onClose}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--card-border)] transition group"
            >
              <div className="w-7 h-7 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent-color)] flex-shrink-0 mt-0.5">
                <BarChart3 size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition">
                  Listening Time & Analytics
                </p>
                <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
                  Track daily listening time & weekly trend stats in real-time
                </p>
              </div>
            </Link>

            {/* 2. Custom Playlist Creator */}
            <Link
              to="/library"
              onClick={onClose}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--card-border)] transition group"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
                <Library size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-[var(--text-primary)] group-hover:text-purple-400 transition">
                  Custom Playlist Creator
                </p>
                <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
                  Create personal playlists and save your favorite music
                </p>
              </div>
            </Link>

            {/* 3. AI Music Assistant */}
            <button
              onClick={handleOpenChat}
              className="w-full flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--card-border)] transition text-left cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-pink-500/15 flex items-center justify-center text-pink-400 flex-shrink-0 mt-0.5">
                <MessageCircle size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-[var(--text-primary)] group-hover:text-pink-400 transition flex items-center justify-between">
                  <span>AI Smart Chatbot</span>
                  <span className="text-[9px] bg-[var(--accent-subtle)] text-[var(--accent-color)] px-1.5 py-0.2 rounded font-bold">LIVE</span>
                </p>
                <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
                  Ask for mood songs, lyrics, and personalized suggestions
                </p>
              </div>
            </button>

            {/* 4. Offline Backup & PWA */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)]">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                <ShieldCheck size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-[var(--text-primary)]">
                  Offline Cache & Backup
                </p>
                <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
                  Local-first offline browsing & Service Worker cache active
                </p>
              </div>
            </div>

            {/* 5. Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--card-border)] text-xs font-semibold text-[var(--text-primary)] transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {theme === 'dark' ? <Moon size={15} className="text-[#a78bfa]" /> : <Sun size={15} className="text-[#2563eb]" />}
                <span>Theme: {theme === 'dark' ? 'Cosmic Dark' : 'Glacier Light'}</span>
              </div>
              <span className="text-[10px] text-[var(--accent-color)] font-bold">Switch</span>
            </button>
          </div>
        </div>

        {/* Footer & Logout */}
        <div className="pt-6 border-t border-[var(--card-border)] mt-6 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full btn-3d flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95"
          >
            <LogOut size={15} />
            <span>Logout Account</span>
          </button>
          <p className="text-[10px] text-center text-[var(--text-muted)] font-medium">
            Architected & Developed by Atrij Ghosh • 2026
          </p>
        </div>
      </aside>
    </div>
  )
}
