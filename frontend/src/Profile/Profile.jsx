import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function Profile() {
  const [personality, setPersonality] = useState(null)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/users/personality').then((res) => setPersonality(res.data)).catch(() => {})
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="bg-neutral-900 rounded-xl p-5 mb-6">
        <p className="text-xl font-semibold">{user?.name}</p>
        <p className="text-gray-400 text-sm">@{user?.username}</p>
      </div>

      {personality && (
        <div className="bg-gradient-to-br from-green-600 to-neutral-900 rounded-xl p-5 mb-6">
          <p className="text-xs text-gray-300 uppercase tracking-wide">Your Music Personality</p>
          <p className="text-2xl font-bold mt-1">"{personality.title}"</p>
          <p className="text-sm text-gray-200 mt-2">{personality.description}</p>

          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <p className="text-gray-300">Total Listening</p>
              <p className="font-semibold">{personality.total_hours} Hours</p>
            </div>
            <div>
              <p className="text-gray-300">Top Artist</p>
              <p className="font-semibold">{personality.top_artist || '—'}</p>
            </div>
            <div>
              <p className="text-gray-300">Top Genre</p>
              <p className="font-semibold">{personality.top_genre || '—'}</p>
            </div>
            <div>
              <p className="text-gray-300">Top Song</p>
              <p className="font-semibold">{personality.top_song || '—'}</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="w-full bg-neutral-800 text-red-400 rounded-lg py-3 font-medium"
      >
        Log Out
      </button>
    </div>
  )
}