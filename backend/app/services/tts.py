import logging
import io
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class TTSService:
    """Text-to-Speech service for generating audio responses"""
    
    def __init__(self):
        self.service = settings.TTS_SERVICE
        self.elevenlabs_api_key = settings.ELEVENLABS_API_KEY
        self.elevenlabs_voice_id = settings.ELEVENLABS_VOICE_ID
        
    async def synthesize(self, text: str) -> Optional[bytes]:
        """
        Convert text to speech audio
        Returns: Audio bytes (MP3 format) or None if failed
        """
        if not text or not text.strip():
            return None
            
        try:
            if self.service == "elevenlabs" and self.elevenlabs_api_key:
                return await self._elevenlabs_tts(text)
            elif self.service == "google":
                return await self._google_tts(text)
            else:
                # Fallback to local TTS using pyttsx3 or similar
                return await self._local_tts(text)
        except Exception as e:
            logger.error(f"TTS synthesis failed: {e}")
            return None
    
    async def _elevenlabs_tts(self, text: str) -> bytes:
        """Use ElevenLabs API for high-quality TTS"""
        try:
            from elevenlabs.client import ElevenLabs
            from elevenlabs import VoiceSettings
            
            client = ElevenLabs(api_key=self.elevenlabs_api_key)
            
            # Use the text_to_speech method
            audio_generator = client.text_to_speech.convert(
                voice_id=self.elevenlabs_voice_id,
                text=text,
                model_id="eleven_multilingual_v2",
                voice_settings=VoiceSettings(
                    stability=0.5,
                    similarity_boost=0.75
                )
            )
            
            # Collect audio data
            audio_data = b""
            for chunk in audio_generator:
                audio_data += chunk
            
            return audio_data
        except Exception as e:
            logger.error(f"ElevenLabs TTS failed: {e}")
            # Fallback to local TTS
            return await self._local_tts(text)
    
    async def _google_tts(self, text: str) -> bytes:
        """Google Cloud Text-to-Speech (placeholder implementation)"""
        # This would require google-cloud-texttospeech package
        # For now, return None to indicate not implemented
        logger.warning("Google TTS not implemented yet")
        return None
    
    async def _local_tts(self, text: str) -> bytes:
        """Local TTS using pyttsx3 (offline, lower quality)"""
        try:
            import pyttsx3
            import tempfile
            import os
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
                tmp_path = tmp.name
            
            # Initialize pyttsx3
            engine = pyttsx3.init()
            engine.setProperty('rate', 150)  # Speed
            engine.setProperty('volume', 1.0)  # Volume
            
            # Try to set a voice
            voices = engine.getProperty('voices')
            if voices:
                # Try to find an English voice
                for voice in voices:
                    if 'en' in voice.id.lower():
                        engine.setProperty('voice', voice.id)
                        break
            
            # Save to file
            engine.save_to_file(text, tmp_path)
            engine.runAndWait()
            
            # Read file content
            with open(tmp_path, 'rb') as f:
                audio_data = f.read()
            
            # Clean up
            os.unlink(tmp_path)
            
            return audio_data
        except ImportError:
            logger.error("pyttsx3 not installed. Install with: pip install pyttsx3")
            return None
        except Exception as e:
            logger.error(f"Local TTS failed: {e}")
            return None

# Global instance
tts_service = TTSService()