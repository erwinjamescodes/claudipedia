import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { StudyMode } from '@/lib/stores/session-store'

export interface SessionCreateRequest {
  name: string
  mode: StudyMode
  selectedChapters?: string[]
  mockExamSettings?: {
    timeLimitMinutes: number
    questionCount: number
    shuffleQuestions: boolean
    shuffleChoices: boolean
  }
}

export interface Session {
  id: number
  name: string
  mode: StudyMode
  selected_chapters: string[]
  is_active: boolean
  total_questions_available: number
  questions_answered: number
  created_at: string
  updated_at: string
}

export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async (): Promise<Session[]> => {
      const response = await fetch('/api/sessions')
      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }
      return response.json()
    },
  })
}

export const useSession = (id: number) => {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: async (): Promise<Session> => {
      const response = await fetch(`/api/sessions/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch session')
      }
      return response.json()
    },
    enabled: !!id,
  })
}

export const useCreateSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionData: SessionCreateRequest): Promise<Session> => {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create session')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export const useUpdateSession = (id: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Partial<Session>): Promise<Session> => {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update session')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['sessions', id] })
    },
  })
}

export const useDeleteSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete session')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}