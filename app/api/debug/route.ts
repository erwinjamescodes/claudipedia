import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if questions table has data
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .limit(5)

    // Check if we have any sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('study_sessions')
      .select('*')
      .limit(5)

    return NextResponse.json({
      questions: {
        count: questions?.length || 0,
        error: questionsError?.message,
        sample: questions?.[0] || null
      },
      sessions: {
        count: sessions?.length || 0,
        error: sessionsError?.message,
        sample: sessions?.[0] || null
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Debug check failed', details: error }, 
      { status: 500 }
    )
  }
}