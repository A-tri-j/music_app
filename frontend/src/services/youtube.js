import axios from 'axios'

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY

const youtubeApi = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3',
})

export async function searchYoutubeSongs(query) {
  if (!query) return []
  try {
    const res = await youtubeApi.get('/search', {
      params: {
        part: 'snippet',
        q: `${query} song`,
        type: 'video',
        videoCategoryId: '10', // Music category
        maxResults: 15,
        key: YOUTUBE_API_KEY,
      },
    })

    return res.data.items.map((item) => ({
      id: `yt-${item.id.videoId}`,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      channel: item.snippet.channelTitle,
      cover_url: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      source: 'youtube',
      youtube_id: item.id.videoId,
    }))
  } catch (error) {
    console.error('YouTube API Error:', error)
    return []
  }
}

export async function getTrendingYoutubeSongs(categoryQuery = 'Trending Bollywood Hits') {
  return searchYoutubeSongs(categoryQuery)
}
