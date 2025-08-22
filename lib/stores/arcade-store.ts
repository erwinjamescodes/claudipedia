import { create } from 'zustand'

interface Question {
  id: number
  chapter: string
  question: string
  choice_a: string | null
  choice_b: string | null
  choice_c: string | null
  choice_d: string | null
  correct_answer: string
  explanation: string | null
}

interface Progress {
  current: number
  total: number
  correctAnswers: number
  percentage: number
}

interface ArcadeSession {
  sessionId: number
  questionsCompleted: number
  correctAnswers: number
  totalQuestions: number
  isActive: boolean
  startedAt: string
  completedAt?: string
  totalTimeSeconds: number
  accuracy: number
}

interface ArcadeState {
  // Session Management
  currentSession: ArcadeSession | null
  isSessionLoading: boolean
  
  // Question State
  currentQuestion: Question | null
  selectedAnswer: string | null
  isQuestionLoading: boolean
  showFeedback: boolean
  isSubmitted: boolean
  
  // Progress
  progress: Progress | null
  
  // Feedback
  lastFeedback: {
    isCorrect: boolean
    correctAnswer: string
    explanation: string
    userAnswer: string
  } | null

  // Actions
  setCurrentSession: (session: ArcadeSession | null) => void
  setSessionLoading: (loading: boolean) => void
  setCurrentQuestion: (question: Question | null) => void
  setSelectedAnswer: (answer: string | null) => void
  setQuestionLoading: (loading: boolean) => void
  setShowFeedback: (show: boolean) => void
  setIsSubmitted: (submitted: boolean) => void
  setProgress: (progress: Progress | null) => void
  setLastFeedback: (feedback: {
    isCorrect: boolean
    correctAnswer: string
    explanation: string
    userAnswer: string
  } | null) => void
  
  // Complex Actions
  submitAnswer: (answer: string) => void
  nextQuestion: () => void
  resetQuestion: () => void
  clearSession: () => void
}

export const useArcadeStore = create<ArcadeState>()((set) => ({
  // Initial State
  currentSession: null,
  isSessionLoading: false,
  currentQuestion: null,
  selectedAnswer: null,
  isQuestionLoading: false,
  showFeedback: false,
  isSubmitted: false,
  progress: null,
  lastFeedback: null,

  // Basic Actions
  setCurrentSession: (session) => set({ currentSession: session }),
  setSessionLoading: (loading) => set({ isSessionLoading: loading }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setSelectedAnswer: (answer) => set({ selectedAnswer: answer }),
  setQuestionLoading: (loading) => set({ isQuestionLoading: loading }),
  setShowFeedback: (show) => set({ showFeedback: show }),
  setIsSubmitted: (submitted) => set({ isSubmitted: submitted }),
  setProgress: (progress) => set({ progress }),
  setLastFeedback: (feedback) => set({ lastFeedback: feedback }),

  // Complex Actions
  submitAnswer: (answer) => {
    set({
      selectedAnswer: answer,
      isSubmitted: true,
      showFeedback: true
    })
  },

  nextQuestion: () => {
    set({
      selectedAnswer: null,
      showFeedback: false,
      isSubmitted: false,
      lastFeedback: null
      // Don't clear currentQuestion - let new question replace it
    })
  },

  resetQuestion: () => {
    set({
      selectedAnswer: null,
      showFeedback: false,
      isSubmitted: false,
      lastFeedback: null
    })
  },

  clearSession: () => {
    set({
      currentSession: null,
      currentQuestion: null,
      selectedAnswer: null,
      isQuestionLoading: false,
      isSessionLoading: false,
      showFeedback: false,
      isSubmitted: false,
      progress: null,
      lastFeedback: null
    })
  }
}))