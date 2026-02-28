# Trada — AI Trading Co-Pilot

Trada is an AI-powered trading co-pilot that joins your video call as a Vision Agent, watches your live trading chart via screen share, and lets you have real-time voice conversations about what it sees.

## What it does

- Joins your call as an AI participant using Stream Video SDK
- Watches your TradingView screen share at 1 fps using Vision Agents SDK
- Responds to your voice questions about candlestick patterns, price action, and market signals
- Displays session status and agent messages in a live insights sidebar

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Stream Video React SDK
- **Backend**: FastAPI + Python 3.13
- **AI**: Vision Agents SDK + Gemini Realtime (gemini-2.0-flash-live)
- **Video**: Stream Video SDK (WebRTC)
- **Deployment**: Vercel (frontend) + Render (backend)

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.13+
- uv package manager
- Stream API key and secret
- Gemini API key (paid tier required for Gemini Live)

### Backend
```bash
cd server
uv run main.py
```

### Frontend
```bash
cd client
npm install
npm run dev
```

### Environment Variables
Create `server/.env`:
```
STREAM_API_KEY=your_stream_api_key
STREAM_SECRET=your_stream_secret
STREAM_API_SECRET=your_stream_api_secret
GEMINI_API_KEY=your_gemini_api_key
```

## Architecture

The user starts a session on the Trada dashboard. A Stream Video call is created and the user joins. The backend spins up a Vision Agent (powered by Gemini Realtime) that joins the same call, subscribes to the user's screen share track, and listens via microphone. The user can then have a natural voice conversation with the agent about what it sees on their trading chart.

## Built for Vision Possible: Agent Protocol Hackathon
