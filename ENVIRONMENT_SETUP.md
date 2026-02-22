# Environment Setup Guide

## Overview
This guide explains how to configure environment variables for the conversational voice navigation system.

## Frontend Configuration

### 1. Create Environment File
Create a `.env.local` file in the `frontend/` directory:

```bash
cd frontend
cp .env.example .env.local
```

### 2. Configure Backend URL
Edit `.env.local` with your backend URL:

```env
# Backend API Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1

# For production (replace with your actual domain)
# NEXT_PUBLIC_BACKEND_URL=https://your-api-domain.com
```

### 3. Environment Variables Explained

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | Base URL of your backend API | `http://localhost:8000` | `https://api.example.com` |
| `NEXT_PUBLIC_API_VERSION` | API version to use | `v1` | `v1` |

### 4. Frontend API Configuration Utility
The frontend uses a utility module (`/frontend/src/utils/apiConfig.ts`) to centralize API configuration:

```typescript
import { getApiConfig, getAudioEndpoint, getRoutesEndpoint } from '../utils/apiConfig';

// Get full configuration
const config = getApiConfig();
// Returns: { backendUrl, apiVersion, audioEndpoint, routesEndpoint }

// Get specific endpoints
const audioEndpoint = getAudioEndpoint();
const routesEndpoint = getRoutesEndpoint();
```

## Backend Configuration

### 1. Configure Backend Environment
Edit the `backend/.env` file:

```env
# API Configuration
API_URL=http://localhost:8000
API_VERSION=v1

# TTS Configuration
TTS_SERVICE=elevenlabs
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
```

### 2. Backend Environment Variables Explained

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `API_URL` | Base URL of the backend server | `http://localhost:8000` | `https://api.example.com` |
| `API_VERSION` | API version to use | `v1` | `v1` |
| `TTS_SERVICE` | TTS service to use | `elevenlabs` | `elevenlabs`, `google`, `local` |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | - | `sk_...` |
| `ELEVENLABS_VOICE_ID` | ElevenLabs voice ID | `pNInz6obpgDQGcFmaJgB` | Any valid voice ID |

## Development Setup

### 1. Start Backend
```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Access the Application
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

## Production Setup

### 1. Frontend Production
```bash
cd frontend
npm run build
npm start
```

### 2. Backend Production
```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3. Environment Variables for Production
Create a production `.env` file:

```env
# Frontend (next.config.js or environment variables)
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_VERSION=v1

# Backend
API_URL=https://api.yourdomain.com
API_VERSION=v1
TTS_SERVICE=elevenlabs
ELEVENLABS_API_KEY=your_production_api_key
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
```

## Docker Setup (Optional)

### 1. Backend Dockerfile
Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Frontend Dockerfile
Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 3. Docker Compose
Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - API_URL=http://localhost:8000
      - API_VERSION=v1
      - TTS_SERVICE=elevenlabs
      - ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
      - NEXT_PUBLIC_API_VERSION=v1
    depends_on:
      - backend
```

## Troubleshooting

### 1. CORS Issues
If you encounter CORS errors, ensure your backend `.env` file includes:

```env
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

### 2. API Connection Errors
Check that:
1. Backend is running on the correct port
2. `NEXT_PUBLIC_BACKEND_URL` matches the backend URL
3. Firewall allows connections between frontend and backend

### 3. Environment Variables Not Loading
- For Next.js, environment variables must start with `NEXT_PUBLIC_` to be available in the browser
- Restart the development server after changing `.env.local`
- Check that `.env.local` is in the correct directory (`frontend/`)

### 4. TTS Service Issues
- Ensure ElevenLabs API key is valid
- Check that `TTS_SERVICE` is set correctly
- For local TTS, ensure eSpeak is installed: `sudo apt-get install -y espeak`

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use `.env.example`** to document required variables
3. **Use different API keys** for development and production
4. **Rotate API keys** regularly
5. **Use HTTPS** in production for all API calls

## Example Configuration Files

### Frontend `.env.local`
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1
```

### Backend `.env`
```env
API_URL=http://localhost:8000
API_VERSION=v1
TTS_SERVICE=elevenlabs
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
```