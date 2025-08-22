import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const sessionId = parseInt(id);
    
    // Extract pagination and filter parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const filter = searchParams.get('filter') || 'all'; // all, correct, incorrect

    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 400 }
      );
    }
    
    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: "Invalid page parameter" },
        { status: 400 }
      );
    }
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid limit parameter (1-100)" },
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

    // Get counts for all filter types
    const { count: allCount } = await supabase
      .from("arcade_progress")
      .select('*', { count: 'exact', head: true })
      .eq("arcade_session_id", sessionId);
      
    const { count: correctCount } = await supabase
      .from("arcade_progress")
      .select('*', { count: 'exact', head: true })
      .eq("arcade_session_id", sessionId)
      .eq('is_correct', true);
      
    const { count: incorrectCount } = await supabase
      .from("arcade_progress")
      .select('*', { count: 'exact', head: true })
      .eq("arcade_session_id", sessionId)
      .eq('is_correct', false);

    // Build query for paginated data
    let dataQuery = supabase
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
      .eq("arcade_session_id", sessionId);
    
    // Apply filter if specified
    let totalCount = allCount || 0;
    if (filter === 'correct') {
      dataQuery = dataQuery.eq('is_correct', true);
      totalCount = correctCount || 0;
    } else if (filter === 'incorrect') {
      dataQuery = dataQuery.eq('is_correct', false);
      totalCount = incorrectCount || 0;
    }
    
    // Apply pagination and ordering
    const offset = (page - 1) * limit;
    const { data: reviewData, error: reviewError } = await dataQuery
      .order("answered_at", { ascending: true })
      .range(offset, offset + limit - 1);

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
      // @ts-expect-error - Supabase join type not properly inferred
      chapter: item.questions.chapter,
      // @ts-expect-error - Supabase join type not properly inferred
      question: item.questions.question,
      // @ts-expect-error - Supabase join type not properly inferred
      choice_a: item.questions.choice_a,
      // @ts-expect-error - Supabase join type not properly inferred
      choice_b: item.questions.choice_b,
      // @ts-expect-error - Supabase join type not properly inferred
      choice_c: item.questions.choice_c,
      // @ts-expect-error - Supabase join type not properly inferred
      choice_d: item.questions.choice_d,
      // @ts-expect-error - Supabase join type not properly inferred
      correct_answer: item.questions.correct_answer,
      // @ts-expect-error - Supabase join type not properly inferred
      explanation: item.questions.explanation,
      user_answer: item.user_answer,
      is_correct: item.is_correct,
      time_spent_seconds: item.time_spent_seconds,
      answered_at: item.answered_at,
    }));

    return NextResponse.json({
      sessionId,
      questions: reviewQuestions,
      totalQuestions: totalCount || 0,
      currentPage: page,
      totalPages: Math.ceil((totalCount || 0) / limit),
      questionsPerPage: limit,
      filter,
      allCount: allCount || 0,
      correctCount: correctCount || 0,
      incorrectCount: incorrectCount || 0,
    });
  } catch (error) {
    console.error("Error in arcade review API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
