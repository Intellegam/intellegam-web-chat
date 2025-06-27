# Quick Start Guide

Get Chat SDK running in 5 minutes with a FastAPI backend connection.

## Prerequisites

Before starting, ensure you have:
- Node.js 20+ and pnpm installed
- Git for cloning the repository
- A FastAPI backend endpoint (or use the sample)

## Installation

1. **Clone and install dependencies**

```bash
git clone <repository-url>
cd intellegam-web-chat
pnpm install
```

2. **Set up environment variables**

Copy the example environment file:
```bash
cp .env.example .env.local
```

3. **Configure essential variables**

Edit `.env.local` with minimum required settings:
```
# Database (required)
POSTGRES_URL=your-neon-database-url

# Authentication (required)
WORKOS_API_KEY=your-workos-api-key
WORKOS_CLIENT_ID=your-workos-client-id
WORKOS_COOKIE_PASSWORD=random-32-character-string
```

## Running the Application

1. **Start the development server**

```bash
pnpm dev
```

2. **Access the application**

Open [http://localhost:3000](http://localhost:3000)

## Connecting to Your Backend

### Option 1: URL Parameters

Access the chat with your backend endpoint:
```
http://localhost:3000?endpoint=https://your-api.com/chat
```

With authentication:
```
http://localhost:3000?endpoint=https://your-api.com/chat&subscriptionKey=your-key
```

### Option 2: Local Development Backend

If running a FastAPI backend locally on port 8000, the app automatically connects to:
```
http://127.0.0.1:8000/chat
```

### Option 3: Sample Backend

Without parameters, the app uses the Intellegam sample backend for testing.

## First Chat

1. **Sign in** - Click sign in to use WorkOS authentication
2. **Start chatting** - Type a message and press Enter
3. **View streaming** - Watch AI responses stream in real-time

## Backend Requirements

Your FastAPI backend should implement:
- `POST /chat` - Main chat endpoint accepting streaming requests
- `GET /config` (optional) - UI configuration endpoint

Reference: See `lib/config/ChatConfig.ts` for configuration options.

## Troubleshooting

### Database Connection Failed
- Verify `POSTGRES_URL` is correct
- Check Neon dashboard for connection strings

### Authentication Not Working
- Ensure WorkOS credentials are set
- Check WorkOS dashboard configuration

### Backend Not Connecting
- Verify endpoint URL is accessible
- Check for CORS configuration on backend
- Look for subscription key requirements

## Next Steps

- Configure AI providers in your backend
- Customize UI with `ChatConfig` options
- Set up production deployment
- Enable additional features like file uploads

Reference: See `docs/architecture/overview.md` for detailed system understanding.
