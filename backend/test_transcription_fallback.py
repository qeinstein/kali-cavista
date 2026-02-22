import asyncio
import os
from app.services.llm import transcribe_audio
from app.core.config import settings

async def test_transcription_fallback():
    """Test the transcription fallback mechanism"""
    print("Testing transcription fallback mechanism...")
    print(f"TRANSCRIPTION_SERVICE: {settings.TRANSCRIPTION_SERVICE}")
    print(f"GROQ_API_KEY: {'Set' if settings.GROQ_API_KEY else 'Not set'}")
    print(f"OPENROUTER_API_KEY: {'Set' if settings.OPENROUTER_API_KEY else 'Not set'}")
    
    # Create a simple test audio file (you'll need to provide a real audio file)
    # For testing, we'll create a dummy file
    test_audio_path = "test_audio.webm"
    
    # Create a dummy audio file (this won't actually transcribe anything)
    # In a real test, you would use an actual audio file
    with open(test_audio_path, "wb") as f:
        f.write(b"dummy audio data")
    
    try:
        with open(test_audio_path, "rb") as f:
            transcript = await transcribe_audio(f)
            if transcript:
                print(f"✓ Transcription successful: {transcript}")
            else:
                print("✗ Transcription returned empty string (expected for dummy audio)")
    except Exception as e:
        print(f"✗ Transcription failed: {e}")
    finally:
        # Clean up
        try:
            os.unlink(test_audio_path)
        except:
            pass
    
    print("\nFallback mechanism test completed.")

if __name__ == "__main__":
    asyncio.run(test_transcription_fallback())