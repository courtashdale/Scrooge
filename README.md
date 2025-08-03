# 🎩 Scrooge - Voice-Activated Expense Tracker

AI-powered mobile web app for tracking expenses through voice commands with real-time transcription and automatic categorization.

## Features

- **Voice Recording**: Real-time audio capture and transcription using OpenAI Whisper
- **Smart Categorization**: Automatic expense categorization using GPT-3.5-turbo
- **Live Dashboard**: Interactive charts and analytics with D3.js
- **Local Caching**: 10 most recent transactions cached for offline viewing
- **Mobile-Optimized**: Responsive design for mobile web browsers
- **No Authentication**: Lightweight single-user design

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: MongoDB Atlas
- **AI Services**: OpenAI Whisper API, GPT-3.5-turbo
- **Charts**: D3.js
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd scrooge_2
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required environment variables:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `OPENAI_API_KEY`: Your OpenAI API key

### 3. MongoDB Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database named `scrooge`
4. Create a collection named `expenses`
5. Copy the connection string to your `.env.local`

### 4. OpenAI Setup

1. Get an OpenAI API key from https://platform.openai.com/
2. Add it to your `.env.local` file

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

### 6. Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `OPENAI_API_KEY`
4. Deploy!

## Usage

1. **Record Expense**: Click the record button and say something like "I spent $12.50 on coffee"
2. **View Today's Total**: See your total expenses for today on the main screen
3. **Recent Transactions**: Toggle to view, edit, or delete your 10 most recent transactions
4. **Dashboard**: View interactive charts and filter by date ranges
5. **Categories**: Expenses are automatically categorized (grocery, entertainment, transportation, etc.)

## API Endpoints

- `GET /api/transactions` - Fetch transactions with optional date filtering
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction
- `POST /api/transcribe` - Transcribe audio to text
- `POST /api/categorize` - Categorize expense item

## Database Schema

```javascript
{
  _id: ObjectId,
  item: String,           // "Coffee"
  cost: Number,          // 12.50
  date: Date,            // 2024-01-01T10:30:00Z
  is_grocery: Boolean,   // false
  is_entertainment: Boolean, // false
  is_transportation: Boolean, // false
  is_food_drink: Boolean, // true
  is_shopping: Boolean,   // false
  is_utilities: Boolean,  // false
  is_healthcare: Boolean, // false
  is_education: Boolean,  // false
  is_other: Boolean      // false
}
```

## Browser Compatibility

Requires browsers with:
- WebRTC/MediaRecorder API for voice recording
- Modern JavaScript (ES6+)
- Local Storage support

Tested on:
- Chrome (mobile & desktop)
- Safari (mobile & desktop)
- Firefox (desktop)
