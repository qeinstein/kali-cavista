import json
import logging
import tempfile
import os
from groq import AsyncGroq
from openai import AsyncOpenAI
from app.core.config import settings
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# Initialize clients
try:
    groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
except Exception as e:
    logger.error(f"Failed to initialize Groq client: {e}")
    groq_client = None

try:
    openai_client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.OPENROUTER_API_KEY,
    )
except Exception as e:
    logger.error(f"Failed to initialize OpenRouter client: {e}")
    openai_client = None


class RouteIntent(BaseModel):
    route: str = Field(description="The path route to navigate to (e.g. '/', '/dashboard', '/records')")


async def transcribe_audio(audio_file) -> str:
    """
    Transcribes audio using configured transcription service with fallbacks.
    """
    # Determine service order based on configuration
    service_order = []
    
    if settings.TRANSCRIPTION_SERVICE == "groq":
        service_order = ["groq", "openai"]
    elif settings.TRANSCRIPTION_SERVICE == "openai":
        service_order = ["openai", "groq"]
    else:
        service_order = ["groq", "openai"]  # Default order
    
    # Try each service in order
    for service in service_order:
        if service == "groq" and groq_client:
            try:
                # Reset file pointer for Groq
                audio_file.seek(0)
                # Groq required format
                transcription = await groq_client.audio.transcriptions.create(
                    file=("audio.webm", audio_file.read(), "audio/webm"),
                    model="whisper-large-v3",
                    language="en"
                )
                logger.info(f"Transcription successful using Groq")
                return transcription.text
            except Exception as e:
                logger.error(f"Groq transcription failed: {e}")
                continue
        
        elif service == "openai" and openai_client:
            try:
                # Reset file pointer for OpenAI
                audio_file.seek(0)
                # OpenAI Whisper API (via OpenRouter)
                transcription = await openai_client.audio.transcriptions.create(
                    file=("audio.webm", audio_file.read(), "audio/webm"),
                    model="whisper-1",
                    language="en"
                )
                logger.info(f"Transcription successful using OpenAI")
                return transcription.text
            except Exception as e:
                logger.error(f"OpenAI transcription failed: {e}")
                continue
    
    # All services failed - try local transcription as final fallback
    logger.info("Trying local transcription as final fallback")
    return await _local_transcribe_audio(audio_file)


