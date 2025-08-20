import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const sessionId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const current = searchParams.get('current') === 'true'

    if (current) {
      // Get the next unanswered question for this session
      const { data: nextQuestion, error } = await supabase
        .from('session_question_pool')
        .select(`
          question_id,
          order_index,
          questions (*)
        `)
        .eq('session_id', sessionId)
        .eq('is_answered', false)
        .order('order_index')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (!nextQuestion) {
        return NextResponse.json({ message: 'No more questions available' }, { status: 404 })
      }

      return NextResponse.json(nextQuestion.questions)
    } else {
      // Get all questions for this session
      const { data: questions, error } = await supabase
        .from('session_question_pool')
        .select(`
          question_id,
          order_index,
          is_answered,
          questions (*),
          user_progress (*)
        `)
        .eq('session_id', sessionId)
        .order('order_index')

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const formattedQuestions = questions?.map(q => ({
        ...q.questions,
        order_index: q.order_index,
        is_answered: q.is_answered,
        user_progress: q.user_progress?.[0] || null,
      })) || []

      return NextResponse.json(formattedQuestions)
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch questions' }, 
      { status: 500 }
    )
  }
}