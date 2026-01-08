# How to Run the Project

## Prerequisites

- **Node.js** (v18 or higher) - Check with: `node --version`
- **npm** or **yarn** - Check with: `npm --version` or `yarn --version`
- **Git** - Check with: `git --version`
- **Redis** (Optional but recommended for caching) - Install with: `brew install redis` (macOS) or check your OS package manager

## Step-by-Step Setup

### 1. Install Dependencies

Install dependencies for both backend and frontend:

```bash
# Install backend dependencies
cd GitHub_summarizer/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd GitHub_summarizer/backend
touch .env
```

Add the following to `backend/.env`:

```env
# Required: Google Gemini API Key for LLM analysis
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Backend port (defaults to 3001)
PORT=3001

# Optional: Redis URL (if using Redis, otherwise uses in-memory cache)
REDIS_URL=redis://localhost:6379
```

**To get a Gemini API Key:**
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy and paste it into your `.env` file

### 3. Configure Frontend Backend URL (if needed)

The frontend expects the backend on port 3001 by default. If you change the backend port, update the frontend configuration:

**Option A:** Create a `.env` file in the `frontend` directory:
```bash
cd GitHub_summarizer/frontend
touch .env
```

Add to `frontend/.env`:
```env
VITE_SERVER_URL=http://localhost:3001
```

### 4. Start Redis (Optional but Recommended)

If you have Redis installed:

```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Or run directly
redis-server
```

If Redis is not running, the app will use an in-memory cache (data lost on restart).

### 5. Run the Backend Server

Open a terminal and run:

```bash
cd GitHub_summarizer/backend
npm start
```

You should see:
```
🚀 Server running on port 3001
📡 Backend URL: http://localhost:3001
🔗 Health check: http://localhost:3001/api/health
```

**Note:** The backend uses Node.js v18. If you see an engine warning but it still works, you can ignore it.

### 6. Run the Frontend Development Server

Open a **new terminal** and run:

```bash
cd GitHub_summarizer/frontend
npm run dev
```

You should see output like:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 7. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

(Or the port shown in your terminal)

## Quick Start (All Commands)

If you want to run everything quickly:

**Terminal 1 (Backend):**
```bash
cd GitHub_summarizer/backend && npm start
```

**Terminal 2 (Frontend):**
```bash
cd GitHub_summarizer/frontend && npm run dev
```

**Terminal 3 (Redis - Optional):**
```bash
redis-server
```

## Troubleshooting

### Port Already in Use
If port 3001 or 5173 is already in use:
- **Backend:** Change `PORT` in `backend/.env` (default is 3001)
- **Frontend:** Vite will automatically use the next available port
- **Note:** Port 5000 is often used by macOS services, so we use 3001 by default

### Backend Not Connecting
- Check that the backend is running on the correct port
- Verify `VITE_SERVER_URL` in `frontend/.env` matches the backend port
- Check browser console for CORS errors

### Missing API Key
- Make sure `GEMINI_API_KEY` is set in `backend/.env`
- Restart the backend server after adding the key

### Redis Connection Issues
- The app will work without Redis (uses in-memory cache)
- If you want Redis, make sure it's running: `redis-cli ping` should return `PONG`

## Project Structure

```
GitHub_summarizer/
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── index.js          # Server entry point
│   │   ├── controllers/      # API controllers
│   │   ├── routes/           # API routes
│   │   ├── services/         # External services (Git)
│   │   └── utils/            # Utilities (LLM, Redis, etc.)
│   └── .env                  # Environment variables
│
└── frontend/        # React + Vite application
    ├── src/
    │   ├── pages/            # Main pages
    │   ├── components/       # UI components
    │   └── utils/           # Frontend utilities
    └── .env                  # Frontend environment variables (optional)
```

## API Endpoints

- `POST /api/repos/clone` - Clone and analyze a GitHub repository
  - Body: `{ "repoUrl": "https://github.com/owner/repo" }`

## Development Tips

- Backend auto-restarts with nodemon (if configured)
- Frontend has hot-reload enabled by Vite
- Check browser console and terminal for errors
- Backend logs will show analysis progress

