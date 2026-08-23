# 🎵 Music App - AI-Powered Music Streaming & Discovery Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://music-app-ashen-alpha.vercel.app/)
[![API Backend](https://img.shields.io/badge/API_Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://music-app-9erx.onrender.com/)
[![API Docs](https://img.shields.io/badge/API_Docs-Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://music-app-9erx.onrender.com/docs)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

An intelligent, full-stack AI-driven music streaming, discovery, and analytics web application. Built with high-performance FastAPI on PostgreSQL and a reactive React/Vite PWA frontend with conversational AI assistance powered by Groq.

---

## 🌐 Live Deployments

- **🚀 Live Web App:** [https://music-app-ashen-alpha.vercel.app/](https://music-app-ashen-alpha.vercel.app/)
- **⚡ Backend API:** [https://music-app-9erx.onrender.com/](https://music-app-9erx.onrender.com/)
- **📖 Interactive API Docs (Swagger UI):** [https://music-app-9erx.onrender.com/docs](https://music-app-9erx.onrender.com/docs)

---

## ✨ Key Features

### 🎧 Seamless Streaming & Discovery
- **YouTube Audio Streaming:** High-quality playback integrated with YouTube Data API search and verification.
- **Smart Recommendations:** Personalized song recommendations tailored to user listening history, language, and favorite artists.
- **Library & Playlists:** Manage liked songs, recently played tracks, and custom user playlists with instant caching.
- **Listening Analytics:** Track total listening minutes, top songs, and listening personality traits with visual breakdowns.

### 🤖 AI Music Assistant
- **Conversational Music Discovery:** Powered by Groq AI (`gpt-oss-120b` / Llama models) with custom system prompts and Bengali/Banglish/Hindi/English natural multilingual support.
- **Real-Time Fact Search:** Live web searches (`ddgs`) and MusicBrainz database queries for release years, albums, and discographies.
- **App Tool Calling:** AI assistant dynamically fetches real user stats and offers step-by-step navigation help within the app.

### 📱 Progressive Web App (PWA)
- **Installable:** Install as a standalone native app on Android, iOS, Windows, and macOS.
- **Offline Resilient:** Network-first and cache-first strategies with Service Workers and IndexedDB/LocalStorage for recent tracks and images.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS v4, Lucide Icons, Axios, Vite PWA |
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy ORM, Pydantic v2, Uvicorn, Gunicorn |
| **AI & Search** | Groq SDK, DuckDuckGo Search (`ddgs`), MusicBrainz API |
| **Database** | PostgreSQL, Psycopg2, Alembic |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt password hashing |
| **Hosting** | Vercel (Frontend), Render (Backend Web Service) |

---

## 🏗️ Architecture

```mermaid
graph TD
    A[Client - React PWA / Vercel] -->|HTTPS / REST API| B[FastAPI Backend / Render]
    B -->|SQLAlchemy ORM| C[(PostgreSQL Database)]
    B -->|Tool Calling / Chat| D[Groq AI Models]
    B -->|Metadata Lookup| E[MusicBrainz & Web Search]
    A -->|Stream Audio & Thumbnails| F[YouTube Data API]
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL Database

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env
```

Fill in your `.env` variables:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/music_db
SECRET_KEY=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key
YOUTUBE_API_KEY=your_youtube_data_api_v3_key
```

Run the backend server:
```bash
uvicorn app.main:app --reload
```
API will run at `http://127.0.0.1:8000`.

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Fill in your `frontend/.env`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_YOUTUBE_API_KEY=your_youtube_api_key
```

Run the development server:
```bash
npm run dev
```
Frontend will run at `http://localhost:5173`.

---

## 🔒 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Secret key for JWT authentication |
| `ALGORITHM` | JWT signing algorithm (Default: `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry time in minutes (Default: `43200`) |
| `GROQ_API_KEY` | API key from Groq Cloud |
| `YOUTUBE_API_KEY` | Google YouTube Data API v3 key |

### Frontend (`frontend/.env`)
| Variable | Description |
| :--- | :--- |
| `VITE_API_BASE_URL` | Backend URL (`https://music-app-9erx.onrender.com` in production) |
| `VITE_YOUTUBE_API_KEY` | Google YouTube Data API v3 key |

---

## 📄 License
This project is licensed under the MIT License.
