
import React from 'react';
import { 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  Brain, 
  Zap, 
  ShieldCheck, 
  Target, 
  Layers, 
  CheckCircle2, 
  Star,
  Activity,
  Trophy,
  LayoutDashboard
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-500 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-slate-200/50 dark:border-white/5 px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
            <GraduationCap size={22} />
          </div>
          <span className="font-black text-xl tracking-tightest">StudyUnitPro</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="hidden md:block text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={onStart}
            className="px-6 py-3 premium-gradient text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500 blur-[150px] rounded-full floating" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500 blur-[150px] rounded-full floating" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800 animate-in fade-in slide-in-from-top-4 duration-700">
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">The Future of Academic Excellence</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tightest leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Master Any Subject <br />
            <span className="text-transparent bg-clip-text premium-gradient">With AI Precision.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            The elite AI study cockpit. Turn messy notes into high-performance study plans, 
            adaptive quizzes, and deep-learning insights in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-10 py-5 premium-gradient text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Start Studying Free <ArrowRight size={20} />
            </button>
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xl"
            >
              Existing Member
            </button>
          </div>

          <div className="pt-20 animate-in fade-in zoom-in duration-1000 delay-500">
            <div className="relative mx-auto max-w-5xl group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden aspect-video">
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <LayoutDashboard size={300} className="text-slate-100 dark:text-slate-800" />
                </div>
                <div className="absolute top-6 left-6 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-gradient-to-b from-transparent to-white/10">
                   <Zap size={48} className="text-indigo-600 mb-4 animate-bounce" />
                   <h3 className="text-2xl font-black tracking-tight mb-2">Intelligence in Motion</h3>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your dynamic dashboard awaits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-white dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600">The Core Engine</h2>
            <p className="text-4xl md:text-5xl font-black tracking-tightest">Engineered for Achievement.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Layers size={24} />,
                title: "Deep Indexing",
                desc: "Upload PDFs, lecture slides, or photos of your notes. Our AI distills them into core knowledge nodes instantly."
              },
              {
                icon: <Target size={24} />,
                title: "Rescue Missions",
                desc: "AI identifies your recurring weak spots and creates targeted 'Rescue' quizzes to fix them before exam day."
              },
              {
                icon: <Brain size={24} />,
                title: "Adaptive Roadmaps",
                desc: "Tell us your exam date and daily availability. We plot the most efficient path to mastery for you."
              }
            ].map((f, i) => (
              <div key={i} className="p-10 bg-slate-50 dark:bg-[#03081e] rounded-[2rem] border border-slate-200 dark:border-white/5 space-y-6 hover:translate-y-[-8px] transition-all duration-300">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg border border-slate-100 dark:border-slate-700">
                  {f.icon}
                </div>
                <h3 className="text-xl font-black tracking-tight">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Tiers Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600">Choose Your Trajectory</h2>
            <p className="text-4xl md:text-5xl font-black tracking-tightest">Simple, Honest Pricing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                tier: "Free",
                price: "$0",
                desc: "For occasional learners",
                features: ["3 Saved Knowledge Nodes", "Standard Quiz Mode", "Flashcard Basics"],
                cta: "Start Free",
                popular: false
              },
              {
                tier: "Pro",
                price: "$2.99",
                desc: "The power user choice",
                features: ["5 Saved Knowledge Nodes", "Hard Mode Quizzes", "Advanced Performance Stats", "Neural Flashcards"],
                cta: "Join Pro",
                popular: true
              },
              {
                tier: "Premium",
                price: "$5.99",
                desc: "Ultimate academic leverage",
                features: ["Unlimited Knowledge Nodes", "AI Rescue Missions", "Custom Exam Roadmaps", "Audio Dictation Mode"],
                cta: "Go Premium",
                popular: false
              }
            ].map((p, i) => (
              <div key={i} className={`p-10 rounded-[2.5rem] border-2 transition-all relative ${p.popular ? 'bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-500/20 text-white' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                {p.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-amber-950 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Most Popular</div>
                )}
                <div className="space-y-2 mb-8">
                  <h3 className="text-lg font-black uppercase tracking-widest opacity-80">{p.tier}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{p.price}</span>
                    <span className="text-sm font-bold opacity-60">/mo</span>
                  </div>
                  <p className="text-xs font-bold opacity-60 uppercase tracking-widest">{p.desc}</p>
                </div>

                <div className="space-y-4 mb-10">
                  {p.features.map((feat, fi) => (
                    <div key={fi} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className={`shrink-0 ${p.popular ? 'text-indigo-200' : 'text-indigo-600'}`} />
                      <span className="text-[11px] font-bold leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={onStart}
                  className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${p.popular ? 'bg-white text-indigo-600 shadow-xl' : 'bg-indigo-600 text-white shadow-lg'}`}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Testimonials */}
      <section className="py-32 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-5" />
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-8">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-amber-400 floating">
              <Star size={32} fill="currentColor" />
            </div>
            <h2 className="text-5xl font-black tracking-tightest leading-none">Loved by <br /> Elite Students.</h2>
            <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-sm">
              From Med school to Computer Science, StudyUnitPro is the secret weapon of the top 1%.
            </p>
          </div>
          <div className="space-y-6">
            {[
              { name: "Sarah J.", role: "Med Student", text: "Turned my 500-page textbook into a clear daily roadmap. I've never felt more prepared for a final." },
              { name: "Marcus T.", role: "CS Undergraduate", text: "The Rescue Missions are a game changer. It forces me to face exactly what I don't know." }
            ].map((t, i) => (
              <div key={i} className="p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm space-y-4">
                <p className="text-lg italic text-slate-300 font-medium">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full" />
                  <div>
                    <p className="text-sm font-black tracking-tight">{t.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-5xl md:text-7xl font-black tracking-tightest leading-none">Stop Studying. <br /> <span className="text-indigo-600">Start Succeeding.</span></h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-xl mx-auto">
            Join thousands of students using AI to reclaim their time and crush their exams.
          </p>
          <div className="pt-4">
             <button 
              onClick={onStart}
              className="px-12 py-6 premium-gradient text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
             >
               Get Started Free
             </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 premium-gradient rounded-lg flex items-center justify-center text-white shadow-lg">
              <GraduationCap size={18} />
            </div>
            <span className="font-black text-lg tracking-tightest">StudyUnitPro</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2025 AI STUDY SYSTEMS. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
             <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Privacy</button>
             <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
