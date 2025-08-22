import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = parseInt(params.id)
    
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
    }

    const body = await request.json()
    const { questionId, answer, timeSpent = 0 } = body

    if (!questionId || !answer) {
      return NextResponse.json({ 
        error: 'Question ID and answer are required' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the correct answer from questions table
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('correct_answer, explanation')
      .eq('id', questionId)
      .single()

    if (questionError) {
      return NextResponse.json({ error: questionError.message }, { status: 500 })
    }

    // Ensure consistent format - convert to lowercase for comparison
    const userAnswer = answer.toLowerCase().trim()
    const correctAnswer = question.correct_answer.toLowerCase().trim()
    const isCorrect = correctAnswer === userAnswer

    // Record answer in arcade_progress
    const { error: progressError } = await supabase
      .from('arcade_progress')
      .insert({
        arcade_session_id: sessionId,
        question_id: questionId,
        user_answer: userAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        time_spent_seconds: timeSpent,
        answered_at: new Date().toISOString()
      })

    if (progressError) {
      return NextResponse.json({ error: progressError.message }, { status: 500 })
    }

    // Mark question as used in pool
    const { error: poolError } = await supabase
      .from('arcade_question_pool')
      .update({ is_used: true })
      .eq('arcade_session_id', sessionId)
      .eq('question_id', questionId)

    if (poolError) {
      return NextResponse.json({ error: poolError.message }, { status: 500 })
    }

    // Update session progress
    const { data: currentSession } = await supabase
      .from('arcade_sessions')
      .select('questions_completed, correct_answers, total_time_seconds')
      .eq('id', sessionId)
      .single()

    if (currentSession) {
      const { error: sessionError } = await supabase
        .from('arcade_sessions')
        .update({
          questions_completed: currentSession.questions_completed + 1,
          correct_answers: currentSession.correct_answers + (isCorrect ? 1 : 0),
          total_time_seconds: currentSession.total_time_seconds + timeSpent
        })
        .eq('id', sessionId)

      if (sessionError) {
        return NextResponse.json({ error: sessionError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      isCorrect,
      correctAnswer: question.correct_answer,
      explanation: question.explanation,
      userAnswer: answer
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    )
  }
}