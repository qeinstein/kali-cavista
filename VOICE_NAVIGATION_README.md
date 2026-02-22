# Conversational Voice Navigation System

## Overview

This document describes the new **conversational voice navigation system** designed for accessibility, particularly for visually impaired users. The system transforms the previous one-way command interface into a two-way conversational experience similar to ChatGPT's Voice Mode.

## Key Features

### 1. Two-Way Conversation
- **User speaks**: Commands, questions, or navigation requests
- **Assistant responds**: Verbal descriptions of page content, answers to questions, and navigation confirmations
- **Continuous dialogue**: Maintains context across multiple interactions

### 2. Interruptible Audio
- **Stop playback**: Click the microphone button while audio is playing to interrupt
- **Real-time interruption**: System stops TTS playback immediately when user starts speaking
- **Visual feedback**: Clear indicators for recording, playing, and processing states

### 3. Page Context Awareness
- **Automatic extraction**: System extracts visible content from current page
- **Accessibility focus**: Prioritizes headings, buttons, links, and form inputs
- **Dynamic updates**: Context updates when navigating between pages

### 4. Conversation State Management
- **Persistent history**: Conversation history saved to localStorage
- **Context preservation**: Maintains understanding of current page and previous interactions
- **Session management**: Automatically clears inactive conversations

## Architecture

### Frontend Components

#### VoiceNavigator Component (`/frontend/src/components/VoiceNavigator.tsx`)
- **Main UI**: Floating button with conversation panel
- **Recording**: Captures audio using Web Audio API
- **Playback**: Uses Web Audio API for TTS audio playback
- **State management**: Integrates with conversation state manager

#### Page Accessibility Utilities (`/frontend/src/utils/pageAccessibility.ts`)
- **Content extraction**: Extracts headings, buttons, links, images, forms
- **Context generation**: Creates structured page context for AI
- **Action detection**: Identifies available user actions on current page

#### Conversation State Manager (`/frontend/src/utils/conversationState.ts`)
- **History tracking**: Maintains conversation history
- **State persistence**: Saves to localStorage for session recovery
- **Interruptibility management**: Tracks recording/playback states

### Backend Services

#### Audio Router (`/backend/app/routers/audio.py`)
- **Voice command endpoint**: `POST /api/v1/audio/voice-command`
- **TTS streaming**: `POST /api/v1/audio/stream-response`
- **Conversational response**: Generates both navigation and verbal response

#### TTS Service (`/backend/app/services/tts.py`)
- **ElevenLabs integration**: High-quality TTS (default)
- **Google Cloud TTS**: Alternative option
- **Local fallback**: pyttsx3 for offline use

#### LLM Service (`/backend/app/services/llm.py`)
- **Intent extraction**: Determines navigation route
- **Conversational generation**: Creates natural language responses
- **Context awareness**: Considers page context and conversation history

## User Flow

### 1. Start Conversation
```
User clicks microphone button → System starts recording
```

### 2. Voice Command
```
User: "Show me my health data"
System: Transcribes → Extracts intent → Navigates to dashboard
```

### 3. Page Description
```
Assistant: "Here is your health data overview. You're on the dashboard page with headings for 'Daily Summary', 'Weekly Trends', and 'Goals'. Available actions include 'View Details', 'Export Data', and 'Set New Goals'."
```

### 4. Follow-up Questions
```
User: "What about my hydration?"
Assistant: "Your hydration data shows you've consumed 2.5 liters today, which is 83% of your daily goal. Would you like to log more water?"
```

### 5. Interruptibility
```
Assistant: [Speaking long response...]
User: [Clicks microphone button]
System: [Immediately stops playback, starts recording]
```

## Configuration

### Environment Variables (Backend)
```env
# TTS Service Selection
TTS_SERVICE=elevenlabs  # Options: elevenlabs, google, local

# ElevenLabs API (for high-quality TTS)
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB  # Default voice

# LLM Services (already configured)
OPENROUTER_API_KEY=your_key
GROQ_API_KEY=your_key
```

### Frontend Configuration
The VoiceNavigator component automatically:
- Fetches available routes from `/api/routes`
- Extracts page context on route changes
- Maintains conversation state in localStorage

## API Endpoints

### Voice Command Processing
```http
POST /api/v1/audio/voice-command
Content-Type: multipart/form-data

Parameters:
- audio: Audio file (WebM format)
- routes_context: JSON string of available routes
- page_context: JSON string of current page context
- conversation_history: JSON string of previous turns

Response:
{
  "action": "navigate",
  "route": "/dashboard",
  "transcript": "Show me my health data",
  "response_text": "Here is your health data overview...",
  "audio_response": "base64_encoded_audio"
}
```

### TTS Streaming
```http
POST /api/v1/audio/stream-response
Content-Type: application/x-www-form-urlencoded

Parameters:
- text: Text to convert to speech

Response:
{
  "audio_response": "base64_encoded_audio",
  "text": "Original text"
}
```

## Accessibility Features

### For Visually Impaired Users
1. **Audio feedback**: All navigation and content described verbally
2. **Keyboard navigation**: Can use keyboard shortcuts to control voice interface
3. **Screen reader compatibility**: Works with existing screen readers
4. **High contrast**: Visual indicators for recording/playing states

### Interruptibility
1. **Immediate stop**: Clicking mic button stops any audio playback
2. **Visual feedback**: Clear indicators for current state
3. **No delay**: No waiting for current phrase to finish

## Testing

### Unit Tests
Run conversation state tests:
```bash
cd frontend
npm test conversationState.test.ts
```

### Manual Testing
1. **Basic flow**: Start conversation → Give command → Listen to response
2. **Interruptibility**: Start playback → Click mic button → Verify immediate stop
3. **Context awareness**: Navigate between pages → Verify context updates
4. **History persistence**: Refresh page → Verify conversation continues

## Dependencies

### Frontend
- `lucide-react`: Icons for UI
- `next/navigation`: Routing
- Web Audio API: Audio playback (built-in)

### Backend
- `elevenlabs`: TTS API client
- `pyttsx3`: Local TTS fallback
- `httpx`: HTTP client for API calls
- `groq`: Audio transcription
- `openai`: LLM integration

## Future Enhancements

1. **Voice customization**: Allow users to choose different TTS voices
2. **Conversation export**: Export conversation history as text/audio
3. **Multi-language support**: Support for multiple languages
4. **Offline mode**: Local TTS and transcription for offline use
5. **Custom wake words**: "Hey Spag" to start conversation
6. **Conversation summary**: Generate summaries of long conversations

## Troubleshooting

### Audio Not Playing
1. Check browser permissions for audio playback
2. Verify TTS service API key is configured
3. Check console for errors

### Microphone Not Working
1. Check browser permissions for microphone access
2. Ensure HTTPS (required for microphone access in most browsers)
3. Try different browser

### Poor Audio Quality
1. Check TTS service selection (ElevenLabs recommended)
2. Verify API key has sufficient quota
3. Consider using local TTS fallback

## Support

For issues or questions about the voice navigation system, please refer to the code comments in:
- `/frontend/src/components/VoiceNavigator.tsx`
- `/backend/app/routers/audio.py`
- `/backend/app/services/tts.py`
- `/backend/app/services/llm.py`