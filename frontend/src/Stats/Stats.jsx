import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function Stats() {
  const [daily, setDaily] = useState(null)
  const [weekly, setWeekly] = useState([])

  useEffect(() => {
    api.get('/analytics/stats/daily').then((res) => setDaily(res.data))
    api.get('/analytics/stats/weekly').then((res) => setWeekly(res.data))
  }, [])

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const maxSeconds = Math.max(...weekly.map((d) => d.total_seconds), 1)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Stats</h1>

      {daily && (
        <div className="bg-neutral-900 rounded-xl p-5 mb-6">
          <p className="text-gray-400 text-sm">Today's Listening</p>
          <p className="text-3xl font-bold mt-1">🎧 {formatDuration(daily.total_seconds)}</p>
          <div className="flex gap-6 mt-4 text-sm text-gray-400">
            <p>Songs: <span className="text-white">{daily.songs_played}</span></p>
            <p>Artists: <span className="text-white">{daily.unique_artists}</span></p>
            <p>Genres: <span className="text-white">{daily.unique_genres}</span></p>
          </div>
        </div>
      )}

      <div className="bg-neutral-900 rounded-xl p-5">
        <p className="text-gray-400 text-sm mb-4">Weekly Activity</p>
        <div className="flex items-end gap-2 h-32">
          {weekly.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-green-500 rounded-t"
                style={{ height: `${(day.total_seconds / maxSeconds) * 100}%`, minHeight: '4px' }}
              />
              <span className="text-[10px] text-gray-500">{day.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}