async def extract_navigation_intent(
    transcript: str, 
    routes: list = None, 
    page_context: dict = None,
    conversation_history: list = None
) -> str:
    """
    Given a transcript, use an LLM via OpenRouter to determine the best app route dynamically.
    Now considers page context and conversation history for better routing.
    """
    if not openai_client or not transcript:
        return "/"

    # Default values
    routes = routes or []
    page_context = page_context or {}
    conversation_history = conversation_history or []

    # Build routes display
    if routes:
        routes_display = "\\n".join(
            [f"- Path: '{r.get('path')}' (Description: {r.get('description', 'Unknown')})" for r in routes]
        )
    else:
        routes_display = "- Path: '/' (Description: Home/Overview)"
    
    # Build page context display
    page_display = ""
    if page_context:
        page_display = f"""
Current page context:
- Page: {page_context.get('page_name', 'Unknown')}
- Content summary: {page_context.get('content_summary', 'No summary available')}
- Available actions: {', '.join(page_context.get('available_actions', []))}
"""
    
    # Build conversation history
    history_display = ""
    if conversation_history:
        history_display = "Conversation history:\\n"
        for i, turn in enumerate(conversation_history[-5:]):  # Last 5 turns
            history_display += f"- Turn {i+1}: {turn.get('user', '')} -> {turn.get('assistant', '')}\\n"
    
    prompt = f"""
    The user is using a health partner application with voice navigation. They sent a voice command.
    Transcript: "{transcript}"
    
    {page_display}
    
    {history_display}
    
    Here are the ONLY available routes in the application and their descriptions:
    {routes_display}

    Determine which application screen the user wants to navigate to based on their intent. 
    Consider the current page context and conversation history.
    Return a JSON object with a single 'route' key containing the exact string of the chosen path. 
    If none match perfectly, default to "/" or the closest logical route.
    """
    
    try:
        response = await openai_client.chat.completions.create(
            model="google/gemma-3n-e4b-it:free",
            messages=[
                {"role": "system", "content": "You are a routing assistant. Always respond with only valid JSON adhering to the schema."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        content = response.choices[0].message.content
        intent_data = json.loads(content)
        route = intent_data.get("route", "/")
        # Basic sanitization
        if not route.startswith("/"):
            route = "/" + route
        return route
    except Exception as e:
        logger.error(f"Error extracting intent: {e}")
        return "/"


async def generate_conversational_response(
    transcript: str,
    route: str,
    page_context: dict = None,
    conversation_history: list = None
) -> str:
    """
    Generate a conversational response for the user based on their command and the current context.
    This response will be converted to speech.
    """
    if not openai_client or not transcript:
        return "I'm here to help you navigate the application."

    page_context = page_context or {}
    conversation_history = conversation_history or []

    # Build page context for the response
    page_display = ""
    if page_context:
        page_display = f"""
Current page: {page_context.get('page_name', 'Unknown')}
Page content: {page_context.get('content_summary', 'No content available')}
Available actions: {', '.join(page_context.get('available_actions', []))}
"""
    
    # Build conversation history
    history_display = ""
    if conversation_history:
        history_display = "Recent conversation:\\n"
        for i, turn in enumerate(conversation_history[-3:]):  # Last 3 turns
            history_display += f"- User: {turn.get('user', '')}\\n  Assistant: {turn.get('assistant', '')}\\n"
    
    prompt = f"""
    You are a helpful, conversational assistant for a health partner application.
    The user is visually impaired and relies on voice navigation.
    
    User's voice command: "{transcript}"
    
    {page_display}
    
    {history_display}
    
    The user has been navigated to: {route}
    
    Your task:
    1. Acknowledge the user's command
    2. Describe what's on the current page (if applicable)
    3. Provide helpful next steps or information
    4. Keep the response conversational and natural
    5. Be concise but informative (aim for 2-3 sentences)
    
    Respond in a friendly, helpful tone. Remember the user can't see the screen.
    """
    
    try:
        response = await openai_client.chat.completions.create(
            model="google/gemma-3n-e4b-it:free",
            messages=[
                {"role": "system", "content": "You are a helpful, conversational assistant for a health partner application. You speak in a friendly, natural tone. You help visually impaired users navigate the app using voice. Be concise but informative."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )
        content = response.choices[0].message.content
        return content.strip()
    except Exception as e:
        logger.error(f"Error generating conversational response: {e}")
        return "I've navigated you to the requested page. Is there anything specific you'd like to know about it?"


async def _local_transcribe_audio(audio_file) -> str:
    """
    Local audio transcription using speech_recognition library (offline, lower quality).
    This is a fallback for when cloud services are unavailable.
    """
    try:
        import speech_recognition as sr
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as tmp:
            tmp_path = tmp.name
            # Write audio data to temporary file
            audio_data = audio_file.read()
            tmp.write(audio_data)
        
        # Initialize recognizer
        recognizer = sr.Recognizer()
        
        # Load audio file
        with sr.AudioFile(tmp_path) as source:
            # Adjust for ambient noise
            recognizer.adjust_for_ambient_noise(source)
            # Record audio
            audio = recognizer.record(source)
        
        # Try to recognize using Google Web Speech API (requires internet)
        # If that fails, use Sphinx (offline but less accurate)
        try:
            text = recognizer.recognize_google(audio)
            logger.info("Local transcription successful using Google Web Speech API")
        except sr.UnknownValueError:
            # Google Speech Recognition could not understand audio
            logger.warning("Google Speech Recognition could not understand audio")
            try:
                # Try Sphinx (offline)
                text = recognizer.recognize_sphinx(audio)
                logger.info("Local transcription successful using Sphinx (offline)")
            except sr.UnknownValueError:
                logger.error("Sphinx could not understand audio")
                text = ""
        except sr.RequestError as e:
            logger.error(f"Could not request results from Google Speech Recognition service: {e}")
            text = ""
        
        # Clean up temporary file
        try:
            os.unlink(tmp_path)
        except:
            pass
        
        return text
        
    except ImportError:
        logger.error("speech_recognition not installed. Install with: pip install SpeechRecognition")
        return ""
    except Exception as e:
        logger.error(f"Local transcription failed: {e}")
        return ""
