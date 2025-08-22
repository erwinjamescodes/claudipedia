import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = parseInt(params.id)
    
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('arcade_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }

    return NextResponse.json({
      sessionId: session.id,
      questionsCompleted: session.questions_completed,
      correctAnswers: session.correct_answers,
      totalQuestions: session.total_questions,
      isActive: session.is_active,
      startedAt: session.started_at,
      completedAt: session.completed_at,
      totalTimeSeconds: session.total_time_seconds,
      accuracy: session.questions_completed > 0 
        ? Math.round((session.correct_answers / session.questions_completed) * 100)
        : 0
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch session details' },
      { status: 500 }
    )
  }
}