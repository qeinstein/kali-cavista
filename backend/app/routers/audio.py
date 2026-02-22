from fastapi import APIRouter, UploadFile, File, HTTPException, Form, BackgroundTasks
import logging
import json
from app.services.llm import transcribe_audio, extract_navigation_intent, generate_conversational_response
from app.services.tts import tts_service

router = APIRouter(prefix="/audio", tags=["Audio Navigation"])
logger = logging.getLogger(__name__)


@router.post("/voice-command", summary="Process Voice Navigation Command")
async def handle_voice_command(
    audio: UploadFile = File(...),
    routes_context: str = Form("[]"),
    page_context: str = Form("{}"),
    conversation_history: str = Form("[]")
):
    """
    Receives an audio blob, transcribes it, extracts the user's intent,
    navigates to the appropriate route, and generates a conversational response.
    Returns both the navigation action and audio response.
    """
    if not audio:
        raise HTTPException(status_code=400, detail="No audio file provided")

    try:
        # 1. Transcribe audio using STT service
        transcript = await transcribe_audio(audio.file)

        if not transcript or not transcript.strip():
            logger.info("Empty audio transcription.")
            return {
                "action": "navigate",
                "route": "/",
                "transcript": "",
                "response_text": "I didn't catch that. Could you repeat?",
                "audio_response": None
            }
            
        logger.info(f"User voice transcript: {transcript}")

        # 2. Parse context data
        try:
            routes = json.loads(routes_context)
            page_ctx = json.loads(page_context)
            history = json.loads(conversation_history)
        except json.JSONDecodeError:
            routes = []
            page_ctx = {}
            history = []

        # 3. Extract intent via LLM using dynamic frontend routes context
        route = await extract_navigation_intent(transcript, routes, page_ctx, history)
        
        # 4. Generate conversational response
        response_text = await generate_conversational_response(
            transcript, 
            route, 
            page_ctx, 
            history
        )
        
        # 5. Convert response to speech
        audio_response = None
        if response_text:
            audio_response = await tts_service.synthesize(response_text)
            if audio_response:
                # Convert to base64 for JSON response
                import base64
                audio_response = base64.b64encode(audio_response).decode('utf-8')
        
        return {
            "action": "navigate",
            "route": route,
            "transcript": transcript,
            "response_text": response_text,
            "audio_response": audio_response
        }

    except Exception as e:
        logger.error(f"Error processing voice command: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process voice command: {str(e)}")


@router.post("/stream-response", summary="Stream TTS Response")
async def stream_tts_response(
    text: str = Form(...)
):
    """
    Stream TTS response for real-time audio playback
    """
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")
    
    try:
        audio_data = await tts_service.synthesize(text)
        if not audio_data:
            raise HTTPException(status_code=500, detail="TTS synthesis failed")
        
        import base64
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        return {
            "audio_response": audio_base64,
            "text": text
        }
    except Exception as e:
        logger.error(f"Error streaming TTS: {e}")
        raise HTTPException(status_code=500, detail=f"TTS streaming failed: {str(e)}")
