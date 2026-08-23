const CACHE_KEYS = {
  RECENTLY_PLAYED: 'offline_recently_played',
  LIKED_SONGS: 'offline_liked_songs',
  USER_PROFILE: 'offline_user_profile',
}

export function saveOfflineData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, cachedAt: Date.now() }))
  } catch (err) {
    console.error('Offline cache save failed', err)
  }
}

export function getOfflineData(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw).data
  } catch (err) {
    return null
  }
}

export { CACHE_KEYS }
