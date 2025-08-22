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

    // Get next unanswered question
    const { data: questionData, error: questionError } = await supabase
      .from("arcade_question_pool")
      .select(
        `
        question_id,
        randomized_order,
        questions (
          id,
          chapter,
          question,
          choice_a,
          choice_b,
          choice_c,
          choice_d,
          correct_answer,
          explanation
        )
      `
      )
      .eq("arcade_session_id", sessionId)
      .eq("is_used", false)
      .order("randomized_order")
      .limit(1)
      .single();

    if (questionError) {
      if (questionError.code === "PGRST116") {
        // No more questions - session complete
        await supabase
          .from("arcade_sessions")
          .update({
            is_active: false,
            completed_at: new Date().toISOString(),
          })
          .eq("id", sessionId);

        return NextResponse.json({
          question: null,
          isComplete: true,
          message: "Arcade session complete!",
        });
      }
      return NextResponse.json(
        { error: questionError.message },
        { status: 500 }
      );
    }

    // Get session progress
    const { data: session, error: sessionError } = await supabase
      .from("arcade_sessions")
      .select("questions_completed, total_questions, correct_answers")
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      return NextResponse.json(
        { error: sessionError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      question: questionData.questions,
      progress: {
        current: session.questions_completed + 1,
        total: session.total_questions,
        correctAnswers: session.correct_answers,
        percentage: Math.round(
          (session.questions_completed / session.total_questions) * 100
        ),
      },
      isComplete: false,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch next question" },
      { status: 500 }
    );
  }
}
