# Trendboard: AI-Powered Financial Intelligence

Trendboard is an absolute premium AI-powered financial dashboard built for proactive investors. It ingests thousands of market articles, analyzes sentiment, extracts moving topics, and computes an exclusive "Market Pulse Score" in real time. 

Built with the modern stack: **Next.js 15 (App Router)**, **Firebase**, **OpenAI/Gemini**, **Tailwind CSS**, and **Recharts**.

## 🚀 Features

- **Automated AI Intelligence**: Firebase Cloud Functions continuously fetch leading market news (via Finnhub), processing articles through LLMs to extract a concise summary, 1-3 critical topics, and strict market sentiment (-1 to 1).
- **Market Pulse Score**: A composite algorithm that calculates the broad market direction by weighting the average sentiment against the logarithmic volume of underlying news events. 
- **IPO Heat Tracker**: A real-time monitoring ring that specifically listens to IPO noise in the market and displays its velocity over time. 
- **"Explain This Trend"**: Directly talk to the AI to convert breaking news headlines into a structured advisory containing short/long term impact estimates specifically for investors.
- **Top Frequencies**: Real-time interactive area charts rendered with `Recharts` to showcase the most trending sub-topics continuously sweeping across financial media.

## 🛠 Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts, Lucide-React
- **Backend:** Firebase Cloud Functions, Firestore, Firebase Auth
- **AI Integration:** Google Gemini SDK (`gemini-2.5-flash`)
- **Market Data:** Finnhub API

## 📦 Getting Started

### 1. Pre-requisites
- Node.js > 18.0.0
- A Firebase Project (with Firestore, Auth Provider enabled)
- Finnhub API Key 
- Google Gemini API Key

### 2. Cloud Functions Setup
Add your `.env` securely to the `functions` directory:
```bash
FINNHUB_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```
Deploy the backend:
```bash
cd functions
npm install
npm run deploy
```

### 3. Frontend Setup
Add your `.env.local` inside the root tree:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
```
Run the development environment locally:
```bash
npm install
npm run dev
```
Open `http://localhost:3000` to view the dashboard.

## 🔒 Security
All interactions happen entirely inside authenticated sessions. Firestore Rules explicitly secure data modifications to *only* the internal Cloud Service Account instances through Admin SDKs. All reads are scoped to active logged-in users. 
