import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("arcade_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      return NextResponse.json(
        { error: sessionError.message },
        { status: 500 }
      );
    }

    // Get detailed progress data with question info
    const { data: progressData, error: progressError } = await supabase
      .from("arcade_progress")
      .select(`
        *,
        questions (
          chapter,
          correct_answer
        )
      `)
      .eq("arcade_session_id", sessionId)
      .order("answered_at");

    if (progressError) {
      return NextResponse.json(
        { error: progressError.message },
        { status: 500 }
      );
    }

    // Calculate chapter-wise performance
    const chapterStats: Record<string, {
      total: number;
      correct: number;
      totalTimeSeconds: number;
      questions: number;
    }> = {};

    // Calculate time-based progress (for progress over time chart)
    const progressOverTime = progressData?.map((item, index) => ({
      questionNumber: index + 1,
      accuracy: ((progressData.slice(0, index + 1).filter(p => p.is_correct).length) / (index + 1)) * 100,
      timestamp: item.answered_at,
      isCorrect: item.is_correct
    })) || [];

    // Process chapter statistics
    progressData?.forEach((item) => {
      const chapter = item.questions?.chapter || 'unknown';
      
      if (!chapterStats[chapter]) {
        chapterStats[chapter] = {
          total: 0,
          correct: 0,
          totalTimeSeconds: 0,
          questions: 0
        };
      }
      
      chapterStats[chapter].total += 1;
      chapterStats[chapter].questions += 1;
      if (item.is_correct) {
        chapterStats[chapter].correct += 1;
      }
      chapterStats[chapter].totalTimeSeconds += item.time_spent_seconds || 0;
    });

    // Convert chapter stats to array with percentages
    const chapterPerformance = Object.entries(chapterStats).map(([chapter, stats]) => ({
      chapter,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      averageTime: stats.questions > 0 ? Math.round(stats.totalTimeSeconds / stats.questions) : 0
    }));

    // Calculate time distribution (for time spent analysis)
    const timeDistribution = progressData?.reduce((acc: Record<string, number>, item) => {
      const timeSpent = item.time_spent_seconds || 0;
      let timeRange = '';
      
      if (timeSpent < 10) timeRange = '< 10s';
      else if (timeSpent < 30) timeRange = '10-30s';
      else if (timeSpent < 60) timeRange = '30-60s';
      else if (timeSpent < 120) timeRange = '1-2m';
      else timeRange = '> 2m';
      
      acc[timeRange] = (acc[timeRange] || 0) + 1;
      return acc;
    }, {});

    // Calculate recent performance trends (last 50 questions)
    const recentQuestions = progressData?.slice(-50) || [];
    const recentAccuracy = recentQuestions.length > 0 
      ? Math.round((recentQuestions.filter(q => q.is_correct).length / recentQuestions.length) * 100)
      : 0;

    // Overall statistics
    const overallStats = {
      totalQuestions: session.questions_completed,
      correctAnswers: session.correct_answers,
      accuracy: session.questions_completed > 0 
        ? Math.round((session.correct_answers / session.questions_completed) * 100) 
        : 0,
      totalTimeSeconds: session.total_time_seconds,
      averageTimePerQuestion: session.questions_completed > 0 
        ? Math.round(session.total_time_seconds / session.questions_completed) 
        : 0,
      questionsRemaining: session.total_questions - session.questions_completed,
      completionPercentage: Math.round((session.questions_completed / session.total_questions) * 100),
      recentAccuracy,
      isActive: session.is_active,
      startedAt: session.started_at,
      completedAt: session.completed_at
    };

    return NextResponse.json({
      session: overallStats,
      chapterPerformance,
      progressOverTime,
      timeDistribution,
      rawProgressData: progressData?.length || 0
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}