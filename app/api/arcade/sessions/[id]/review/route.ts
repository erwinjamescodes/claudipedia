import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from("arcade_sessions")
      .select("id, user_id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Fetch all answered questions for this session
    const { data: reviewData, error: reviewError } = await supabase
      .from("arcade_progress")
      .select(
        `
        id,
        question_id,
        user_answer,
        correct_answer,
        is_correct,
        time_spent_seconds,
        answered_at,
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
      .order("answered_at", { ascending: true });

    if (reviewError) {
      console.error("Error fetching review data:", reviewError);
      return NextResponse.json(
        { error: "Failed to fetch review data" },
        { status: 500 }
      );
    }

    // Transform the data for easier frontend consumption
    const reviewQuestions = reviewData.map((item) => ({
      id: item.question_id,
      // @ts-ignore
      chapter: item.questions.chapter,
      // @ts-ignore
      question: item.questions.question,
      // @ts-ignore
      choice_a: item.questions.choice_a,
      // @ts-ignore
      choice_b: item.questions.choice_b,
      // @ts-ignore
      choice_c: item.questions.choice_c,
      // @ts-ignore
      choice_d: item.questions.choice_d,
      // @ts-ignore
      correct_answer: item.questions.correct_answer,
      // @ts-ignore
      explanation: item.questions.explanation,
      user_answer: item.user_answer,
      is_correct: item.is_correct,
      time_spent_seconds: item.time_spent_seconds,
      answered_at: item.answered_at,
    }));

    return NextResponse.json({
      sessionId,
      questions: reviewQuestions,
      totalQuestions: reviewQuestions.length,
    });
  } catch (error) {
    console.error("Error in arcade review API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
