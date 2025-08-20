import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface TimerState {
  elapsedTime: number // in seconds
  remainingTime: number | null // in seconds, null for unlimited time
  isRunning: boolean
  questionStartTime: number | null
  
  // Actions
  startTimer: (timeLimit?: number) => void
  stopTimer: () => void
  resetTimer: () => void
  tick: () => void
  setQuestionStartTime: () => void
  getQuestionElapsedTime: () => number
}

export const useTimerStore = create<TimerState>()(
  devtools(
    (set, get) => ({
      elapsedTime: 0,
      remainingTime: null,
      isRunning: false,
      questionStartTime: null,

      startTimer: (timeLimit) => {
        const now = Date.now()
        set({
          isRunning: true,
          remainingTime: timeLimit ? timeLimit * 60 : null, // convert minutes to seconds
          questionStartTime: now,
        })
      },

      stopTimer: () => set({ isRunning: false }),

      resetTimer: () => set({
        elapsedTime: 0,
        remainingTime: null,
        isRunning: false,
        questionStartTime: null,
      }),

      tick: () => {
        const state = get()
        if (!state.isRunning) return

        set((state) => ({
          elapsedTime: state.elapsedTime + 1,
          remainingTime: state.remainingTime !== null 
            ? Math.max(0, state.remainingTime - 1)
            : null,
        }))
      },

      setQuestionStartTime: () => {
        set({ questionStartTime: Date.now() })
      },

      getQuestionElapsedTime: () => {
        const state = get()
        if (!state.questionStartTime) return 0
        return Math.floor((Date.now() - state.questionStartTime) / 1000)
      },
    })
  )
)