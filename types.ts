
export enum UserTier {
  FREE = 'FREE',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM'
}

export type QuizDifficulty = 'Standard' | 'Challenger' | 'Expert';

export interface StudyMaterial {
  id: string;
  name: string;
  type: 'image' | 'text' | 'voice';
  content: string; // Extracted text or base64
  storagePath?: string;
  signedUrl?: string;
  originalTranscript?: string; 
  summary?: string;
  highPriorityTopics?: string[];
  processed: boolean;
  dateAdded: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface PracticeQuestion {
  question: string;
  answer: string;
  options: string[]; 
  explanation: string;
  topic: string; 
}

export interface WeakSpotInsight {
  topic: string;
  explanation: string;
  studyMethod: string;
}

export interface QuizProgress {
  questions: PracticeQuestion[];
  currentIndex: number;
  score: number;
  missedTopics: string[];
  difficulty: QuizDifficulty;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface StudyPlanDay {
  date: string;
  tasks: string[];
  taskStatus: boolean[]; 
  duration: number; 
  completed: boolean;
}

export interface UserStats {
  sessionsCompleted: number;
  totalTimeMinutes: number;
  questionsAnswered: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: string; // ISO date string YYYY-MM-DD
  questionsToday: number;
  dailyGoal: number;
}

export interface AppState {
  materials: StudyMaterial[];
  selectedMaterialIds: string[]; // Track focused notes for AI context
  plan: StudyPlanDay[];
  flashcards: Flashcard[];
  stats: UserStats;
  tier: UserTier;
  examDate: string;
  dailyTimeMinutes: number;
  lastSync: number;
  weakSpots: Record<string, number>;
  weakSpotInsights?: Record<string, WeakSpotInsight>;
  currentQuiz?: QuizProgress;
  darkMode: boolean;
  chatHistory: ChatMessage[];
}
