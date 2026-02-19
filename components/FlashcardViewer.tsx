
import React, { useState } from 'react';
import { Flashcard } from '../types';
import { Card } from './Card';
import { ChevronLeft, ChevronRight, RotateCw, X } from 'lucide-react';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onClose: () => void;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ flashcards, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const card = flashcards[currentIndex];

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Flashcard Session</h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="relative perspective-1000">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full h-80 transition-all duration-500 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden">
            <Card className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-slate-100 dark:border-slate-800 shadow-xl dark:bg-slate-900">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs tracking-widest uppercase mb-4">Question</span>
              <p className="text-2xl font-semibold text-slate-800 dark:text-white leading-tight">{card.front}</p>
              <div className="mt-8 text-slate-400 dark:text-slate-500 flex items-center gap-2 text-sm font-medium">
                <RotateCw size={14} /> Tap to flip card
              </div>
            </Card>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <Card className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-indigo-100 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-900/20 shadow-xl dark:bg-slate-900">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs tracking-widest uppercase mb-4">Refined Answer</span>
              <p className="text-xl font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{card.back}</p>
            </Card>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <button 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
          {currentIndex + 1} <span className="text-slate-300 dark:text-slate-800 mx-1">/</span> {flashcards.length}
        </div>

        <button 
          onClick={handleNext} 
          disabled={currentIndex === flashcards.length - 1}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};
