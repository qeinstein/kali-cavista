"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Loader2 } from "lucide-react";

export default function VoiceNavigator() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const [availableRoutes, setAvailableRoutes] = useState<{ path: string, description: string }[]>([]);

  useEffect(() => {
    // Fetch dynamic routes on mount
    fetch('/api/routes')
      .then(res => res.json())
      .then(data => setAvailableRoutes(data))
      .catch(err => console.error("Could not load dynamic routes", err));
  }, []);

  const router = useRouter();

  const startRecording = async () => {
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
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access is required for voice navigation.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToBackend = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    // Pass the available routes to strictly guide the AI's intent routing
    formData.append("routes_context", JSON.stringify(availableRoutes));

    try {
      // NOTE: Ensure your FastAPI backend URL is correct. Here we assume it runs on port 8000.
      const response = await fetch("http://localhost:8000/api/v1/audio/voice-command", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process audio command");
      }

      const data = await response.json();
      console.log("Navigation intent received:", data);

      if (data.transcript) {
        setTranscript(data.transcript);
      }

      if (data.action === "navigate" && data.route) {
        router.push(data.route);
      }
    } catch (error) {
      console.error("Error sending audio to backend:", error);
      setTranscript("Sorry, I couldn't process that command.");
    } finally {
      setIsProcessing(false);
      // Clear message after a few seconds
      setTimeout(() => {
        setTranscript("");
      }, 3000);
    }
  };

  // Render logic for the visual feedback
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pr-4 pb-4">
      {/* Tooltip / Status Display */}
      {(transcript || isProcessing) && (
        <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md shadow-lg rounded-2xl px-4 py-3 border border-zinc-200 dark:border-zinc-700 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 max-w-xs text-right">
          {isProcessing && !transcript ? (
            <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
            </span>
          ) : (
            <span className="text-zinc-800 dark:text-zinc-200">"{transcript}"</span>
          )}
        </div>
      )}

      {/* Main button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`
          flex items-center justify-center rounded-full w-14 h-14 shadow-lg transition-all duration-300
          ${isRecording
            ? "bg-red-500 hover:bg-red-600 shadow-red-500/30 scale-110"
            : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
          }
          ${isProcessing ? "opacity-50 cursor-not-allowed scale-95" : "hover:scale-105"}
        `}
      >
        {isRecording ? (
          <Square className="w-5 h-5 text-white fill-current" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
