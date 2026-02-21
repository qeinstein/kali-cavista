"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Loader2, Volume2, VolumeX } from "lucide-react";
import { extractPageContext, extractAvailableActions } from '../utils/pageAccessibility';
import { conversationManager } from '../utils/conversationState';
import { getAudioEndpoint, getRoutesEndpoint } from '../utils/apiConfig';

export default function VoiceNavigator() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [responseText, setResponseText] = useState("");
  const [pageContext, setPageContext] = useState<any>({});
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const audioSource = useRef<AudioBufferSourceNode | null>(null);
  const [availableRoutes, setAvailableRoutes] = useState<{ path: string, description: string }[]>([]);
  const [isInterruptible, setIsInterruptible] = useState(false);
  const [conversationMode, setConversationMode] = useState(false);
  const [conversationSummary, setConversationSummary] = useState("");

  useEffect(() => {
    // Fetch dynamic routes on mount
    const routesEndpoint = getRoutesEndpoint();
    fetch(routesEndpoint)
      .then(res => res.json())
      .then(data => setAvailableRoutes(data))
      .catch(err => console.error("Could not load dynamic routes", err));
  }, []);

  // Update page context when route changes
  useEffect(() => {
    const updatePageContext = () => {
      const context = extractPageContext();
      setPageContext(context);
      conversationManager.updateContext({ pageContext: context });
    };

    updatePageContext();
    window.addEventListener('popstate', updatePageContext);
    return () => window.removeEventListener('popstate', updatePageContext);
  }, []);

  // Update conversation summary periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (conversationManager.isConversationActive()) {
        setConversationSummary(conversationManager.getSummary());
      } else {
        setConversationSummary("");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const router = useRouter();

  const startRecording = async () => {
    // If currently playing audio, stop it first (interruptibility)
    if (isPlaying) {
      stopAudioPlayback();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        await sendAudioToBackend(audioBlob);

        // Stop all tracks to release the mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setTranscript("");
      setResponseText("");
      setIsInterruptible(true);
      setConversationMode(true);
      conversationManager.setInterruptible(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access is required for voice navigation.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsInterruptible(false);
      conversationManager.setInterruptible(false);
    }
  };

  const stopAudioPlayback = () => {
    if (audioSource.current) {
      try {
        audioSource.current.stop();
        audioSource.current.disconnect();
      } catch (e) {
        // Already stopped
      }
      audioSource.current = null;
    }
    if (audioContext.current) {
      try {
        audioContext.current.close();
      } catch (e) {
        // Already closed
      }
      audioContext.current = null;
    }
    setIsPlaying(false);
    conversationManager.setPlaying(false);
  };

  const playAudioResponse = async (audioBase64: string) => {
    if (!audioBase64) return;

    try {
      // Stop any current playback
      stopAudioPlayback();

      // Create audio context
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Decode audio data
      const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const audioBuffer = await audioContext.current.decodeAudioData(audioData.buffer);
      
      // Create source and connect to output
      audioSource.current = audioContext.current.createBufferSource();
      audioSource.current.buffer = audioBuffer;
      audioSource.current.connect(audioContext.current.destination);
      
      // Set up completion handler
      audioSource.current.onended = () => {
        setIsPlaying(false);
        setIsInterruptible(false);
        conversationManager.setPlaying(false);
        conversationManager.setInterruptible(false);
        // Enable recording again after a short delay
        setTimeout(() => {
          if (!isRecording) {
            setIsInterruptible(true);
            conversationManager.setInterruptible(true);
          }
        }, 500);
      };

      // Start playback
      audioSource.current.start();
      setIsPlaying(true);
      setIsInterruptible(true);
      conversationManager.setPlaying(true);
      conversationManager.setInterruptible(true);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  };

  const sendAudioToBackend = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    // Pass the available routes and current page context
    formData.append("routes_context", JSON.stringify(availableRoutes));
    formData.append("page_context", JSON.stringify(pageContext));
    
    // Get conversation history from conversation manager
    const history = conversationManager.getFullHistory();
    formData.append("conversation_history", JSON.stringify(history));

    // Get API endpoint from configuration
    const apiUrl = getAudioEndpoint();

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process audio command");
      }

      const data = await response.json();
      console.log("Voice command response:", data);

      // Update transcript
      if (data.transcript) {
        setTranscript(data.transcript);
      }

      // Update response text
      if (data.response_text) {
        setResponseText(data.response_text);
      }

      // Navigate if needed
      if (data.action === "navigate" && data.route) {
        router.push(data.route);
      }

      // Play audio response
      if (data.audio_response) {
        await playAudioResponse(data.audio_response);
      }

      // Update conversation history
      if (data.transcript && data.response_text) {
        conversationManager.addUserTurn(
          data.transcript, 
          data.response_text, 
          data.route, 
          pageContext
        );
      }
    } catch (error) {
      console.error("Error sending audio to backend:", error);
      setResponseText("Sorry, I couldn't process that command.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Render logic for the visual feedback
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pr-4 pb-4">
      {/* Conversation Panel */}
      {(conversationMode || transcript || responseText || isProcessing) && (
        <div className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md shadow-xl rounded-2xl px-4 py-3 border border-zinc-200 dark:border-zinc-700 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 max-w-xs">
          {/* Status indicators */}
          <div className="flex items-center gap-2 mb-2">
            {isRecording && (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Listening...
              </span>
            )}
            {isPlaying && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Speaking...
              </span>
            )}
            {isProcessing && !isRecording && !isPlaying && (
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Processing...
              </span>
            )}
          </div>

          {/* User transcript */}
          {transcript && (
            <div className="mb-2 text-zinc-600 dark:text-zinc-300">
              <span className="text-zinc-500 dark:text-zinc-400">You: </span>
              "{transcript}"
            </div>
          )}

          {/* Assistant response */}
          {responseText && (
            <div className="text-zinc-800 dark:text-zinc-200">
              <span className="text-blue-600 dark:text-blue-400">Assistant: </span>
              {responseText}
            </div>
          )}

          {/* Conversation summary */}
          {conversationSummary && !responseText && !isProcessing && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
              {conversationSummary}
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && !transcript && !responseText && (
            <div className="text-zinc-600 dark:text-zinc-300">
              Listening...
            </div>
          )}
        </div>
      )}

      {/* Control buttons */}
      <div className="flex items-center gap-2">
        {/* Stop playback button (when playing) */}
        {isPlaying && (
          <button
            onClick={stopAudioPlayback}
            className="flex items-center justify-center rounded-full w-10 h-10 bg-yellow-500 hover:bg-yellow-600 shadow-lg transition-all duration-300"
            title="Stop playback"
          >
            <VolumeX className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Main voice button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing && !isRecording}
          className={`
            flex items-center justify-center rounded-full w-14 h-14 shadow-lg transition-all duration-300
            ${isRecording
              ? "bg-red-500 hover:bg-red-600 shadow-red-500/30 scale-110"
              : isPlaying
                ? "bg-green-500 hover:bg-green-600 shadow-green-500/30"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
            }
            ${isProcessing && !isRecording ? "opacity-50 cursor-not-allowed scale-95" : "hover:scale-105"}
          `}
          title={isRecording ? "Stop recording" : isPlaying ? "Playing audio..." : "Start conversation"}
        >
          {isRecording ? (
            <Square className="w-5 h-5 text-white fill-current" />
          ) : isPlaying ? (
            <Volume2 className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Conversation mode indicator */}
      {conversationMode && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {isInterruptible ? "Interruptible mode active" : "Conversation mode"}
        </div>
      )}
    </div>
  );
}
