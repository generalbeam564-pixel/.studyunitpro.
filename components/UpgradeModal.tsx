
import React from 'react';
import { CheckCircle2, GraduationCap, X, Sparkles, Zap, ShieldCheck, Trophy, Crown } from 'lucide-react';
import { UserTier } from '../types';

interface UpgradeModalProps {
  onUpgrade: (tier: UserTier) => void;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ onUpgrade, onClose }) => {
  const tiers = [
    {
      id: UserTier.FREE,
      name: "Free",
      price: "$0",
      description: "Basic features for everyone.",
      features: ["3 Saved Notes", "Standard Quizzes", "Normal Level"],
      cta: "Current",
      icon: <GraduationCap size={20} className="text-slate-400" />,
      color: "bg-slate-50 dark:bg-slate-900/50 border-slate-100"
    },
    {
      id: UserTier.PRO,
      name: "Pro",
      price: "$2.99",
      description: "Better studying tools.",
      features: ["5 Saved Notes", "Harder Quizzes", "Flashcards", "Full Stats"],
      cta: "Go Pro",
      popular: true,
      icon: <Zap size={20} className="text-amber-500" />,
      color: "bg-indigo-600 text-white border-indigo-700 shadow-xl"
    },
    {
      id: UserTier.PREMIUM,
      name: "Premium",
      price: "$5.99",
      description: "The ultimate package.",
      features: ["Unlimited Notes", "AI Weak Spot Analysis", "Voice Assistant", "Custom Study Path"],
      cta: "Go Premium",
      icon: <Crown size={20} className="text-indigo-400" />,
      color: "bg-slate-900 text-white border-slate-800 shadow-2xl"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/5 max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 z-[110] transition-colors"><X size={20} /></button>

        <div className="w-full md:w-64 premium-gradient p-8 text-white flex flex-col justify-center relative shrink-0">
           <div className="relative z-10 space-y-4">
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md floating"><Sparkles size={24} /></div>
             <h2 className="text-3xl font-black leading-tight">Learn Faster.</h2>
             <p className="text-indigo-50 text-sm font-medium opacity-90 leading-snug">Choose the plan that fits your study style.</p>
           </div>
        </div>

        <div className="flex-1 p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
          {tiers.map((tier) => (
            <div 
              key={tier.id}
              onClick={() => tier.id !== UserTier.FREE && onUpgrade(tier.id)}
              className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all cursor-pointer group hover:scale-[1.01] ${
                tier.id === UserTier.FREE ? 'opacity-40 grayscale cursor-not-allowed pointer-events-none' : tier.color
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-amber-400 text-amber-950 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
              )}
              <div className="mb-6 flex justify-between items-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.id === UserTier.FREE ? 'bg-slate-200' : 'bg-white/10'}`}>{tier.icon}</div>
                <p className="text-lg font-black">{tier.price}</p>
              </div>

              <h3 className="text-base font-black mb-1 uppercase tracking-tight">{tier.name}</h3>
              <p className="text-[10px] font-bold opacity-70 mb-6 uppercase tracking-wider">{tier.description}</p>

              <div className="flex-1 space-y-3 mb-6">
                {tier.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="shrink-0 opacity-70" />
                    <span className="text-[10px] font-bold leading-tight">{f}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-3 rounded-xl font-bold text-[10px] uppercase shadow-md ${tier.id === UserTier.FREE ? 'bg-slate-200' : 'bg-white text-indigo-600'}`}>{tier.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
