
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface VoiceRecorderProps {
  onHintReceived: (hint: string) => void;
  currentQuestion?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onHintReceived, currentQuestion }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      analyzeEducatorInput();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const analyzeEducatorInput = async () => {
    if (!transcript.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I am taking a quiz. My educator just said: "${transcript}". The current question is: "${currentQuestion || 'Generic study session'}". Based on what the educator said, provide a short, helpful hint or clarification that helps me understand the concept better. Be concise.`,
      });
      
      if (response.text) {
        onHintReceived(response.text);
      }
    } catch (error) {
      console.error("AI Analysis Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm animate-in fade-in zoom-in duration-300 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-indigo-600'} text-white`}>
            {isRecording ? <Mic size={18} /> : <MicOff size={18} />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Ask questions</h4>
            <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium uppercase tracking-wider">
              {isRecording ? 'Listening...' : 'Audio Assistant'}
            </p>
          </div>
        </div>
        <button 
          onClick={toggleRecording}
          aria-label={isRecording ? "Stop speaking" : "Start speaking"}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isRecording 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700'
          }`}
        >
          {isRecording ? 'Finish Question' : 'Ask questions'}
        </button>
      </div>

      {isRecording && transcript && (
        <div className="bg-white/60 dark:bg-slate-900/50 p-3 rounded-lg border border-indigo-50/50 dark:border-indigo-900/30">
          <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2">"{transcript}"</p>
        </div>
      )}

      {isAnalyzing && (
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold py-2">
          <Loader2 size={14} className="animate-spin" />
          Thinking...
        </div>
      )}
    </div>
  );
};
