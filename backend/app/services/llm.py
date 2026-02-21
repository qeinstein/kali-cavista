import json
import logging
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
    Transcribes audio using Groq's whisper-large-v3.
    """
    if not groq_client:
        return ""
    try:
        # Groq required format
        transcription = await groq_client.audio.transcriptions.create(
            file=("audio.webm", audio_file.read(), "audio/webm"), # Fallback to webm or wav depending on frontend
            model="whisper-large-v3",
            language="en"
        )
        return transcription.text
    except Exception as e:
        logger.error(f"Error during audio transcription: {e}")
        return ""


async def extract_navigation_intent(transcript: str, routes_context: str = "[]") -> str:
    """
    Given a transcript, use an LLM via OpenRouter to determine the best app route dynamically.
    """
    if not openai_client or not transcript:
        return "/"

    # Try to parse the frontend routes to include in the system prompt
    try:
        parsed_routes = json.loads(routes_context)
        routes_display = "\\n".join(
            [f"- Path: '{r.get('path')}' (Description: {r.get('description', 'Unknown')})" for r in parsed_routes]
        )
    except Exception as e:
        logger.warning(f"Could not parse routes_context: {e}")
        routes_display = "- Path: '/' (Description: Home/Overview)"
        
    prompt = f"""
    The user is using a health partner application. They sent a voice navigation command.
    Transcript: "{transcript}"
    
    Here are the ONLY available routes in the application and their descriptions:
    {routes_display}

    Determine which application screen the user wants to navigate to based on their intent. 
    Return a JSON object with a single 'route' key containing the exact string of the chosen path. 
    If none match perfectly, default to "/" or the closest logical route.
    """
    
    try:
        response = await openai_client.chat.completions.create(
            model="meta-llama/llama-3-8b-instruct:free", # Using a free speedy model from openrouter
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
