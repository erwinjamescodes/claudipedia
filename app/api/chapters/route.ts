import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: chapters, error } = await supabase
      .from('questions')
      .select('chapter')
      .neq('chapter', null)
      .order('chapter')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get unique chapters with question counts
    const uniqueChapters = [...new Set(chapters?.map(c => c.chapter))]
    
    const chaptersWithCounts = await Promise.all(
      uniqueChapters.map(async (chapter) => {
        const { count } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('chapter', chapter)

        return {
          name: chapter,
          questionCount: count || 0
        }
      })
    )

    return NextResponse.json(chaptersWithCounts)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch chapters' }, 
      { status: 500 }
    )
  }
}