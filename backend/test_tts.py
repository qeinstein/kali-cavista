import asyncio
import os
from app.services.tts import tts_service
from app.core.config import settings

async def test_tts():
    print("Testing TTS service...")
    print(f"TTS Service: {settings.TTS_SERVICE}")
    print(f"ElevenLabs API Key: {settings.ELEVENLABS_API_KEY[:10]}..." if settings.ELEVENLABS_API_KEY else "No API key")
    print(f"Voice ID: {settings.ELEVENLABS_VOICE_ID}")
    
    # Test with a simple text
    text = "Hello, this is a test of the text-to-speech system."
    
    try:
        audio_data = await tts_service.synthesize(text)
        if audio_data:
            print(f"✓ TTS synthesis successful! Audio data size: {len(audio_data)} bytes")
            # Save to file for testing
            with open("test_audio.mp3", "wb") as f:
                f.write(audio_data)
            print("✓ Audio saved to test_audio.mp3")
        else:
            print("✗ TTS synthesis returned None")
    except Exception as e:
        print(f"✗ TTS synthesis failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_tts())