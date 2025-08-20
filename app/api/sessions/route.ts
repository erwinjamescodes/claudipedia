import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { StudyMode } from "@/lib/stores/session-store"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: sessions, error } = await supabase
      .from('study_sessions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(sessions)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sessions' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      name, 
      mode, 
      selectedChapters = [], 
      mockExamSettings 
    } = body

    const supabase = await createClient()

    // First, get available questions based on mode and filters
    let questionQuery = supabase.from('questions').select('id, chapter')

    if (mode === 'by_chapter' && selectedChapters.length > 0) {
      questionQuery = questionQuery.in('chapter', selectedChapters)
    } else if (mode === 'mixed' && selectedChapters.length > 0) {
      questionQuery = questionQuery.in('chapter', selectedChapters)
    } else if (mode === 'review') {
      // For review mode, we need questions that have been answered
      const { data: answeredQuestions } = await supabase
        .from('user_progress')
        .select('question_id')
      
      if (answeredQuestions && answeredQuestions.length > 0) {
        const questionIds = answeredQuestions.map(q => q.question_id)
        questionQuery = questionQuery.in('id', questionIds)
      }
    }

    const { data: availableQuestions, error: questionsError } = await questionQuery

    if (questionsError) {
      return NextResponse.json({ error: questionsError.message }, { status: 500 })
    }

    if (!availableQuestions || availableQuestions.length === 0) {
      return NextResponse.json({ error: 'No questions available for selected criteria' }, { status: 400 })
    }

    let totalQuestions = availableQuestions.length
    if (mode === 'mock_exam' && mockExamSettings?.questionCount) {
      totalQuestions = Math.min(mockExamSettings.questionCount, availableQuestions.length)
    }

    // Create the session
    const { data: session, error: sessionError } = await supabase
      .from('study_sessions')
      .insert({
        name,
        mode,
        selected_chapters: selectedChapters,
        total_questions_available: totalQuestions,
      })
      .select()
      .single()

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }

    // Create mock exam settings if needed
    if (mode === 'mock_exam' && mockExamSettings) {
      const { error: mockExamError } = await supabase
        .from('mock_exam_settings')
        .insert({
          session_id: session.id,
          time_limit_minutes: mockExamSettings.timeLimitMinutes,
          question_count: mockExamSettings.questionCount,
          shuffle_questions: mockExamSettings.shuffleQuestions,
          shuffle_choices: mockExamSettings.shuffleChoices,
        })

      if (mockExamError) {
        // Clean up session if mock exam settings fail
        await supabase.from('study_sessions').delete().eq('id', session.id)
        return NextResponse.json({ error: mockExamError.message }, { status: 500 })
      }
    }

    // Create question pool for this session
    let questionsToAdd = availableQuestions
    
    // Shuffle questions if needed
    if (mode === 'random' || (mode === 'mock_exam' && mockExamSettings?.shuffleQuestions)) {
      questionsToAdd = [...availableQuestions].sort(() => Math.random() - 0.5)
    }

    // Limit questions for mock exam
    if (mode === 'mock_exam' && mockExamSettings?.questionCount) {
      questionsToAdd = questionsToAdd.slice(0, mockExamSettings.questionCount)
    }

    // Insert questions into session pool
    const poolData = questionsToAdd.map((q, index) => ({
      session_id: session.id,
      question_id: q.id,
      order_index: index,
    }))

    const { error: poolError } = await supabase
      .from('session_question_pool')
      .insert(poolData)

    if (poolError) {
      // Clean up session if pool creation fails
      await supabase.from('study_sessions').delete().eq('id', session.id)
      return NextResponse.json({ error: poolError.message }, { status: 500 })
    }

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create session' }, 
      { status: 500 }
    )
  }
}