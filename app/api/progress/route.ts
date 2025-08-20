import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      sessionId, 
      questionId, 
      selectedAnswer, 
      timeSpent, 
      isFlagged = false 
    } = body

    const supabase = await createClient()

    // Get the correct answer to determine if user is correct
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('correct_answer')
      .eq('id', questionId)
      .single()

    if (questionError) {
      return NextResponse.json({ error: questionError.message }, { status: 500 })
    }

    const isCorrect = question.correct_answer === selectedAnswer

    // Insert or update user progress
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .upsert({
        session_id: sessionId,
        question_id: questionId,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        is_flagged: isFlagged,
        time_spent: timeSpent,
      }, {
        onConflict: 'session_id,question_id'
      })
      .select()
      .single()

    if (progressError) {
      return NextResponse.json({ error: progressError.message }, { status: 500 })
    }

    // Mark question as answered in session pool
    const { error: poolError } = await supabase
      .from('session_question_pool')
      .update({ is_answered: true })
      .eq('session_id', sessionId)
      .eq('question_id', questionId)

    if (poolError) {
      return NextResponse.json({ error: poolError.message }, { status: 500 })
    }

    // Update session questions answered count
    // First get the current count
    const { data: currentSession } = await supabase
      .from('study_sessions')
      .select('questions_answered')
      .eq('id', sessionId)
      .single()

    if (currentSession) {
      const { error: sessionError } = await supabase
        .from('study_sessions')
        .update({ 
          questions_answered: currentSession.questions_answered + 1
        })
        .eq('id', sessionId)

      if (sessionError) {
        return NextResponse.json({ error: sessionError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      progress, 
      isCorrect,
      correctAnswer: question.correct_answer 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save progress' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: progress, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        questions (chapter, question)
      `)
      .eq('session_id', parseInt(sessionId))
      .order('answered_at')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(progress || [])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch progress' }, 
      { status: 500 }
    )
  }
}