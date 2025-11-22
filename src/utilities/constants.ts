// Command constants for Authentic Hadith VS Code Extension

export const Commands = {
  START_ONBOARDING: 'authentic-hadith.startOnboarding',
  OPEN_DASHBOARD: 'authentic-hadith.openDashboard',
  OPEN_NOTES: 'authentic-hadith.openNotes',
  EXPORT_NOTES_MARKDOWN: 'authentic-hadith.exportNotesMarkdown',
  OPEN_BOOKMARKS: 'authentic-hadith.openBookmarks',
  TOGGLE_BOOKMARK: 'authentic-hadith.toggleBookmark',
  OPEN_SEARCH: 'authentic-hadith.openSearch',
  OPEN_TOPICS: 'authentic-hadith.openTopics',
  OPEN_LEARNING: 'authentic-hadith.openLearning',
  OPEN_REVIEW_QUEUE: 'authentic-hadith.openReviewQueue',
  RECORD_REVIEW: 'authentic-hadith.recordReview',
  OPEN_ASSISTANT: 'authentic-hadith.openAssistant',
  SHOW_SIDEBAR: 'authentic-hadith.showSidebar',
} as const;

export const ConfigKeys = {
  ONBOARDING_COMPLETED: 'authenticHadith.onboardingCompleted',
  DAILY_GOAL: 'authenticHadith.dailyGoal',
  EXPERIENCE_LEVEL: 'authenticHadith.experienceLevel',
  ONBOARDING_GOALS: 'authenticHadith.onboardingGoals',
  STUDY_FREQUENCY: 'authenticHadith.studyFrequency',
} as const;

export const StateKeys = {
  NOTES: 'authenticHadith.notes',
  BOOKMARKS: 'authenticHadith.bookmarks',
  PROGRESS: 'authenticHadith.progress',
  REVIEW_ITEMS: 'authenticHadith.reviewItems',
  LEARNING_SESSIONS: 'authenticHadith.learningSessions',
  RECENTLY_VIEWED: 'authenticHadith.recentlyViewed',
} as const;
