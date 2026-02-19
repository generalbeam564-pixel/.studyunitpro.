
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { GraduationCap, Mail, Lock, Loader2, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface AuthScreenProps {
  initialIsLogin?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ initialIsLogin = true }) => {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsLogin(initialIsLogin);
  }, [initialIsLogin]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && !data.session) {
          setSuccessMsg('Account created! Check your email to confirm.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 blur-[150px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600 blur-[150px] rounded-full" />
      </div>

      <div className="w-full max-w-sm space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white shadow-2xl mb-2 floating">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tightest leading-none">StudyUnitPro</h1>
          <div className="flex items-center justify-center gap-2">
             <div className="h-[1px] w-6 bg-indigo-500" />
             <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[9px]">The Academic Cockpit</p>
             <div className="h-[1px] w-6 bg-indigo-500" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-2">Email Address</label>
              <div className="relative">
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl outline-none text-sm font-medium transition-all placeholder:text-slate-600"
                  placeholder="yourname@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-2">Password</label>
              <input 
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl outline-none text-sm font-medium transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[11px] font-bold flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-[11px] font-bold flex items-center gap-2">
                <CheckCircle2 size={14} /> {successMsg}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full py-4 premium-gradient text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <> {isLogin ? 'Log In' : 'Sign Up'} <ArrowRight size={18} /> </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-[0.2em]"
            >
              {isLogin ? "Create an account" : "Log in here"}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
           <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-indigo-500/80">
              <Sparkles size={10} />
              AI-Powered Performance
           </div>
        </div>
      </div>
    </div>
  );
};
