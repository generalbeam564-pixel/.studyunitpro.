
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Sparkles, Check, X, RotateCcw } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { StudyMaterial } from '../types';

interface VoiceNoteRecorderProps {
  onComplete: (material: StudyMaterial) => void;
  onCancel: () => void;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({ onComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'recording' | 'review' | 'refining'>('recording');
  const [refinedData, setRefinedData] = useState<{refinedContent: string; summary: string; highPriorityTopics: string[]} | null>(null);
  
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
        setTranscript(prev => prev + ' ' + currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      if (transcript.trim()) setStep('review');
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const processTranscript = async () => {
    setIsProcessing(true);
    setStep('refining');
    try {
      const result = await geminiService.processVoiceNote(transcript);
      setRefinedData(result);
    } catch (error) {
      console.error(error);
      alert("Failed to process voice note.");
      setStep('review');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (!refinedData) return;
    const newMaterial: StudyMaterial = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Voice Note ${new Date().toLocaleTimeString()}`,
      type: 'voice',
      content: refinedData.refinedContent,
      originalTranscript: transcript,
      summary: refinedData.summary,
      highPriorityTopics: refinedData.highPriorityTopics,
      processed: true,
      dateAdded: Date.now()
    };
    onComplete(newMaterial);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-indigo-600 dark:bg-indigo-700 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Mic size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Voice Study Notes</h2>
              <p className="text-xs text-indigo-100 font-medium">Capture thoughts, lectures, and ideas</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {step === 'recording' && (
            <div className="flex flex-col items-center gap-8 py-12 text-center">
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20 scale-150" />
                )}
                <button 
                  onClick={toggleRecording}
                  className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${
                    isRecording ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isRecording ? <MicOff size={40} /> : <Mic size={40} />}
                </button>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                  {isRecording ? 'Listening...' : 'Tap to Start'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  {isRecording ? 'Speak clearly into your microphone' : 'Record a quick thought or an entire lecture'}
                </p>
              </div>
              {transcript && (
                <div className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 max-h-32 overflow-y-auto">
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{transcript}..."</p>
                </div>
              )}
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">Original Transcript</h3>
                <textarea 
                  value={transcript} 
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full h-40 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none text-slate-700 dark:text-slate-200 text-sm leading-relaxed focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all"
                  placeholder="Speech will appear here..."
                />
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep('recording')}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> Re-record
                </button>
                <button 
                  onClick={processTranscript}
                  disabled={!transcript.trim() || isProcessing}
                  className="flex-[2] py-4 bg-indigo-600 dark:bg-indigo-700 text-white rounded-2xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                  Process with AI
                </button>
              </div>
            </div>
          )}

          {step === 'refining' && (
            <div className="space-y-6">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-6 py-12">
                  <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={48} />
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Distilling Content</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Shortening transcript and extracting key points...</p>
                  </div>
                </div>
              ) : refinedData ? (
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Original Speech</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-6">{transcript}</p>
                    </div>
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                      <h4 className="text-[10px] font-black uppercase text-indigo-400 dark:text-indigo-500 mb-2">AI Optimized</h4>
                      <textarea 
                        value={refinedData.refinedContent}
                        onChange={(e) => setRefinedData({...refinedData, refinedContent: e.target.value})}
                        className="w-full text-xs text-indigo-900 dark:text-indigo-200 bg-transparent outline-none resize-none leading-relaxed h-[120px]"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">Synthesized Summary</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">{refinedData.summary}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">Key Exam Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {refinedData.highPriorityTopics.map((topic, i) => (
                        <span key={i} className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 flex gap-4">
                    <button 
                      onClick={() => setStep('review')}
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleSave}
                      className="flex-[2] py-4 bg-indigo-600 dark:bg-indigo-700 text-white rounded-2xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-lg flex items-center justify-center gap-2"
                    >
                      <Check size={18} />
                      Save to Library
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
