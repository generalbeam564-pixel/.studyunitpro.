
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  LogOut, 
  Plus, 
  FileText, 
  Brain, 
  Zap, 
  Layers, 
  CheckCircle2,
  Clock,
  Loader2,
  Cloud,
  Moon,
  Sun,
  Trash2,
  Mic,
  Image as ImageIcon,
  Play,
  Lock,
  Target,
  BarChart3,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Calendar,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Star,
  Info,
  LifeBuoy,
  Send,
  Activity,
  ArrowUpRight,
  Circle,
  CheckCircle,
  ListTodo,
  FileUp,
  PencilLine,
  X,
  UploadCloud,
  Mic2,
  Keyboard,
  User,
  KeyRound,
  Mail,
  UserX,
  Cpu,
  Fingerprint,
  Edit3,
  Save,
  Crown,
  RotateCcw,
  Flame,
  Trophy,
  MessageSquareText
} from 'lucide-react';
import { AppState, StudyMaterial, UserTier, QuizDifficulty, StudyPlanDay, WeakSpotInsight, UserStats, ChatMessage } from './types';
import { geminiService } from './services/geminiService';
import { Card } from './components/Card';
import { QuickReview } from './components/QuickReview';
import { FlashcardViewer } from './components/FlashcardViewer';
import { UpgradeModal } from './components/UpgradeModal';
import { VoiceNoteRecorder } from './components/VoiceNoteRecorder';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { StudyAssistant } from './components/StudyAssistant';
import { supabase } from './services/supabase';

const INITIAL_STATE: AppState = {
  materials: [],
  selectedMaterialIds: [],
  plan: [],
  flashcards: [],
  stats: {
    sessionsCompleted: 0,
    totalTimeMinutes: 0,
    questionsAnswered: 0,
    currentStreak: 0,
    longestStreak: 0,
    questionsToday: 0,
    dailyGoal: 20
  },
  tier: UserTier.FREE,
  examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dailyTimeMinutes: 45,
  lastSync: Date.now(),
  weakSpots: {},
  darkMode: false,
  chatHistory: []
};

