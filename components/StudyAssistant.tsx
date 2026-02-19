
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Minimize2, Maximize2, Sparkles, Loader2, MessageSquareText } from 'lucide-react';
import { ChatMessage, StudyMaterial, UserTier, QuizDifficulty } from '../types';
import { geminiService } from '../services/geminiService';

interface StudyAssistantProps {
  materials: StudyMaterial[];
  tier: UserTier;
  difficulty: QuizDifficulty;
  userName: string;
  history: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearHistory: () => void;
  isOpen: boolean; // Managed by parent sidebar
  onClose: () => void;
}

export const StudyAssistant: React.FC<StudyAssistantProps> = ({
  materials,
  tier,
  difficulty,
  userName,
  history,
  onSendMessage,
  onClearHistory,
  isOpen,
  onClose
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    onSendMessage(userMessage);
    setIsLoading(true);

    try {
      const response = await geminiService.chatAssistant(
        history,
        userMessage,
        materials,
        tier,
        difficulty,
        userName
      );
      onSendMessage(response); 
    } catch (error) {
      console.error(error);
      onSendMessage("I'm sorry, I encountered an error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed right-6 md:right-8 bottom-24 z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'h-16 w-64' : 'h-[600px] w-[350px] md:w-[400px]'} bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden glass`}>
      {/* Header */}
      <div className="h-16 premium-gradient flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white backdrop-blur-md">
            <Bot size={18} />
          </div>
          <div className="leading-tight">
            <h3 className="text-white text-xs font-black uppercase tracking-widest">Study Assistant</h3>
            <p className="text-[9px] text-white/70 font-bold flex items-center gap-1 uppercase">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> AI Tutor Active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors">
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Container */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
            {history.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                <Sparkles size={40} className="text-indigo-500" />
                <div>
                  <p className="text-xs font-black uppercase text-slate-400">Welcome, {userName}</p>
                  <p className="text-[10px] font-medium text-slate-500 max-w-[200px] mx-auto mt-2 italic">
                    I'm your AI academic tutor. Ask me about your notes, concepts, or to quiz you!
                  </p>
                </div>
              </div>
            )}
            
            {history.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 text-xs font-medium leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/20' 
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-white/5 rounded-tl-none'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5 opacity-60">
                    {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                    <span className="text-[8px] font-black uppercase tracking-tighter">
                      {msg.role === 'user' ? 'You' : 'Assistant'}
                    </span>
                  </div>
                  <div className="prose prose-invert prose-sm break-words whitespace-pre-wrap">
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assistant is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 pt-0 shrink-0">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your tutor anything..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl pl-5 pr-14 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:text-white"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 w-10 h-10 premium-gradient rounded-xl text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="flex justify-between items-center mt-3 px-2">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Context: {materials.length} Notes
              </p>
              <button onClick={onClearHistory} className="text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">
                Clear Chat
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
