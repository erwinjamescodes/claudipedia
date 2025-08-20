import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Question {
  id: number
  chapter: string
  question: string
  choice_a: string
  choice_b: string
  choice_c: string
  choice_d: string
  correct_answer: 'A' | 'B' | 'C' | 'D'
  explanation?: string
}

export interface UserAnswer {
  questionId: number
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null
  isCorrect: boolean | null
  timeSpent: number
  isFlagged: boolean
}

interface QuestionState {
  currentQuestion: Question | null
  userAnswers: Record<number, UserAnswer>
  showFeedback: boolean
  isSubmitted: boolean
  
  // Actions
  setCurrentQuestion: (question: Question | null) => void
  submitAnswer: (questionId: number, answer: 'A' | 'B' | 'C' | 'D', timeSpent: number) => void
  flagQuestion: (questionId: number, flagged: boolean) => void
  showAnswerFeedback: () => void
  hideFeedback: () => void
  resetQuestionState: () => void
  getUserAnswer: (questionId: number) => UserAnswer | undefined
}

export const useQuestionStore = create<QuestionState>()(
  devtools(
    (set, get) => ({
      currentQuestion: null,
      userAnswers: {},
      showFeedback: false,
      isSubmitted: false,

      setCurrentQuestion: (question) => 
        set({ 
          currentQuestion: question,
          showFeedback: false,
          isSubmitted: false,
        }),

      submitAnswer: (questionId, answer, timeSpent) => {
        const { currentQuestion } = get()
        if (!currentQuestion) return

        const isCorrect = currentQuestion.correct_answer === answer
        const userAnswer: UserAnswer = {
          questionId,
          selectedAnswer: answer,
          isCorrect,
          timeSpent,
          isFlagged: get().userAnswers[questionId]?.isFlagged || false,
        }

        set((state) => ({
          userAnswers: {
            ...state.userAnswers,
            [questionId]: userAnswer,
          },
          showFeedback: true,
          isSubmitted: true,
        }))
      },

      flagQuestion: (questionId, flagged) => {
        set((state) => ({
          userAnswers: {
            ...state.userAnswers,
            [questionId]: {
              ...state.userAnswers[questionId],
              questionId,
              selectedAnswer: state.userAnswers[questionId]?.selectedAnswer || null,
              isCorrect: state.userAnswers[questionId]?.isCorrect || null,
              timeSpent: state.userAnswers[questionId]?.timeSpent || 0,
              isFlagged: flagged,
            },
          },
        }))
      },

      showAnswerFeedback: () => set({ showFeedback: true }),
      
      hideFeedback: () => set({ showFeedback: false }),

      resetQuestionState: () => set({
        currentQuestion: null,
        userAnswers: {},
        showFeedback: false,
        isSubmitted: false,
      }),

      getUserAnswer: (questionId) => get().userAnswers[questionId],
    })
  )
)