const NOTE_LIMITS = {
  [UserTier.FREE]: 3,
  [UserTier.PRO]: 5,
  [UserTier.PREMIUM]: 10
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authState, setAuthState] = useState<'landing' | 'auth'>('landing');
  const [initialIsLogin, setInitialIsLogin] = useState(true);
  
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [view, setView] = useState<'dashboard' | 'review' | 'flashcards' | 'settings' | 'support'>('dashboard');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualText, setManualText] = useState('');
  
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [showDifficultySetup, setShowDifficultySetup] = useState(false);
  
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  const tierMaxQuestions = state.tier === UserTier.PREMIUM ? 30 : state.tier === UserTier.PRO ? 20 : 10;
  const [quizLength, setQuizLength] = useState(5);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('Standard');

  // Settings State
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: '', subject: '', message: '' });
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [settingsStatus, setSettingsStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Helper to refresh signed URLs for private files
  const refreshSignedUrls = async (materials: StudyMaterial[]) => {
    const filesToSign = materials.filter(m => m.storagePath && m.type === 'image');
    if (filesToSign.length === 0) return materials;

    const paths = filesToSign.map(m => m.storagePath!);
    const { data, error } = await supabase.storage.from('app-files').createSignedUrls(paths, 3600);

    if (error || !data) return materials;

    return materials.map(m => {
      if (m.storagePath && m.type === 'image') {
        const signed = data.find(d => d.path === m.storagePath);
        return { ...m, signedUrl: signed?.signedUrl };
      }
      return m;
    });
  };

  // AUTHENTICATION
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setNewUsername(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '');
        setNewEmail(session.user.email || '');
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // LOAD DATA FROM DB
  useEffect(() => {
    if (!user) return;

    const loadAllData = async () => {
      setSyncing(true);
      
      const { data: notesData } = await supabase
        .from('study_materials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data: stateRow } = await supabase
        .from('user_state')
        .select('state_data')
        .eq('user_id', user.id)
        .single();

      if (notesData) {
        let mappedMaterials: StudyMaterial[] = notesData.map(n => ({
          id: n.id,
          name: n.name,
          type: n.type as any,
          content: n.content,
          storagePath: n.storage_path,
          originalTranscript: n.original_transcript,
          summary: n.summary,
          highPriorityTopics: n.high_priority_topics,
          processed: n.processed,
          dateAdded: new Date(n.created_at).getTime()
        }));

        mappedMaterials = await refreshSignedUrls(mappedMaterials);

        // Merge initial state stats structure for safety
        const savedState = stateRow?.state_data || {};
        const mergedStats = { ...INITIAL_STATE.stats, ...(savedState.stats || {}) };

        setState(prev => ({
          ...prev,
          materials: mappedMaterials,
          ...savedState,
          stats: mergedStats,
          chatHistory: savedState.chatHistory || []
        }));
      }
      setSyncing(false);
    };

    loadAllData();
  }, [user]);

  // AUTO-SYNC METADATA
  useEffect(() => {
    if (!user) return;

    const syncMetadata = async () => {
      setSyncing(true);
      const { materials, ...metadata } = state;
      await supabase
        .from('user_state')
        .upsert({ 
          user_id: user.id, 
          state_data: metadata,
          updated_at: new Date().toISOString() 
        });
      setSyncing(false);
    };

    const debounceTimer = setTimeout(syncMetadata, 3000);
    return () => clearTimeout(debounceTimer);
  }, [state.plan, state.stats, state.tier, state.weakSpots, state.darkMode, state.currentQuiz, state.chatHistory, user]);

  useEffect(() => {
    if (state.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [state.darkMode]);

  const toggleDarkMode = () => setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
    setState(INITIAL_STATE); 
    setView('dashboard'); 
    setAuthState('landing');
  };

  const activeMaterials = useMemo(() => state.materials.filter(m => state.selectedMaterialIds.includes(m.id)), [state.materials, state.selectedMaterialIds]);

  const toggleMaterialSelection = (id: string) => {
    setState(prev => ({
      ...prev,
      selectedMaterialIds: prev.selectedMaterialIds.includes(id) 
        ? prev.selectedMaterialIds.filter(mid => mid !== id) 
        : [...prev.selectedMaterialIds, id]
    }));
  };

  const isAtLimit = () => {
    return state.materials.length >= NOTE_LIMITS[state.tier];
  };

  const generatePlan = async () => {
    if (activeMaterials.length === 0) return alert("Select notes to focus your plan!");
    setIsGeneratingPlan(true);
    try {
      const plan = await geminiService.generateStudyPlan(activeMaterials, state.examDate, state.dailyTimeMinutes);
      setState(prev => ({ ...prev, plan }));
      setSelectedTaskIndex(null);
    } catch (err) { console.error(err); } finally { setIsGeneratingPlan(false); }
  };

  const markTaskDone = () => {
    if (selectedTaskIndex === null || state.plan.length === 0) return;
    const newPlan = [...state.plan];
    const todayPlan = { ...newPlan[0] };
    const newTaskStatus = [...todayPlan.taskStatus];
    newTaskStatus[selectedTaskIndex] = true;
    todayPlan.taskStatus = newTaskStatus;
    if (newTaskStatus.every(s => s === true)) todayPlan.completed = true;
    newPlan[0] = todayPlan;
    setState(prev => ({ ...prev, plan: newPlan }));
    setSelectedTaskIndex(null);
  };

  const startReview = async (customMaterials?: StudyMaterial[]) => {
    const materialsToUse = customMaterials || activeMaterials;
    if (materialsToUse.length === 0) return alert("Select at least one note to practice!");
    setIsLoading(true);
    setShowDifficultySetup(false);
    try {
      const questions = await geminiService.generateQuiz(materialsToUse, quizLength, difficulty);
      setState(prev => ({ ...prev, currentQuiz: { questions, currentIndex: 0, score: 0, missedTopics: [], difficulty } }));
      setView('review');
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleDifficultyClick = (d: QuizDifficulty) => {
    const isLocked = (d === 'Challenger' && state.tier === UserTier.FREE) || (d === 'Expert' && state.tier !== UserTier.PREMIUM);
    if (isLocked) {
      setShowUpgrade(true);
      return;
    }
    setDifficulty(d);
  };

  const handleManualSubmission = async () => {
    if (!manualText.trim()) return;
    if (isAtLimit()) { setShowUpgrade(true); return; }
    setIsLoading(true);
    setShowManualInput(false);
    try {
      const material: StudyMaterial = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Typed Note ${new Date().toLocaleDateString()}`,
        type: 'text',
        content: manualText,
        processed: false,
        dateAdded: Date.now()
      };
      const result = await geminiService.processMaterial(material);
      
      const { data: saved } = await supabase
        .from('study_materials')
        .insert({
          user_id: user.id,
          name: material.name,
          type: material.type,
          content: material.content,
          summary: result.summary,
          high_priority_topics: result.highPriorityTopics,
          processed: true
        })
        .select()
        .single();

      if (saved) {
        const final = { ...material, id: saved.id, summary: saved.summary, highPriorityTopics: saved.high_priority_topics, processed: true };
        setState(prev => ({
          ...prev,
          materials: [final, ...prev.materials],
          selectedMaterialIds: [...prev.selectedMaterialIds, final.id]
        }));
      }
      setManualText('');
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (isAtLimit()) { setShowUpgrade(true); return; }
    setIsLoading(true);
    try {
      const materialId = Math.random().toString(36).substr(2, 9);
      const isImage = file.type.startsWith('image');
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storagePath = `${user.id}/materials/${materialId}/${fileName}`;

      let content = '';
      let storageUrl = '';

      // 1. Storage Upload
      const { error: uploadError } = await supabase.storage
        .from('app-files')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // 2. Content Extraction
      if (isImage) {
        content = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const { data: signedData } = await supabase.storage.from('app-files').createSignedUrl(storagePath, 3600);
        storageUrl = signedData?.signedUrl || '';
      } else {
        content = await file.text();
      }

      const initialMaterial: StudyMaterial = {
        id: materialId,
        name: file.name,
        type: isImage ? 'image' : 'text',
        content: content,
        storagePath: storagePath,
        signedUrl: isImage ? storageUrl : undefined,
        processed: false,
        dateAdded: Date.now()
      };

      // 3. AI Distillation
      const result = await geminiService.processMaterial(initialMaterial);
      
      // 4. DB Persistence
      const { data: saved, error: dbError } = await supabase
        .from('study_materials')
        .insert({
          user_id: user.id,
          name: initialMaterial.name,
          type: initialMaterial.type,
          content: initialMaterial.content,
          storage_path: initialMaterial.storagePath,
          summary: result.summary,
          high_priority_topics: result.highPriorityTopics,
          processed: true
        })
        .select()
        .single();

      if (dbError) throw dbError;

      if (saved) {
        const final = { ...initialMaterial, id: saved.id, summary: saved.summary, highPriorityTopics: saved.high_priority_topics, processed: true };
        setState(prev => ({
          ...prev,
          materials: [final, ...prev.materials],
          selectedMaterialIds: [...prev.selectedMaterialIds, final.id]
        }));
      }
    } catch (err) { 
      console.error(err); 
      alert("Failed to process file.");
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleVoiceComplete = async (m: StudyMaterial) => {
    if (isAtLimit()) { setShowUpgrade(true); return; }
    setIsLoading(true);
    try {
      const { data: saved } = await supabase
        .from('study_materials')
        .insert({
          user_id: user.id,
          name: m.name,
          type: 'voice',
          content: m.content,
          original_transcript: m.originalTranscript,
          summary: m.summary,
          high_priority_topics: m.highPriorityTopics,
          processed: true
        })
        .select()
        .single();

      if (saved) {
        const final = { ...m, id: saved.id };
        setState(p => ({
          ...p, 
          materials: [final, ...p.materials], 
          selectedMaterialIds: [...p.selectedMaterialIds, final.id]
        }));
      }
    } catch (e) { console.error(e); } finally {
      setIsLoading(false);
      setShowVoiceRecorder(false);
    }
  };

  const startFlashcards = async () => {
    if (state.tier === UserTier.FREE) { setShowUpgrade(true); return; }
    if (activeMaterials.length === 0) return alert("Select notes to generate cards!");
    setIsLoading(true);
    try {
      const flashcards = await geminiService.generateFlashcards(activeMaterials);
      setState(prev => ({ ...prev, flashcards }));
      setView('flashcards');
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleDeleteNote = async (id: string) => {
    if (!window.confirm("Delete this material?")) return;
    
    const target = state.materials.find(m => m.id === id);
    
    if (target?.storagePath) {
      await supabase.storage.from('app-files').remove([target.storagePath]);
    }

    const { error } = await supabase.from('study_materials').delete().eq('id', id);

    if (!error) {
      setState(prev => ({
        ...prev,
        materials: prev.materials.filter(m => m.id !== id),
        selectedMaterialIds: prev.selectedMaterialIds.filter(mid => mid !== id)
      }));
    }
  };

  const handleQuizComplete = async (sc: number, miss: string[]) => {
    const today = new Date().toISOString().split('T')[0];
    const prevStats = state.stats;
    
    let newStreak = prevStats.currentStreak;
    let questionsToday = prevStats.questionsToday;

    // Streak Logic
    if (prevStats.lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (prevStats.lastStudyDate === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      questionsToday = sc; // Reset for new day
    } else {
      questionsToday += sc;
    }

    const updatedStats: UserStats = {
      ...prevStats,
      sessionsCompleted: prevStats.sessionsCompleted + 1,
      questionsAnswered: prevStats.questionsAnswered + sc,
      currentStreak: newStreak,
      longestStreak: Math.max(prevStats.longestStreak, newStreak),
      lastStudyDate: today,
      questionsToday: questionsToday,
    };

    const topicCounts = { ...state.weakSpots };
    miss.forEach(t => topicCounts[t] = (topicCounts[t] || 0) + 1);
    
    let newInsights = { ...state.weakSpotInsights };
    if (state.tier === UserTier.PREMIUM && miss.length > 0) {
       const uniqueMissed = Array.from(new Set(miss));
       try {
         const insights = await geminiService.getWeakSpotInsights(uniqueMissed, activeMaterials);
         insights.forEach(insight => {
            newInsights[insight.topic] = insight;
         });
       } catch (e) { console.error("Insight error", e); }
    }

    setState(p => ({
      ...p,
      stats: updatedStats,
      weakSpots: topicCounts,
      weakSpotInsights: newInsights,
      currentQuiz: undefined
    }));
    setView('dashboard');
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryLoading(true);
    setTimeout(() => {
      setInquiryLoading(false);
      setInquirySuccess(true);
      setInquiryForm({ name: '', subject: '', message: '' });
      setTimeout(() => setInquirySuccess(false), 3000);
    }, 1500);
  };

  const handleChatSendMessage = (text: string) => {
    const lastRole = state.chatHistory[state.chatHistory.length - 1]?.role;
    const role = lastRole === 'user' ? 'model' : 'user';

    setState(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, { role, text, timestamp: Date.now() }]
    }));
  };

  const handleClearChat = () => {
    setState(prev => ({ ...prev, chatHistory: [] }));
  };

  // UNAUTHENTICATED FLOW
  if (!user) {
    if (authState === 'landing') {
      return (
        <LandingPage 
          onStart={() => {
            setInitialIsLogin(false);
            setAuthState('auth');
          }}
          onLogin={() => {
            setInitialIsLogin(true);
            setAuthState('auth');
          }}
        />
      );
    }
    return (
      <div className="relative">
        <button 
          onClick={() => setAuthState('landing')}
          className="fixed top-6 left-6 z-50 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
        >
          ← Back to home
        </button>
        <AuthScreen initialIsLogin={initialIsLogin} />
      </div>
    );
  }

  const dailyProgressPercent = Math.min(100, (state.stats.questionsToday / state.stats.dailyGoal) * 100);

  // AUTHENTICATED FLOW
  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-300 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none z-0">
         <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-indigo-500 blur-[120px] rounded-full floating" />
         <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-pink-500 blur-[120px] rounded-full floating" style={{ animationDelay: '2s' }} />
      </div>

      {showUpgrade && <UpgradeModal onUpgrade={(t) => setState(p => ({...p, tier: t}))} onClose={() => setShowUpgrade(false)} />}
      
      {showVoiceRecorder && (
        <VoiceNoteRecorder 
          onComplete={handleVoiceComplete} 
          onCancel={() => setShowVoiceRecorder(false)} 
        />
      )}

      {/* AI Assistant Chatbot Integration */}
      <StudyAssistant 
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        materials={activeMaterials}
        tier={state.tier}
        difficulty={difficulty}
        userName={user.user_metadata?.full_name || user.email?.split('@')[0]}
        history={state.chatHistory}
        onSendMessage={handleChatSendMessage}
        onClearHistory={handleClearChat}
      />
      
      {showDifficultySetup && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 relative border border-white/5 my-auto">
             <div className="p-6 md:p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-2"><Zap size={20} /></div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">New Practice</h3>
                  <p className="text-xs text-slate-500 font-medium">Pick your study level</p>
                </div>

                <div className="space-y-2">
                  {(['Standard', 'Challenger', 'Expert'] as QuizDifficulty[]).map((d) => {
                    const isLocked = (d === 'Challenger' && state.tier === UserTier.FREE) || (d === 'Expert' && state.tier !== UserTier.PREMIUM);
                    return (
                      <button 
                        key={d}
                        onClick={() => handleDifficultyClick(d)}
                        className={`w-full p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all ${difficulty === d ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : isLocked ? 'border-slate-50 dark:border-slate-800 opacity-50' : 'border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        <div className="flex items-center gap-3">
                          {isLocked && <Lock size={12} className="text-slate-400" />}
                          <div>
                            <p className={`text-sm font-bold ${difficulty === d ? 'text-indigo-600' : 'text-slate-700 dark:text-slate-200'}`}>{d}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{d === 'Standard' ? 'Normal' : d === 'Challenger' ? 'Hard' : 'Premium Expert'}</p>
                          </div>
                        </div>
                        {difficulty === d && <CheckCircle2 size={16} className="text-indigo-600" />}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                    <span>How many questions?</span>
                    <span className="text-indigo-600 font-black">{quizLength}</span>
                  </div>
                  <input type="range" min="1" max={tierMaxQuestions} step="1" value={quizLength} onChange={e => setQuizLength(parseInt(e.target.value))} className="w-full accent-indigo-600 h-1 bg-slate-100 dark:bg-slate-800 rounded-full cursor-pointer" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowDifficultySetup(false)} className="flex-1 py-3.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl font-bold text-xs">Back</button>
                  <button onClick={() => startReview()} className="flex-[2] py-3.5 premium-gradient text-white rounded-xl font-bold text-xs shadow-lg active:scale-[0.98]">Start Quiz</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {showManualInput && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Type Notes</h3>
                <button onClick={() => setShowManualInput(false)} className="p-2 text-slate-400 hover:text-red-500"><X size={20} /></button>
              </div>
              <textarea value={manualText} onChange={(e) => setManualText(e.target.value)} placeholder="Type or paste your notes here..." className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-sm font-medium resize-none border-2 border-transparent focus:border-indigo-500 transition-all" />
              <button onClick={handleManualSubmission} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg active:scale-[0.98]">Save Note</button>
            </div>
          </div>
        </div>
      )}

      <aside className="w-16 lg:w-56 border-r border-slate-100 dark:border-slate-800 flex flex-col items-center py-6 bg-white/40 dark:bg-slate-900/20 backdrop-blur-lg shrink-0 z-20 shadow-lg">
        <div className="mb-8 flex items-center gap-3 px-4 cursor-pointer" onClick={() => setView('dashboard')}>
          <div className="w-9 h-9 premium-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
            <GraduationCap size={20} />
          </div>
          <h1 className="hidden lg:block font-black text-lg text-slate-900 dark:text-white">StudyUnitPro</h1>
        </div>

        <nav className="flex-1 w-full px-3 space-y-2 overflow-y-auto pb-4 scrollbar-hide">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
            { id: 'support', icon: LifeBuoy, label: 'Help' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setView(item.id as any)} 
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === item.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <item.icon size={18} className="shrink-0" />
              <span className="hidden lg:block font-bold text-xs">{item.label}</span>
            </button>
          ))}
          
          <div className="pt-6 space-y-2">
            <div className="flex items-center justify-between px-2 mb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Library</p>
              <span className="text-[10px] font-black text-indigo-500">{state.materials.length}/{NOTE_LIMITS[state.tier]}</span>
            </div>
            <div className="space-y-1">
               {state.materials.map(note => (
                 <button 
                  key={note.id}
                  onClick={() => { setView('dashboard'); toggleMaterialSelection(note.id); }}
                  className={`w-full text-left p-2.5 rounded-lg text-[10px] font-bold truncate flex items-center gap-2 ${state.selectedMaterialIds.includes(note.id) ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 border border-indigo-100 dark:border-indigo-900/50' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                 >
                   <div className={`w-1 h-1 rounded-full ${state.selectedMaterialIds.includes(note.id) ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                   <span className="truncate hidden lg:block">{note.name}</span>
                 </button>
               ))}
            </div>
          </div>
        </nav>

        <div className="px-3 w-full mt-auto pt-4 border-t dark:border-slate-800">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-red-500 transition-colors">
             <LogOut size={18} className="shrink-0" />
             <span className="hidden lg:block font-bold text-xs">Log Out</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative z-10">
        <header className="sticky top-0 z-40 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-50 dark:border-slate-900 h-16 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2 min-w-0">
             <LayoutDashboard size={14} className="text-indigo-500 shrink-0" />
             <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">StudyUnitPro / {view}</h2>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {/* AI Assistant Toggle Button */}
            <button 
              onClick={() => setIsAssistantOpen(!isAssistantOpen)} 
              className={`p-2 rounded-lg transition-all ${isAssistantOpen ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
              title="Study Tutor"
            >
              <MessageSquareText size={16} />
            </button>
            <button onClick={toggleDarkMode} className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg" title="Toggle Theme">
              {state.darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="flex items-center gap-2 px-1.5 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 min-w-0">
               <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0">
                 {(user.user_metadata?.full_name?.[0] || user.email?.[0]).toUpperCase()}
               </div>
               <div className="text-left hidden sm:block leading-none pr-2">
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                  <p className="text-[8px] font-bold text-indigo-500 mt-0.5">{state.tier} MEMBER</p>
               </div>
            </div>
          </div>
        </header>

        {view === 'dashboard' && (
          <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-12 pb-24">
            <section className="mesh-gradient rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-xl">
               <div className="absolute top-0 right-0 p-6 opacity-10 floating"><Brain size={140} /></div>
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="flex-1 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg backdrop-blur-md border border-white/10 mb-2">
                      <Flame size={14} className="text-orange-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{state.stats.currentStreak}-Day Study Streak!</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none">Focus, {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}.</h2>
                    <p className="text-indigo-50 text-sm md:text-lg max-w-md opacity-90 leading-tight">You've mastered {state.stats.questionsAnswered} concepts. Keep pushing.</p>
                    <div className="flex gap-3 pt-2">
                      <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                          <p className="text-[8px] font-bold uppercase text-indigo-300">Sessions</p>
                          <p className="text-xl font-black">{state.stats.sessionsCompleted}</p>
                      </div>
                      <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                          <p className="text-[8px] font-bold uppercase text-indigo-300">Longest Streak</p>
                          <p className="text-xl font-black">{state.stats.longestStreak}</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-64 space-y-4">
                    <Card variant="glass" className="border-0 shadow-2xl p-5">
                       <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] font-black uppercase text-indigo-200">Daily Goal</p>
                          <span className="text-[10px] font-black text-white">{state.stats.questionsToday}/{state.stats.dailyGoal}</span>
                       </div>
                       <div className="h-3 w-full bg-black/30 rounded-full overflow-hidden border border-white/10">
                          <div 
                            className="h-full premium-gradient transition-all duration-1000 ease-out" 
                            style={{ width: `${dailyProgressPercent}%` }} 
                          />
                       </div>
                       <p className="text-[9px] text-indigo-100/60 mt-3 font-medium text-center">
                         {dailyProgressPercent >= 100 ? 'Goal achieved! You are on fire. 🔥' : `${state.stats.dailyGoal - state.stats.questionsToday} more questions to hit goal.`}
                       </p>
                    </Card>
                  </div>
               </div>
            </section>

            <section className="space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Expand Your Library</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className={`cursor-pointer group ${isAtLimit() ? 'opacity-50' : ''}`}>
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={isAtLimit()} />
                    <Card className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-100 hover:border-indigo-400 transition-all bg-white dark:bg-slate-900">
                       <UploadCloud size={32} className="text-indigo-600 mb-3 group-hover:scale-110 transition-transform" />
                       <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cloud Upload</h4>
                       <p className="text-[10px] text-slate-400 mt-1">TXT, Images (AI Read)</p>
                    </Card>
                  </label>
                  <button onClick={() => isAtLimit() ? setShowUpgrade(true) : setShowVoiceRecorder(true)} className={`group ${isAtLimit() ? 'opacity-50' : ''}`}>
                    <Card className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-100 hover:border-pink-400 transition-all bg-white dark:bg-slate-900 h-full">
                       <Mic2 size={32} className="text-pink-500 mb-3 group-hover:scale-110 transition-transform" />
                       <h4 className="text-sm font-bold text-slate-900 dark:text-white">Dictation</h4>
                       <p className="text-[10px] text-slate-400 mt-1">Transcribe Lectures</p>
                    </Card>
                  </button>
                  <button onClick={() => isAtLimit() ? setShowUpgrade(true) : setShowManualInput(true)} className={`group ${isAtLimit() ? 'opacity-50' : ''}`}>
                    <Card className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-100 hover:border-amber-400 transition-all bg-white dark:bg-slate-900 h-full">
                       <Keyboard size={32} className="text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
                       <h4 className="text-sm font-bold text-slate-900 dark:text-white">Manual Input</h4>
                       <p className="text-[10px] text-slate-400 mt-1">Paste Raw Text</p>
                    </Card>
                  </button>
               </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers size={18} className="text-indigo-600" /> Knowledge Nodes
                  </h3>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                    {activeMaterials.length} Focus Points
                  </p>
                </div>
                {state.materials.length === 0 ? (
                  <Card className="p-12 text-center border-2 border-dashed border-slate-100">
                     <p className="text-slate-400 text-sm font-medium">Your library is empty. Upload some notes!</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {state.materials.map(m => (
                       <Card 
                         key={m.id} 
                         onClick={() => toggleMaterialSelection(m.id)} 
                         className={`p-4 border-2 transition-all group ${state.selectedMaterialIds.includes(m.id) ? 'border-indigo-600 ring-2 ring-indigo-50 dark:ring-indigo-900/20 shadow-indigo-100' : 'border-slate-50 hover:border-indigo-200'}`}
                       >
                         <div className="flex items-start gap-3">
                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${state.selectedMaterialIds.includes(m.id) ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                             {m.type === 'voice' ? <Mic size={18} /> : m.type === 'image' ? <ImageIcon size={18} /> : <FileText size={18} />}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold truncate transition-colors ${state.selectedMaterialIds.includes(m.id) ? 'text-indigo-600' : 'text-slate-900 dark:text-white'}`}>{m.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{m.processed ? 'Indexed' : 'Analyzing...'}</p>
                                {m.summary && <span className="text-[9px] text-slate-300">•</span>}
                                {m.summary && <p className="text-[9px] text-slate-400 truncate max-w-[120px]">{m.summary}</p>}
                              </div>
                           </div>
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleDeleteNote(m.id); }} 
                             className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                         {state.selectedMaterialIds.includes(m.id) && m.highPriorityTopics && (
                           <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-indigo-900/50 animate-in fade-in duration-300">
                             <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2">Key Exam Targets</p>
                             <div className="flex flex-wrap gap-1.5">
                               {m.highPriorityTopics.slice(0, 3).map((topic, i) => (
                                 <span key={i} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md text-[8px] font-black border border-indigo-100 dark:border-indigo-900/50">
                                   {topic}
                                 </span>
                               ))}
                             </div>
                           </div>
                         )}
                       </Card>
                     ))}
                  </div>
                )}

                {activeMaterials.length > 0 && (
                   <Card className="p-6 bg-slate-950 text-white border-0 shadow-xl relative overflow-hidden group">
                      <div className="absolute inset-0 pattern-dots opacity-10 group-hover:opacity-20 transition-opacity" />
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                         <div className="space-y-1 text-center md:text-left">
                            <h3 className="text-lg font-black tracking-tight">AI Engine Powered Up</h3>
                            <p className="text-xs text-slate-400">Context provided by {activeMaterials.length} selected nodes.</p>
                         </div>
                         <div className="flex gap-2 w-full md:w-auto">
                            {state.currentQuiz ? (
                              <button onClick={() => setView('review')} className="flex-1 md:flex-none px-6 py-3 premium-gradient rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg animate-pulse hover:scale-105 transition-all active:scale-95">
                                 <RotateCcw size={14} /> Resume Quiz
                              </button>
                            ) : (
                              <button onClick={() => setShowDifficultySetup(true)} className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-500 transition-all active:scale-95">
                                 <Play size={14} fill="currentColor" /> Knowledge Quiz
                              </button>
                            )}
                            <button onClick={startFlashcards} className="flex-1 md:flex-none px-6 py-3 bg-white/10 rounded-xl font-bold text-xs hover:bg-white/20 transition-all active:scale-95">
                               Flashcards
                            </button>
                         </div>
                      </div>
                   </Card>
                )}
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                   <ListTodo size={18} className="text-indigo-600" /> Adaptive Roadmap
                </h3>
                <Card className="bg-indigo-50/30 dark:bg-indigo-900/10 border-0 p-5 min-h-[300px]">
                  {state.plan[0] ? (
                    <div className="space-y-4 h-full flex flex-col">
                       <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{state.plan[0].duration} MIN Session</p>
                          {state.plan[0].completed && <CheckCircle size={14} className="text-green-500" />}
                       </div>
                       <div className="flex-1 space-y-2">
                          {state.plan[0].tasks.map((task, idx) => (
                            <div key={idx} onClick={() => !state.plan[0].taskStatus[idx] && setSelectedTaskIndex(idx)} className={`p-3 rounded-lg border flex items-center gap-3 transition-all cursor-pointer ${state.plan[0].taskStatus[idx] ? 'opacity-40 grayscale' : selectedTaskIndex === idx ? 'border-indigo-600 bg-white shadow-sm' : 'bg-white/50 border-slate-100 hover:border-indigo-200 shadow-sm'}`}>
                               <div className="shrink-0">{state.plan[0].taskStatus[idx] ? <CheckCircle size={16} className="text-green-500" /> : selectedTaskIndex === idx ? <Target size={16} className="text-indigo-600" /> : <Circle size={16} className="text-slate-200" />}</div>
                               <p className={`text-[11px] font-bold leading-tight ${state.plan[0].taskStatus[idx] ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{task}</p>
                            </div>
                          ))}
                       </div>
                       <button disabled={selectedTaskIndex === null} onClick={markTaskDone} className={`w-full py-3 rounded-xl font-bold text-[10px] uppercase transition-all mt-4 ${selectedTaskIndex === null ? 'bg-slate-100 text-slate-300' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500'}`}>Verify Milestone</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                       <Calendar size={40} className="text-slate-200" />
                       <div className="space-y-1">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Empty Roadmap</p>
                          <p className="text-[10px] text-slate-400 px-4">Focus your materials and let AI plot your study journey.</p>
                       </div>
                       <button onClick={generatePlan} disabled={isGeneratingPlan || activeMaterials.length === 0} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase shadow-md active:scale-95 disabled:bg-slate-200 disabled:text-slate-400">
                         {isGeneratingPlan ? 'Plotting Path...' : 'Synthesize Path'}
                       </button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}

        {view === 'review' && state.currentQuiz && (
          <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
             <QuickReview 
              questions={state.currentQuiz.questions}
              tier={state.tier}
              initialProgress={state.currentQuiz}
              onProgress={(idx, sc, miss) => setState(p => ({...p, currentQuiz: p.currentQuiz ? {...p.currentQuiz, currentIndex: idx, score: sc, missedTopics: miss} : undefined}))}
              onClose={() => setView('dashboard')}
              onComplete={handleQuizComplete}
              onUpgradeRequest={() => setShowUpgrade(true)}
              weakSpotInsights={state.weakSpotInsights}
              onStartRescueMission={(topic) => {
                const relevantMaterials = state.materials.filter(m => 
                  m.highPriorityTopics?.some(t => t.toLowerCase().includes(topic.toLowerCase())) ||
                  m.summary?.toLowerCase().includes(topic.toLowerCase()) ||
                  m.name.toLowerCase().includes(topic.toLowerCase())
                );
                startReview(relevantMaterials);
              }}
            />
          </div>
        )}

        {view === 'flashcards' && state.flashcards.length > 0 && (
           <div className="p-4 md:p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
              <FlashcardViewer flashcards={state.flashcards} onClose={() => setView('dashboard')} />
           </div>
        )}

        {view === 'support' && (
          <div className="p-6 md:p-12 max-w-xl mx-auto animate-in fade-in">
             <div className="text-center space-y-2 mb-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Support Nexus</h3>
                <p className="text-slate-500 text-xs">Reach out to the dev team.</p>
             </div>
             <Card className="p-6 md:p-8">
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Name</label>
                      <input type="text" required value={inquiryForm.name} onChange={e => setInquiryForm({...inquiryForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-sm border-2 border-transparent focus:border-indigo-500 transition-all" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Subject</label>
                      <input type="text" required value={inquiryForm.subject} onChange={e => setInquiryForm({...inquiryForm, subject: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-sm border-2 border-transparent focus:border-indigo-500 transition-all" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Message</label>
                      <textarea required value={inquiryForm.message} onChange={e => setInquiryForm({...inquiryForm, message: e.target.value})} className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-sm resize-none border-2 border-transparent focus:border-indigo-500 transition-all" />
                   </div>
                   <button type="submit" disabled={inquiryLoading} className="w-full py-4 premium-gradient text-white rounded-xl font-bold text-xs uppercase shadow-lg flex items-center justify-center gap-2">
                      {inquiryLoading ? <Loader2 size={16} className="animate-spin" /> : inquirySuccess ? <><CheckCircle size={16} /> Sent!</> : <><Send size={16} /> Transmit Message</>}
                   </button>
                </form>
             </Card>
          </div>
        )}

        {view === 'settings' && (
          <div className="p-6 md:p-12 max-w-xl mx-auto animate-in fade-in">
             <div className="text-center space-y-2 mb-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Configurations</h3>
                <p className="text-slate-500 text-xs">Identity and Preferences</p>
             </div>
             
             <div className="space-y-4">
               {settingsStatus && (
                 <div className={`p-3 rounded-xl text-[10px] font-bold border ${settingsStatus.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                   {settingsStatus.message}
                 </div>
               )}
               
               <Card title="Account Profile" subtitle="Public Identity">
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Screen Name</label>
                       <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-sm border-2 border-transparent focus:border-indigo-500" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Email</label>
                       <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none text-sm border-2 border-transparent focus:border-indigo-500" />
                    </div>
                    <button onClick={() => setSettingsStatus({message: 'Update complete!', type: 'success'})} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase shadow-md">Update Profile</button>
                  </div>
               </Card>

               <Card title="Danger Zone" subtitle="Account Termination" variant="dark">
                  <div className="pt-2">
                    <p className="text-[10px] text-slate-400 mb-4">Wipe your library and roadmap permanently.</p>
                    <button onClick={handleLogout} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-[10px] uppercase hover:bg-red-700 transition-colors">Erase Everything</button>
                  </div>
               </Card>
             </div>
          </div>
        )}

        <div className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-50 glass max-w-[90vw]">
           <div className="flex items-center gap-2.5 shrink-0">
              <div className={`w-2 h-2 ${syncing ? 'bg-orange-500 animate-spin' : 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]'} rounded-full shrink-0`} />
              <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] truncate">
                {syncing ? 'Link Syncing...' : 'Link Secure'}
              </span>
           </div>
           <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 opacity-40 shrink-0" />
           <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] truncate">v3.5.0-Gold</p>
        </div>
      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[500] flex flex-col items-center justify-center p-8 overflow-hidden">
          <div className="loader-ring mb-6"><div></div><div></div><div></div><div></div></div>
          <h3 className="text-xl font-black text-white">Gemini is Thinking...</h3>
          <p className="text-indigo-400 mt-2 font-bold text-[10px] uppercase tracking-widest animate-pulse">Distilling Knowledge Base</p>
        </div>
      )}
    </div>
  );
}
