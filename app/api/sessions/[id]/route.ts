import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const sessionId = parseInt(params.id)

    const { data: session, error } = await supabase
      .from('study_sessions')
      .select(`
        *,
        mock_exam_settings (*)
      `)
      .eq('id', sessionId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json(session)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch session' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const supabase = await createClient()
    const sessionId = parseInt(params.id)

    const { data: session, error } = await supabase
      .from('study_sessions')
      .update(body)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(session)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update session' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const sessionId = parseInt(params.id)

    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Session deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete session' }, 
      { status: 500 }
    )
  }
}