import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Play, Mic, Sparkles } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { usePlayerStore } from '../../store/playerStore'
import { sendChatMessage } from '../../services/chatbot'
import { searchYoutubeSongs } from '../../services/youtube'

export default function ChatWidget() {
  const [input, setInput] = useState('')
  const [loadingSongIndex, setLoadingSongIndex] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const scrollRef = useRef(null)
  const playSong = usePlayerStore((s) => s.playSong)

  const isOpen = useChatStore((s) => s.isOpen)
  const messages = useChatStore((s) => s.messages)
  const isLoading = useChatStore((s) => s.isLoading)
  const sessionId = useChatStore((s) => s.sessionId)
  const toggleChat = useChatStore((s) => s.toggleChat)
  const addMessage = useChatStore((s) => s.addMessage)
  const setSessionId = useChatStore((s) => s.setSessionId)
  const setLoading = useChatStore((s) => s.setLoading)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isOpen])

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input not supported in this browser. Try Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'bn-BD'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
    }

    recognition.onerror = () => setIsListening(false)

    recognition.start()
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    addMessage({ role: 'user', content: text })
    setInput('')
    setLoading(true)

    try {
      const res = await sendChatMessage(text, sessionId)
      setSessionId(res.session_id)
      addMessage({ role: 'assistant', content: res.reply, songs: res.suggested_songs || [] })
    } catch (err) {
      addMessage({ role: 'assistant', content: 'Sorry, something went wrong. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handlePlaySuggested = async (song, index) => {
    setLoadingSongIndex(index)
    try {
      if (song.youtube_id) {
        const playableSong = {
          id: `yt-${song.youtube_id}`,
          title: song.title,
          cover_url: song.cover_url || 'https://placehold.co/48x48/222/fff?text=%E2%99%AA',
          source: 'youtube',
          youtube_id: song.youtube_id,
          artist_name: song.artist,
        }
        playSong(playableSong, [playableSong])
        return
      }

      // If no youtube_id preloaded, search live
      let results = await searchYoutubeSongs(`${song.title} ${song.artist || ''}`)
      if (results.length === 0 && song.artist) {
        results = await searchYoutubeSongs(song.title)
      }

      if (results.length > 0) {
        const video = results[0]
        const playableSong = {
          id: video.id || `yt-${video.youtube_id}`,
          title: video.title,
          cover_url: video.cover_url || video.thumbnail,
          source: 'youtube',
          youtube_id: video.youtube_id || (typeof video.id === 'string' ? video.id.replace(/^yt-/, '') : video.id),
          artist_name: video.channel || song.artist,
        }
        playSong(playableSong, [playableSong])
      } else {
        addMessage({
          role: 'assistant',
          content: `Sorry, couldn't find "${song.title}" on YouTube. Try asking for a different song.`,
        })
      }
    } catch (err) {
      console.error('Error playing suggested song:', err)
      addMessage({
        role: 'assistant',
        content: 'Something went wrong while searching for that song.',
      })
    } finally {
      setLoadingSongIndex(null)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const currentSong = usePlayerStore((s) => s.currentSong)

  return (
    <div className={`fixed ${currentSong ? 'bottom-[144px]' : 'bottom-[80px]'} left-0 right-0 z-40 flex justify-center px-4 pointer-events-none transition-all duration-300`}>
      <div className="w-full max-w-md relative flex justify-end pointer-events-none">
        {/* Floating circular chat button (floating cleanly above MiniPlayer & Navbar) */}
        <button
          onClick={toggleChat}
          className="pointer-events-auto btn-3d w-12 h-12 rounded-full bg-[#9d72e7] hover:bg-[#8b5cf6] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(157,114,231,0.45)] transition-all duration-200 cursor-pointer active:scale-95 hover:scale-110"
          title="AI Music Assistant"
        >
          {isOpen ? <X size={20} /> : <MessageCircle size={22} fill="white" className="text-white" />}
        </button>

        {/* Chat panel */}
        {isOpen && (
          <div className="pointer-events-auto absolute bottom-15 right-0 left-0 sm:left-auto sm:w-96 max-h-[60vh] bg-[var(--bg-card)]/95 backdrop-blur-2xl rounded-3xl shadow-2xl flex flex-col z-50 border border-[var(--card-border)] animate-slide-up ring-1 ring-[var(--accent-color)]/25">
            <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent-color)] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="font-bold text-sm text-[var(--text-primary)]">AI Music Assistant</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Ask for mood songs, stats, or recommendations</p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.length === 0 && (
                <div className="text-center py-8 px-2">
                  <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                    Try asking: <br />
                    <span className="font-medium text-[var(--text-secondary)]">&quot;I&apos;m feeling romantic, suggest some songs&quot;</span> or <br />
                    <span className="font-medium text-[var(--text-secondary)]">&quot;What is my listening time this month?&quot;</span>
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[var(--accent-color)] text-white font-medium'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--card-border)]'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>

                    {msg.songs && msg.songs.length > 0 && (
                      <div className="mt-3 flex flex-col gap-1.5 pt-2 border-t border-[var(--card-border)]">
                        <p className="text-[11px] font-semibold text-[var(--accent-color)] mb-0.5">Suggested Songs:</p>
                        {msg.songs.map((song, idx) => (
                          <button
                            key={idx}
                            onClick={() => handlePlaySuggested(song, `${i}-${idx}`)}
                            disabled={loadingSongIndex === `${i}-${idx}`}
                            className="flex items-center gap-2.5 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--card-border)] rounded-xl p-2 text-left transition disabled:opacity-50 cursor-pointer group"
                          >
                            {song.cover_url ? (
                              <img src={song.cover_url} alt={song.title} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <Play size={12} className="flex-shrink-0 text-[var(--accent-color)]" fill="currentColor" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-[var(--text-primary)]">{song.title}</p>
                              {song.artist && <p className="truncate text-[10px] text-[var(--text-muted)]">{song.artist}</p>}
                            </div>
                            {loadingSongIndex === `${i}-${idx}` ? (
                              <span className="text-[10px] ml-auto text-[var(--text-muted)] animate-pulse">...</span>
                            ) : (
                              <Play size={12} className="ml-auto opacity-0 group-hover:opacity-100 text-[var(--accent-color)] transition" fill="currentColor" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--bg-secondary)] rounded-2xl px-4 py-2 text-xs text-[var(--text-muted)] border border-[var(--card-border)] animate-pulse">
                    AI is thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[var(--card-border)] flex gap-2 items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about music..."
                className="flex-1 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none border border-[var(--card-border)] focus:border-[var(--accent-color)] transition"
              />
              <button
                onClick={handleVoiceInput}
                className={`rounded-xl p-2.5 transition cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--card-border)]'
                }`}
                title="Voice Input"
              >
                <Mic size={15} />
              </button>
              <button
                onClick={handleSend}
                className="btn-3d bg-[var(--accent-color)] text-white rounded-xl p-2.5 transition cursor-pointer"
                title="Send Message"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


