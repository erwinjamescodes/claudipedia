import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useArcadeStore } from "@/lib/stores/arcade-store";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// API Functions
async function createArcadeSession() {
  const response = await fetch("/api/arcade/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to create arcade session");
  }

  return response.json();
}

async function getNextQuestion(sessionId: number) {
  const response = await fetch(
    `/api/arcade/sessions/${sessionId}/next-question`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch next question");
  }

  return response.json();
}

async function submitAnswer(
  sessionId: number,
  questionId: number,
  answer: string,
  timeSpent: number = 0
) {
  const response = await fetch(`/api/arcade/sessions/${sessionId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      questionId,
      answer,
      timeSpent,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit answer");
  }

  return response.json();
}

async function getSessionDetails(sessionId: number) {
  const response = await fetch(`/api/arcade/sessions/${sessionId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch session details");
  }

  return response.json();
}

async function getActiveSession(userId: string) {
  const response = await fetch(`/api/arcade/sessions?userId=${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch active session");
  }

  return response.json();
}

// Custom Hooks
export function useCreateArcadeSession() {
  const { setSessionLoading } = useArcadeStore();

  return useMutation({
    mutationFn: createArcadeSession,
    onMutate: () => {
      setSessionLoading(true);
    },
    onSuccess: () => {
      toast.success("Arcade session started!");
      // Session will be set when we navigate to the arcade page
    },
    onError: () => {
      toast.error("Failed to start arcade session");
      setSessionLoading(false);
    },
    onSettled: () => {
      setSessionLoading(false);
    },
  });
}

export function useNextQuestion(sessionId: number | null) {
  const { setCurrentQuestion, setProgress, setQuestionLoading } =
    useArcadeStore();

  const query = useQuery({
    queryKey: ["arcade-next-question", sessionId],
    queryFn: () => getNextQuestion(sessionId!),
    enabled: !!sessionId,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always fetch fresh question
  });

  // Handle success/error effects
  useEffect(() => {
    if (query.data) {
      if (query.data.isComplete) {
        toast.success(query.data.message);
        return;
      }

      // Set new question and clear any previous state
      setCurrentQuestion(query.data.question);
      setProgress(query.data.progress);
      setQuestionLoading(false);
    }

    if (query.error) {
      toast.error("Failed to load question");
      setQuestionLoading(false);
    }
  }, [
    query.data,
    query.error,
    setCurrentQuestion,
    setProgress,
    setQuestionLoading,
  ]);

  return query;
}

export function useSubmitAnswer() {
  const queryClient = useQueryClient();
  const {
    currentSession,
    currentQuestion,
    submitAnswer: submitAnswerStore,
    setLastFeedback,
  } = useArcadeStore();

  return useMutation({
    mutationFn: ({
      answer,
      timeSpent = 0,
    }: {
      answer: string;
      timeSpent?: number;
    }) => {
      if (!currentSession || !currentQuestion) {
        throw new Error("No active session or question");
      }

      return submitAnswer(
        currentSession.sessionId,
        currentQuestion.id,
        answer,
        timeSpent
      );
    },
    onMutate: ({ answer }) => {
      submitAnswerStore(answer);
    },
    onSuccess: (data, { answer }) => {
      setLastFeedback({
        isCorrect: data.isCorrect,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation || "",
        userAnswer: answer,
      });
    },
    onError: () => {
      toast.error("Failed to submit answer");
      // Reset question state on error
      useArcadeStore.getState().resetQuestion();
    },
    onSettled: () => {
      // Don't auto-fetch next question - let user click "Next" button
      // Only invalidate session details to update progress
      if (currentSession) {
        queryClient.invalidateQueries({
          queryKey: ["arcade-session", currentSession.sessionId],
        });
      }
    },
  });
}

export function useSessionDetails(sessionId: number | null) {
  const { setCurrentSession, clearSession } = useArcadeStore();

  const query = useQuery({
    queryKey: ["arcade-session", sessionId],
    queryFn: () => getSessionDetails(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Handle success/error effects
  useEffect(() => {
    if (query.data) {
      setCurrentSession(query.data);
    }

    // If session doesn't exist in DB, clear the local store
    if (query.error && sessionId) {
      console.log("Session not found in database, clearing local storage");
      clearSession();
    }
  }, [query.data, query.error, sessionId, setCurrentSession, clearSession]);

  return query;
}

// Hook to fetch active session from API
export function useActiveSession() {
  const { setCurrentSession, clearSession } = useArcadeStore();
  const supabase = createClient();

  const query = useQuery({
    queryKey: ["active-session"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      return getActiveSession(user.id);
    },
    retry: false,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Update store with active session data
  useEffect(() => {
    if (query.data && query.data.id) {
      // Transform the database response to match the store interface
      const sessionData = {
        sessionId: query.data.id,
        questionsCompleted: query.data.questions_completed,
        correctAnswers: query.data.correct_answers,
        totalQuestions: query.data.total_questions,
        isActive: query.data.is_active,
        startedAt: query.data.started_at,
        completedAt: query.data.completed_at,
        totalTimeSeconds: query.data.total_time_seconds,
        accuracy: query.data.questions_completed > 0 
          ? Math.round((query.data.correct_answers / query.data.questions_completed) * 100) 
          : 0
      };
      setCurrentSession(sessionData);
    } else if (query.data === null) {
      // No active session found
      clearSession();
    }
  }, [query.data, setCurrentSession, clearSession]);

  return query;
}
