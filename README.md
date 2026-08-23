# Music App - AI Music Streaming & Discovery Platform

A full-stack AI-powered music streaming and discovery web application built with FastAPI, PostgreSQL, React (Vite), and Groq AI.

## 🚀 Features
- **FastAPI & SQLAlchemy Backend**: RESTful API with PostgreSQL database, JWT authentication, user listening analytics, playlists, and recommendations.
- **AI Music Assistant**: Powered by Groq AI, real-time web search (`ddgs`), MusicBrainz integration, and custom tool calling for personalized music stats and guidance.
- **Rich React Frontend**: Fast UI with Vite, Tailwind-like custom styling, audio player, playlist manager, and PWA support.
- **YouTube Audio Streaming**: Integration with YouTube Data API for streaming and metadata verification.

## 🛠️ Tech Stack
- **Backend**: Python 3.11+, FastAPI, PostgreSQL, SQLAlchemy, Groq SDK, Uvicorn, Gunicorn
- **Frontend**: React 18, Vite, PWA, Lucide Icons, Axios

## 📦 Setup & Installation

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Create & activate virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment:
   Copy `.env.example` to `.env` and fill in your credentials.
   ```bash
   cp .env.example .env
   ```
5. Run development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   Copy `.env.example` to `.env` and add API keys.
4. Run development server:
   ```bash
   npm run dev
   ```
