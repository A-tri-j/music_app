import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Music, User, Mail, Lock, Sparkles, Sun, Moon, ArrowRight, Heart, Globe2 } from 'lucide-react'
import api from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'

const LANGUAGE_OPTIONS = ['Bengali', 'Hindi', 'English', 'Punjabi', 'Tamil']
const ARTIST_OPTIONS = [
  'Arijit Singh', 'Rupam Islam', 'Anupam Roy', 'Shreya Ghoshal', 'Nusrat Fateh Ali Khan',
  'Pritam', 'Lucky Ali', 'KK', 'Sonu Nigam', 'Armaan Malik',
]

export default function Register() {
  const [form, setForm] = useState({
    name: '', username: '', email: '', password: '', age: '', favorite_genre: '',
  })
  const [selectedLanguages, setSelectedLanguages] = useState([])
  const [selectedArtists, setSelectedArtists] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const toggleLanguage = (lang) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(lang)) return prev.filter((l) => l !== lang)
      if (prev.length >= 3) return prev
      return [...prev, lang]
    })
  }

  const toggleArtist = (artist) => {
    setSelectedArtists((prev) => {
      if (prev.includes(artist)) return prev.filter((a) => a !== artist)
      if (prev.length >= 5) return prev
      return [...prev, artist]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register', {
        ...form,
        age: form.age ? Number(form.age) : null,
        favorite_languages: selectedLanguages,
        favorite_artists: selectedArtists,
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between p-4 sm:p-6 transition-colors duration-300">
      {/* Top Header with Brand & Working Theme Toggle */}
      <header className="max-w-lg w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent-color)] flex items-center justify-center text-white shadow-md">
            <Music size={20} />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-[var(--text-primary)] block">MusicAI</span>
            <span className="text-[10px] text-[var(--accent-color)] font-semibold tracking-wider uppercase block">Smart Stream</span>
          </div>
        </div>

        {/* Working Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="btn-3d w-10 h-10 rounded-2xl bg-[var(--bg-card)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer shadow-sm active:scale-90"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? (
            <Moon size={18} className="text-[#a78bfa] hover:rotate-12 transition-transform" />
          ) : (
            <Sun size={18} className="text-[#2563eb] hover:rotate-45 transition-transform" />
          )}
        </button>
      </header>

      {/* Main Register Card */}
      <main className="max-w-lg w-full mx-auto my-auto py-6 animate-slide-up">
        <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 flex items-center justify-center gap-1">
              <Sparkles size={14} className="text-[var(--accent-color)]" />
              <span>Join MusicAI & personalize your music experience</span>
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)] block pl-1">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    name="name"
                    placeholder="Your Full Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-2xl pl-9 pr-3.5 py-3 text-xs sm:text-sm outline-none border border-[var(--card-border)] focus:border-[var(--accent-color)] transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)] block pl-1">Username</label>
                <input
                  name="username"
                  placeholder="e.g. atrij_ghosh"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-2xl px-3.5 py-3 text-xs sm:text-sm outline-none border border-[var(--card-border)] focus:border-[var(--accent-color)] transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)] block pl-1">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-2xl pl-9 pr-3.5 py-3 text-xs sm:text-sm outline-none border border-[var(--card-border)] focus:border-[var(--accent-color)] transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)] block pl-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-2xl pl-9 pr-3.5 py-3 text-xs sm:text-sm outline-none border border-[var(--card-border)] focus:border-[var(--accent-color)] transition-all shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Favorite Languages Chips */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 pl-1">
                <Globe2 size={14} className="text-[var(--accent-color)]" />
                <span>Favorite Languages (Pick up to 3)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => {
                  const isSelected = selectedLanguages.includes(lang)
                  return (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-md'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--card-border)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {lang}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Favorite Artists Chips */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 pl-1">
                <Heart size={14} className="text-[var(--accent-color)]" />
                <span>Favorite Artists (Pick up to 5)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ARTIST_OPTIONS.map((artist) => {
                  const isSelected = selectedArtists.includes(artist)
                  return (
                    <button
                      type="button"
                      key={artist}
                      onClick={() => toggleArtist(artist)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-md'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--card-border)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {artist}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-3d w-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-60 text-sm active:scale-95"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Redirect */}
          <div className="mt-6 pt-5 border-t border-[var(--card-border)] text-center">
            <p className="text-xs text-[var(--text-muted)]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[var(--accent-color)] font-bold hover:underline ml-1 inline-flex items-center"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-2 text-[10px] text-[var(--text-muted)]">
        MusicAI Platform • Instant 30-Day Session
      </footer>
    </div>
  )
}