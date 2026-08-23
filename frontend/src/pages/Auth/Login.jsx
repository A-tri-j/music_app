import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Music, Lock, User, Eye, EyeOff, Sparkles, Sun, Moon, ArrowRight } from 'lucide-react'
import api from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, isAuthenticated } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', {
        username: username.trim(),
        login: username.trim(),
        password,
      })
      localStorage.setItem('access_token', res.data.access_token)

      const meRes = await api.get('/auth/me')
      setUser(meRes.data)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-between p-4 sm:p-6 transition-colors duration-300">
      {/* Top Header with Brand & Working Theme Toggle */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between py-2">
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

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto py-6 animate-slide-up">
        <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 flex items-center justify-center gap-1">
              <Sparkles size={14} className="text-[var(--accent-color)]" />
              <span>Log in to your personalized music stream</span>
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-primary)] block pl-1">
                Username or Email
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter your username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-2xl pl-10 pr-4 py-3.5 text-sm outline-none border border-[var(--card-border)] focus:border-[var(--accent-color)] transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-primary)] block pl-1">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-2xl pl-10 pr-11 py-3.5 text-sm outline-none border border-[var(--card-border)] focus:border-[var(--accent-color)] transition-all shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-3d w-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-60 text-sm active:scale-95"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Registration Redirect */}
          <div className="mt-6 pt-5 border-t border-[var(--card-border)] text-center">
            <p className="text-xs text-[var(--text-muted)]">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-[var(--accent-color)] font-bold hover:underline ml-1 inline-flex items-center"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-2 text-[10px] text-[var(--text-muted)]">
        MusicAI Platform • 30-Day Persistent Login Active
      </footer>
    </div>
  )
}