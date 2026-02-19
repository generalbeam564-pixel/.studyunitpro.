
import React, { useState, useEffect } from 'react';
import { PracticeQuestion, QuizProgress, UserTier, WeakSpotInsight } from '../types';
import { Card } from './Card';
import { CheckCircle, XCircle, ArrowRight, Info, Sparkles, X, GraduationCap, RotateCcw, Lock, AlertTriangle, Star, Activity, Trophy, BookOpen, Lightbulb, Zap, Save } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';

interface QuickReviewProps {
  questions: PracticeQuestion[];
  tier: UserTier;
  initialProgress?: Partial<QuizProgress>;
  onProgress: (currentIndex: number, score: number, missedTopics: string[]) => void;
  onComplete: (score: number, missedTopics: string[]) => void;
  onClose: () => void;
  onUpgradeRequest: () => void;
  weakSpotInsights?: Record<string, WeakSpotInsight>;
  onStartRescueMission?: (topic: string) => void;
}

export const QuickReview: React.FC<QuickReviewProps> = ({ 
  questions, 
  tier,
  initialProgress,
  onProgress,
  onComplete, 
  onClose,
  onUpgradeRequest,
  weakSpotInsights,
  onStartRescueMission
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialProgress?.currentIndex || 0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(initialProgress?.score || 0);
  const [missedTopics, setMissedTopics] = useState<string[]>(initialProgress?.missedTopics || []);
  const [completed, setCompleted] = useState(false);
  const [resultStep, setResultStep] = useState<'score' | 'analysis'>('score');
  const [aiHint, setAiHint] = useState<string | null>(null);

  // Sync internal state to parent on change
  useEffect(() => {
    onProgress(currentIndex, score, missedTopics);
  }, [currentIndex, score, missedTopics]);

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === questions[currentIndex].answer) {
      setScore(s => s + 1);
    } else {
      setMissedTopics(prev => [...prev, questions[currentIndex].topic]);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setAiHint(null);
    } else {
      setCompleted(true);
    }
  };

  // Fix: Explicitly type uniqueMissedTopics as string[] to ensure 'topic' is correctly inferred as a string.
  const uniqueMissedTopics: string[] = Array.from(new Set(missedTopics));
  const isPremium = tier === UserTier.PREMIUM;

  if (completed) {
    if (resultStep === 'score') {
      return (
        <Card className="text-center max-w-xs w-full mx-auto p-8 rounded-3xl shadow-xl">
          <div className="space-y-6">
            <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg floating">
              <Trophy size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black">All Done!</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1">Practice Result</p>
            </div>
            <div>
              <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400">
                {score}<span className="text-lg text-slate-300">/{questions.length}</span>
              </div>
              <p className="text-xs font-bold text-slate-500 mt-1">{score === questions.length ? 'Perfect Score!' : 'Keep Practicing!'}</p>
            </div>
            <button 
              onClick={() => setResultStep('analysis')}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95"
            >
              Analyze Trouble Spots
            </button>
          </div>
        </Card>
      );
    }

    return (
      <Card className="max-w-md w-full mx-auto p-6 rounded-3xl shadow-xl">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Activity size={20} className="text-indigo-500" />
            <h3 className="text-lg font-black">Trouble Spots</h3>
          </div>

          <div className="relative">
            <div className={`space-y-4 ${!isPremium && uniqueMissedTopics.length > 0 ? 'blur-md pointer-events-none' : ''}`}>
              {uniqueMissedTopics.length > 0 ? (
                <>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Needs Work:</p>
                  <div className="space-y-3">
                    {uniqueMissedTopics.map((topic, i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">{topic}</span>
                          <AlertTriangle size={14} className="text-amber-500" />
                        </div>
                        
                        {isPremium && weakSpotInsights?.[topic] && (
                          <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-3">
                            <div className="space-y-1">
                              <p className="text-[9px] font-black uppercase text-indigo-600">Why this is hard:</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{weakSpotInsights[topic].explanation}"</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[9px] font-black uppercase text-indigo-600">How to fix it:</p>
                              <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                                <Sparkles size={10} /> {weakSpotInsights[topic].studyMethod}
                              </p>
                            </div>
                            <button 
                              onClick={() => onStartRescueMission?.(topic)}
                              className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg font-bold text-[9px] uppercase hover:bg-indigo-100 transition-all border border-indigo-200/50 flex items-center justify-center gap-1.5"
                            >
                              <Zap size={10} fill="currentColor" /> Start Focused Quiz
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle size={32} className="mx-auto text-green-500 mb-2" />
                  <p className="text-sm font-bold">Great Job!</p>
                  <p className="text-xs text-slate-400 mt-1">No major gaps found in this set.</p>
                </div>
              )}
            </div>

            {!isPremium && uniqueMissedTopics.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 space-y-3 px-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <Lock size={24} className="text-indigo-600 mb-1" />
                <h4 className="text-base font-black text-slate-900 dark:text-white">See the "Why"</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                  Premium users get AI explanations for their trouble spots and focused practice sessions.
                </p>
                <button 
                  onClick={onUpgradeRequest}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-[9px] uppercase shadow-md"
                >
                  Unlock AI Insights
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => onComplete(score, missedTopics)}
            className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-xl font-bold text-[10px] uppercase shadow-sm"
          >
            Finish Practice
          </button>
        </div>
      </Card>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase text-slate-400">Step {currentIndex + 1} of {questions.length}</p>
            <p className="text-[10px] text-indigo-600 font-bold uppercase truncate max-w-[200px]">{q.topic}</p>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all shadow-sm"
          >
            <Save size={12} /> Save & Exit
          </button>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={18} /></button>
      </div>

      <Card className="p-6 md:p-8 rounded-3xl shadow-xl bg-white dark:bg-slate-900 border-0 overflow-visible">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50 dark:bg-slate-800 rounded-t-3xl overflow-hidden">
           <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>
        
        <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-6 mt-2 leading-snug">
          {q.question}
        </h2>
        
        <div className="space-y-2">
          {q.options.map((option, idx) => {
            let bgColor = "bg-slate-50 dark:bg-slate-800 hover:border-indigo-400";
            if (isAnswered) {
              if (option === q.answer) bgColor = "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300";
              else if (option === selectedOption) bgColor = "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300";
              else bgColor = "bg-slate-50 dark:bg-slate-800 opacity-50";
            } else if (selectedOption === option) bgColor = "bg-indigo-50 border-indigo-500";

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(option)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-xl border-2 text-left text-xs md:text-sm font-bold transition-all ${bgColor}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-6 p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/20 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3 mb-4">
               <Sparkles className="text-indigo-600 shrink-0 mt-0.5" size={14} />
               <p className="text-indigo-900 dark:text-indigo-200 text-[11px] font-medium leading-relaxed italic">{q.explanation}</p>
            </div>
            <button 
              onClick={handleNext}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase shadow-lg active:scale-95"
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish'}
            </button>
          </div>
        )}
      </Card>
      
      {tier === UserTier.PREMIUM && !isAnswered && (
        <VoiceRecorder currentQuestion={q.question} onHintReceived={(hint) => setAiHint(hint)} />
      )}
      
      {aiHint && (
        <Card className="p-4 bg-indigo-50 border-indigo-200 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 mb-2">
             <Lightbulb size={14} className="text-indigo-600" />
             <p className="text-[10px] font-black uppercase text-indigo-600">Quick Hint</p>
          </div>
          <p className="text-xs font-medium text-slate-700 italic">"{aiHint}"</p>
        </Card>
      )}
    </div>
  );
};
