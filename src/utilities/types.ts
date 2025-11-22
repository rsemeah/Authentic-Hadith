// Core types for Authentic Hadith VS Code Extension

export interface Hadith {
  id: string;
  arabic: string;
  translation: string;
  collection: string;
  reference: string;
  narrator?: string;
  topics: string[];
  grade?: string;
  explanation?: string;
}

export interface Note {
  id: string;
  hadithId: string;
  content: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  hadithId: string;
  addedAt: string;
  notes?: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  hadithCount: number;
  hadithIds: string[];
}

export interface ReviewItem {
  id: string;
  hadithId: string;
  lastReviewed: string;
  nextReview: string;
  interval: number; // in days: 1, 3, 7, etc.
  easiness: number;
  repetitions: number;
}

export interface UserProgress {
  totalLearned: number;
  currentStreak: number;
  lastStudyDate: string;
  completionPercentage: number;
}

export interface LearningSession {
  hadithId: string;
  startedAt: string;
  completedAt?: string;
  reflection?: string;
  markedLearned: boolean;
}

export interface OnboardingData {
  goals: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  studyFrequency: 'daily' | 'weekly' | 'flexible';
  dailyGoal: number;
  completed: boolean;
}

export interface SearchFilters {
  query: string;
  collection?: string;
  topic?: string;
  narrator?: string;
}
