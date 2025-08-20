import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export type StudyMode = 'random' | 'by_chapter' | 'mixed' | 'review' | 'mock_exam'

export interface SessionSettings {
  mode: StudyMode
  selectedChapters: string[]
  sessionName: string
  mockExamSettings?: {
    timeLimitMinutes: number
    questionCount: number
    shuffleQuestions: boolean
    shuffleChoices: boolean
  }
  reviewSettings?: {
    incorrectOnly: boolean
    flaggedOnly: boolean
  }
}

export interface ActiveSession {
  id: number
  name: string
  mode: StudyMode
  totalQuestions: number
  questionsAnswered: number
  currentQuestionIndex: number
  startTime: Date
  isActive: boolean
}

interface SessionState {
  activeSession: ActiveSession | null
  sessionSettings: SessionSettings
  currentQuestionId: number | null
  isLoading: boolean
  
  // Actions
  setActiveSession: (session: ActiveSession | null) => void
  updateSessionSettings: (settings: Partial<SessionSettings>) => void
  setCurrentQuestionId: (id: number | null) => void
  incrementQuestionsAnswered: () => void
  setLoading: (loading: boolean) => void
  resetSession: () => void
}

const defaultSessionSettings: SessionSettings = {
  mode: 'random',
  selectedChapters: [],
  sessionName: 'Study Session',
  mockExamSettings: {
    timeLimitMinutes: 120,
    questionCount: 50,
    shuffleQuestions: true,
    shuffleChoices: false,
  },
  reviewSettings: {
    incorrectOnly: false,
    flaggedOnly: false,
  }
}

export const useSessionStore = create<SessionState>()(
  devtools(
    persist(
      (set, get) => ({
        activeSession: null,
        sessionSettings: defaultSessionSettings,
        currentQuestionId: null,
        isLoading: false,

        setActiveSession: (session) => set({ activeSession: session }),
        
        updateSessionSettings: (settings) => 
          set((state) => ({
            sessionSettings: { ...state.sessionSettings, ...settings }
          })),

        setCurrentQuestionId: (id) => set({ currentQuestionId: id }),

        incrementQuestionsAnswered: () =>
          set((state) => ({
            activeSession: state.activeSession
              ? {
                  ...state.activeSession,
                  questionsAnswered: state.activeSession.questionsAnswered + 1,
                  currentQuestionIndex: state.activeSession.currentQuestionIndex + 1,
                }
              : null,
          })),

        setLoading: (loading) => set({ isLoading: loading }),

        resetSession: () =>
          set({
            activeSession: null,
            currentQuestionId: null,
            sessionSettings: defaultSessionSettings,
          }),
      }),
      {
        name: 'session-store',
        partialize: (state) => ({
          activeSession: state.activeSession,
          sessionSettings: state.sessionSettings,
        }),
      }
    )
  )
)