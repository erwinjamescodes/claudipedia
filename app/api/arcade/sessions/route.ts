import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create arcade session
    const { data: session, error: sessionError } = await supabase
      .from('arcade_sessions')
      .insert({
        user_id: user.id,
        total_questions: 1100,
        questions_completed: 0,
        correct_answers: 0,
        is_active: true,
        started_at: new Date().toISOString(),
        total_time_seconds: 0
      })
      .select()
      .single()

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }

    // Populate randomized question pool
    const { error: poolError } = await supabase.rpc('create_arcade_question_pool', {
      session_id: session.id
    })

    if (poolError) {
      // Fallback to manual insert if RPC doesn't exist
      const { data: questions } = await supabase
        .from('questions')
        .select('id')
      
      if (questions) {
        const shuffledQuestions = questions
          .map((q) => ({
            arcade_session_id: session.id,
            question_id: q.id,
            is_used: false,
            randomized_order: Math.random()
          }))
          .sort((a, b) => a.randomized_order - b.randomized_order)
          .map((q, index) => ({ ...q, randomized_order: index + 1 }))

        const { error: insertError } = await supabase
          .from('arcade_question_pool')
          .insert(shuffledQuestions)

        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({
      sessionId: session.id,
      totalQuestions: 1100
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create arcade session' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get active arcade session for user
    const { data: session, error } = await supabase
      .from('arcade_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(session)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch arcade session' },
      { status: 500 }
    )
  }
}