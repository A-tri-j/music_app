import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Sparkles, Music, Globe, Flame, ArrowRight, ArrowLeft } from 'lucide-react'
import api from '../../services/api'
import { useAuthStore } from '../../store/authStore'

const TOP_ARTISTS = [
  { name: 'Arijit Singh', genre: 'Bollywood & Bengali', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200' },
  { name: 'Pritam', genre: 'Composer & Producer', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200' },
  { name: 'Shreya Ghoshal', genre: 'Melody & Romantic', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200' },
  { name: 'Anupam Roy', genre: 'Bengali Folk & Pop', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200' },
  { name: 'Atif Aslam', genre: 'Urdu & Hindi Hits', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200' },
  { name: 'AR Rahman', genre: 'Maestro & Fusion', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200' },
  { name: 'KK', genre: 'Nostalgic Classics', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200' },
  { name: 'Diljit Dosanjh', genre: 'Punjabi & Pop', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200' },
  { name: 'Jubin Nautiyal', genre: 'Romantic Hits', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200' },
  { name: 'Taylor Swift', genre: 'Global Pop', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200' },
  { name: 'Rupam Islam', genre: 'Bengali Rock', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200' },
  { name: 'Mohit Chauhan', genre: 'Sufi & Indie', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200' },
  { name: 'Neha Kakkar', genre: 'Party Beats', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200' },
  { name: 'Badshah', genre: 'Hip Hop & Rap', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200' },
  { name: 'Sonu Nigam', genre: 'Evergreen Hits', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200' },
  { name: 'Monali Thakur', genre: 'Sweet Melody', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200' },
  { name: 'Silajit', genre: 'Bengali Indie Folk', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200' },
  { name: 'Rahat Fateh Ali Khan', genre: 'Sufi & Ghazal', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200' },
  { name: 'Ed Sheeran', genre: 'Acoustic Pop', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200' },
  { name: 'Lata Mangeshkar', genre: 'Legendary Classics', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200' },
]

const LANGUAGES = [
  { id: 'Bengali', label: 'Bengali (বাংলা)', desc: 'Rabindra Sangeet, Modern & Folk' },
  { id: 'Hindi', label: 'Hindi (हिंदी)', desc: 'Bollywood Hits & Ghazals' },
  { id: 'English', label: 'English', desc: 'International Pop, Rock & Indie' },
  { id: 'Urdu', label: 'Urdu (اردو)', desc: 'Sufi, Coke Studio & Ghazals' },
]

const GENRES = [
  { id: 'Romantic', label: 'Romantic 💖', desc: 'Love ballads & soft melodies' },
  { id: 'Sad', label: 'Sad & Melancholy 🌧️', desc: 'Emotional, breakup & slow songs' },
  { id: 'Party', label: 'Party & Dance 🎉', desc: 'Upbeat dance tracks & rap' },
  { id: 'Lofi', label: 'Lofi & Chill ☕', desc: 'Relaxing ambient beats' },
  { id: 'Devotional', label: 'Devotional 🙏', desc: 'Spiritual, Bhajan & Sufi' },
  { id: 'Rock', label: 'Rock & Metal 🎸', desc: 'Electric guitar & high energy' },
]

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [selectedArtists, setSelectedArtists] = useState([])
  const [selectedLanguages, setSelectedLanguages] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])
  const [saving, setSaving] = useState(false)

  const navigate = useNavigate()
  const fetchUser = useAuthStore((s) => s.fetchUser)

  const toggleArtist = (name) => {
    setSelectedArtists((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    )
  }

  const toggleLanguage = (id) => {
    setSelectedLanguages((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    )
  }

  const toggleGenre = (id) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      const payload = {
        favorite_artists: selectedArtists.join(','),
        favorite_language: selectedLanguages.join(','),
        favorite_genre: selectedGenres.join(','),
      }
      await api.put('/users/profile', payload)
      await fetchUser()
      navigate('/')
    } catch (err) {
      console.error('Failed to save music preferences', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 max-w-4xl mx-auto flex flex-col justify-between pb-24">
      {/* Header & Step Indicator */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="text-green-500" size={24} />
            <h1 className="text-xl font-bold">Personalize Your Tastes</h1>
          </div>
          <span className="text-xs text-gray-400 font-mono bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full">
            Step {step} of 3
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mb-8">
          <div
            className="bg-green-500 h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {/* Step 1: Artist Picker */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-1">Choose your favorite Artists</h2>
            <p className="text-sm text-gray-400 mb-6">Select 3 or more artists you love to build your custom feed</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-hide">
              {TOP_ARTISTS.map((artist) => {
                const isSelected = selectedArtists.includes(artist.name)
                return (
                  <div
                    key={artist.name}
                    onClick={() => toggleArtist(artist.name)}
                    className={`relative rounded-2xl p-3 cursor-pointer transition flex flex-col items-center text-center border ${
                      isSelected
                        ? 'bg-green-950/40 border-green-500 shadow-lg scale-95'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-2 bg-neutral-800 relative">
                      <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-green-500/60 flex items-center justify-center">
                          <Check size={24} className="text-black font-bold" />
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-xs text-white truncate w-full">{artist.name}</p>
                    <p className="text-[10px] text-gray-400 truncate w-full mt-0.5">{artist.genre}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Language Picker */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-1">Select Music Languages</h2>
            <p className="text-sm text-gray-400 mb-6">Choose languages you listen to</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLanguages.includes(lang.id)
                return (
                  <div
                    key={lang.id}
                    onClick={() => toggleLanguage(lang.id)}
                    className={`p-5 rounded-2xl cursor-pointer transition border flex items-center justify-between ${
                      isSelected
                        ? 'bg-green-950/40 border-green-500 shadow-lg'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Globe size={22} className={isSelected ? 'text-green-400' : 'text-gray-400'} />
                      <div>
                        <p className="font-bold text-base text-white">{lang.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{lang.desc}</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-green-500 border-green-500 text-black' : 'border-neutral-600'
                      }`}
                    >
                      {isSelected && <Check size={16} />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 3: Genre Picker */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-1">Choose Favorite Genres</h2>
            <p className="text-sm text-gray-400 mb-6">Select genres that match your mood</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre.id)
                return (
                  <div
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`p-5 rounded-2xl cursor-pointer transition border flex items-center justify-between ${
                      isSelected
                        ? 'bg-green-950/40 border-green-500 shadow-lg'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Music size={22} className={isSelected ? 'text-green-400' : 'text-gray-400'} />
                      <div>
                        <p className="font-bold text-base text-white">{genre.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{genre.desc}</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-green-500 border-green-500 text-black' : 'border-neutral-600'
                      }`}
                    >
                      {isSelected && <Check size={16} />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-neutral-800 mt-8">
        {step > 1 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-3 rounded-xl transition text-sm font-semibold"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        ) : (
          <div></div>
        )}

        {step < 3 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-xl transition text-sm font-bold shadow-lg"
          >
            <span>Next</span>
            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={saving}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black px-8 py-3 rounded-xl transition text-sm font-bold shadow-xl"
          >
            <span>{saving ? 'Saving Preferences...' : 'Start Listening 🎧'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
