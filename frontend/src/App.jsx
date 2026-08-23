import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import OfflineBanner from './components/Layout/OfflineBanner'
import ChatWidget from './components/Chatbot/ChatWidget'
import Navbar from './components/Layout/Navbar'
import MiniPlayer from './components/Layout/MiniPlayer'
import AudioEngine from './components/Player/AudioEngine'
import YoutubeAudioEngine from './components/Player/YoutubeAudioEngine'
import FullPlayer from './components/Player/FullPlayer'
import QuickPickCard from './components/Recommendation/QuickPickCard'
import Home from './pages/Home/Home'
import Search from './pages/Search/Search'
import Library from './pages/Library/Library'
import Stats from './pages/Stats/Stats'
import Profile from './pages/Profile/Profile'
import Onboarding from './pages/Onboarding/Onboarding'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'

export default function App() {
  const fetchUser = useAuthStore((s) => s.fetchUser)
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [theme])

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) fetchUser()
  }, [])

  return (
    <BrowserRouter>
      <OfflineBanner />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="pb-32 min-h-screen">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/stats" element={<Stats />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                </Routes>
              </div>
              <MiniPlayer />
              <FullPlayer />
              <ChatWidget />
              <QuickPickCard />
              <Navbar />
              <AudioEngine />
              <YoutubeAudioEngine />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}