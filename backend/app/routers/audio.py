from fastapi import APIRouter, UploadFile, File, HTTPException, Form
import logging
from app.services.llm import transcribe_audio, extract_navigation_intent

router = APIRouter(prefix="/audio", tags=["Audio Navigation"])
logger = logging.getLogger(__name__)


@router.post("/voice-command", summary="Process Voice Navigation Command")
async def handle_voice_command(
    audio: UploadFile = File(...),
    routes_context: str = Form("[]")
):
    """
    Receives an audio blob, transcribes it, extracts the user's intent,
    and returns the best application route to navigate to.
    """
    if not audio:
        raise HTTPException(status_code=400, detail="No audio file provided")

    try:
        # 1. Transcribe audio using STT service
        transcript = await transcribe_audio(audio.file)

        if not transcript or not transcript.strip():
            logger.info("Empty audio transcription.")
            return {"action": "navigate", "route": "/", "transcript": ""}
            
        logger.info(f"User voice transcript: {transcript}")

        # 2. Extract intent via LLM using dynamic frontend routes context
        route = await extract_navigation_intent(transcript, routes_context)
        
        return {
            "action": "navigate",
            "route": route,
            "transcript": transcript
        }

    except Exception as e:
        logger.error(f"Error processing voice command: {e}")
        raise HTTPException(status_code=500, detail="Failed to process voice command.")
