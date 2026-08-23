import api from './api'

export async function sendChatMessage(message, sessionId = null) {
  const res = await api.post('/chatbot/message', {
    message,
    session_id: sessionId,
  })
  return res.data
}

export function streamChatMessage(message, sessionId, onToken, onDone, onSessionId) {
  const token = localStorage.getItem('access_token')

  fetch(`${api.defaults.baseURL}/chatbot/message/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, session_id: sessionId }),
  }).then(async (response) => {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop()

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = JSON.parse(line.slice(6))

        if (data.session_id) onSessionId(data.session_id)
        if (data.token) onToken(data.token)
        if (data.done) onDone(data.songs || [])
      }
    }
  })
}
