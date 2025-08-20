import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Question } from '@/lib/stores/question-store'

export interface Chapter {
  name: string
  questionCount: number
}

export const useChapters = () => {
  return useQuery({
    queryKey: ['chapters'],
    queryFn: async (): Promise<Chapter[]> => {
      const response = await fetch('/api/chapters')
      if (!response.ok) {
        throw new Error('Failed to fetch chapters')
      }
      return response.json()
    },
  })
}

export const useCurrentQuestion = (sessionId: number) => {
  return useQuery({
    queryKey: ['sessions', sessionId, 'current-question'],
    queryFn: async (): Promise<Question> => {
      const response = await fetch(`/api/sessions/${sessionId}/questions?current=true`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No more questions available')
        }
        throw new Error('Failed to fetch current question')
      }
      return response.json()
    },
    enabled: !!sessionId,
  })
}

export const useSessionQuestions = (sessionId: number) => {
  return useQuery({
    queryKey: ['sessions', sessionId, 'questions'],
    queryFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}/questions`)
      if (!response.ok) {
        throw new Error('Failed to fetch session questions')
      }
      return response.json()
    },
    enabled: !!sessionId,
  })
}

export interface SubmitAnswerRequest {
  sessionId: number
  questionId: number
  selectedAnswer: 'A' | 'B' | 'C' | 'D'
  timeSpent: number
  isFlagged?: boolean
}

export interface SubmitAnswerResponse {
  progress: any
  isCorrect: boolean
  correctAnswer: 'A' | 'B' | 'C' | 'D'
}

export const useSubmitAnswer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> => {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Submit answer error:', response.status, errorData)
        throw new Error(errorData.error || `Failed to submit answer (${response.status})`)
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate current question to get the next one
      queryClient.invalidateQueries({ 
        queryKey: ['sessions', variables.sessionId, 'current-question'] 
      })
      // Invalidate session to update questions_answered count
      queryClient.invalidateQueries({ 
        queryKey: ['sessions', variables.sessionId] 
      })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export const useSessionProgress = (sessionId: number) => {
  return useQuery({
    queryKey: ['sessions', sessionId, 'progress'],
    queryFn: async () => {
      const response = await fetch(`/api/progress?sessionId=${sessionId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch session progress')
      }
      return response.json()
    },
    enabled: !!sessionId,
  })
}