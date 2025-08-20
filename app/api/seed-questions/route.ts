import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const sampleQuestions = [
  {
    chapter: "Psychology Fundamentals",
    question: "According to Freud's psychoanalytic theory, which part of the personality operates on the pleasure principle?",
    choice_a: "Ego",
    choice_b: "Id",
    choice_c: "Superego",
    choice_d: "Conscious mind",
    correct_answer: "B",
    explanation: "The Id operates on the pleasure principle, seeking immediate gratification of desires and impulses."
  },
  {
    chapter: "Psychology Fundamentals", 
    question: "What is the primary focus of cognitive-behavioral therapy (CBT)?",
    choice_a: "Exploring childhood experiences",
    choice_b: "Identifying and changing negative thought patterns and behaviors",
    choice_c: "Analyzing dreams and unconscious desires",
    choice_d: "Focusing solely on behavior modification",
    correct_answer: "B",
    explanation: "CBT focuses on identifying and changing negative or distorted thought patterns and maladaptive behaviors."
  },
  {
    chapter: "Counseling Theories",
    question: "Who developed Person-Centered Therapy?",
    choice_a: "Sigmund Freud",
    choice_b: "Albert Ellis",
    choice_c: "Carl Rogers",
    choice_d: "Aaron Beck",
    correct_answer: "C",
    explanation: "Carl Rogers developed Person-Centered Therapy, emphasizing unconditional positive regard, empathy, and genuineness."
  },
  {
    chapter: "Counseling Theories",
    question: "Which therapeutic approach emphasizes the here-and-now experience?",
    choice_a: "Psychoanalytic therapy",
    choice_b: "Gestalt therapy",
    choice_c: "Behavioral therapy",
    choice_d: "Solution-focused therapy",
    correct_answer: "B",
    explanation: "Gestalt therapy emphasizes present-moment awareness and the here-and-now experience rather than past events."
  },
  {
    chapter: "Assessment and Testing",
    question: "What does reliability refer to in psychological testing?",
    choice_a: "Whether a test measures what it claims to measure",
    choice_b: "The consistency of test results over time",
    choice_c: "The test's ability to predict future behavior",
    choice_d: "The cultural fairness of the test",
    correct_answer: "B",
    explanation: "Reliability refers to the consistency and stability of test results when administered multiple times."
  },
  {
    chapter: "Assessment and Testing",
    question: "What is validity in the context of psychological assessment?",
    choice_a: "The consistency of test results",
    choice_b: "The speed at which a test can be administered",
    choice_c: "Whether a test measures what it claims to measure",
    choice_d: "The cost-effectiveness of the test",
    correct_answer: "C",
    explanation: "Validity refers to whether a test actually measures what it is intended to measure."
  },
  {
    chapter: "Ethics and Professional Issues",
    question: "According to the APA Ethics Code, what is the primary obligation of psychologists?",
    choice_a: "To make money from their practice",
    choice_b: "To do no harm and benefit those with whom they work",
    choice_c: "To follow the law regardless of ethical implications",
    choice_d: "To maintain relationships with colleagues",
    correct_answer: "B",
    explanation: "The primary ethical obligation is beneficence and nonmaleficence - to do good and avoid harm."
  },
  {
    chapter: "Ethics and Professional Issues",
    question: "What is required for informed consent in therapy?",
    choice_a: "Only verbal agreement from the client",
    choice_b: "A written contract signed by both parties",
    choice_c: "Client understanding of the nature, risks, and benefits of treatment",
    choice_d: "Permission from family members",
    correct_answer: "C",
    explanation: "Informed consent requires that clients understand the nature of treatment, potential risks, benefits, and alternatives."
  },
  {
    chapter: "Research and Statistics",
    question: "What is the difference between Type I and Type II errors?",
    choice_a: "Type I is rejecting a true null hypothesis; Type II is accepting a false null hypothesis",
    choice_b: "Type I is accepting a false null hypothesis; Type II is rejecting a true null hypothesis",
    choice_c: "There is no difference between them",
    choice_d: "They only apply to qualitative research",
    correct_answer: "A",
    explanation: "Type I error is rejecting a true null hypothesis (false positive); Type II is failing to reject a false null hypothesis (false negative)."
  },
  {
    chapter: "Research and Statistics",
    question: "What does statistical significance typically indicate?",
    choice_a: "The results are practically meaningful",
    choice_b: "The results are likely not due to chance alone",
    choice_c: "The study has a large sample size",
    choice_d: "The effect size is large",
    correct_answer: "B",
    explanation: "Statistical significance indicates that the observed results are unlikely to have occurred by chance alone, typically at p < 0.05."
  }
]

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Check if questions already exist
    const { data: existingQuestions } = await supabase
      .from('questions')
      .select('id')
      .limit(1)

    if (existingQuestions && existingQuestions.length > 0) {
      return NextResponse.json({ 
        message: 'Questions already exist in the database',
        count: existingQuestions.length 
      })
    }

    // Insert sample questions
    const { data, error } = await supabase
      .from('questions')
      .insert(sampleQuestions)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Sample questions seeded successfully',
      count: data?.length || 0,
      questions: data
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to seed questions' }, 
      { status: 500 }
    )
  }
}