"use client";

import { use, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewQuestion {
  id: number;
  chapter: string;
  question: string;
  choice_a: string | null;
  choice_b: string | null;
  choice_c: string | null;
  choice_d: string | null;
  correct_answer: string;
  explanation: string | null;
  user_answer: string;
  is_correct: boolean;
  time_spent_seconds: number;
  answered_at: string;
}

interface ReviewData {
  sessionId: number;
  questions: ReviewQuestion[];
  totalQuestions: number;
  currentPage: number;
  totalPages: number;
  questionsPerPage: number;
  filter: string;
  allCount: number;
  correctCount: number;
  incorrectCount: number;
}

interface ArcadeReviewPageProps {
  params: Promise<{ id: string }>;
}

async function fetchReviewData(
  sessionId: number,
  page: number,
  limit: number,
  filter: string
): Promise<ReviewData> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    filter,
  });
  
  const response = await fetch(
    `/api/arcade/sessions/${sessionId}/review?${params}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch review data");
  }

  return response.json();
}

export default function ArcadeReviewPage({ params }: ArcadeReviewPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);
  const sessionId = parseInt(id);

  // Initialize state from URL params
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect">(
    (searchParams.get('filter') as "all" | "correct" | "incorrect") || "all"
  );
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1')
  );
  const questionsPerPage = 10;

  // Function to update URL with current state
  const updateURL = (page: number, filterValue: string) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (filterValue !== 'all') params.set('filter', filterValue);
    
    const newURL = params.toString() 
      ? `/arcade/${id}/review?${params.toString()}`
      : `/arcade/${id}/review`;
    
    router.replace(newURL, { scroll: false });
  };

  // Sync URL params with state changes
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1');
    const urlFilter = (searchParams.get('filter') as "all" | "correct" | "incorrect") || "all";
    
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
    if (urlFilter !== filter) {
      setFilter(urlFilter);
    }
  }, [searchParams, currentPage, filter]);

  const {
    data: reviewData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["arcade-review", sessionId, currentPage, questionsPerPage, filter],
    queryFn: () => fetchReviewData(sessionId, currentPage, questionsPerPage, filter),
    enabled: !isNaN(sessionId),
    keepPreviousData: true,
  });

  const handleBackToComplete = () => {
    router.push(`/arcade/`);
  };

  const handleBackToArcade = () => {
    router.push("/arcade");
  };

  if (isNaN(sessionId)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h2 className="text-xl font-semibold">Invalid Session</h2>
              <p className="text-muted-foreground">
                Please provide a valid session ID.
              </p>
            </div>
            <Button onClick={handleBackToArcade}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Arcade
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading session review...</p>
        </div>
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h2 className="text-xl font-semibold">Review Not Available</h2>
              <p className="text-muted-foreground">
                Unable to load session review. The session may not exist or you
                may not have permission to view it.
              </p>
            </div>
            <Button onClick={handleBackToArcade}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Arcade
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reset to page 1 when filter changes
  const handleFilterChange = (value: "all" | "correct" | "incorrect") => {
    setFilter(value);
    setCurrentPage(1);
    updateURL(1, value);
  };

  const goToNextPage = () => {
    if (reviewData && currentPage < reviewData.totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      updateURL(newPage, filter);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      updateURL(newPage, filter);
    }
  };
  
  // Get data from server response
  const totalPages = reviewData?.totalPages || 0;
  const startIndex = reviewData ? (reviewData.currentPage - 1) * reviewData.questionsPerPage : 0;
  const endIndex = reviewData ? Math.min(startIndex + reviewData.questionsPerPage, reviewData.totalQuestions) : 0;

  // Use counts from API response
  const allCount = reviewData?.allCount || 0;
  const correctCount = reviewData?.correctCount || 0;
  const incorrectCount = reviewData?.incorrectCount || 0;

  const getChoiceText = (
    question: ReviewQuestion,
    choice: "a" | "b" | "c" | "d"
  ) => {
    switch (choice) {
      case "a":
        return question.choice_a || "";
      case "b":
        return question.choice_b || "";
      case "c":
        return question.choice_c || "";
      case "d":
        return question.choice_d || "";
    }
  };


  const toggleQuestionExpand = (questionId: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mt-8">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleBackToComplete}
            variant="ghost"
            size="sm"
            className="hover:bg-transparent active:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
        <div className="flex items-center justify-center gap-1">
          <p className="text-md font-bold font-serif italic">Claudipedia</p>
        </div>
      </div>

      {/* Filter Controls */}

      <div className="items-center flex flex-row justify-between w-full">
        <div className="flex items-center justify-between">
          <Select
            value={filter}
            onValueChange={(value) =>
              handleFilterChange(value as "all" | "correct" | "incorrect")
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Questions ({allCount})
              </SelectItem>
              <SelectItem value="correct">
                Correct Only ({correctCount})
              </SelectItem>
              <SelectItem value="incorrect">
                Incorrect Only ({incorrectCount})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Pagination Info */}
        {reviewData && reviewData.questions.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{endIndex} of {reviewData.totalQuestions} questions
            {totalPages > 1 && (
              <span className="ml-2">
                (Page {reviewData.currentPage} of {reviewData.totalPages})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {!reviewData || reviewData.questions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="text-muted-foreground">
                No questions match the current filter.
              </div>
              <Button onClick={() => handleFilterChange("all")} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Show All Questions
              </Button>
            </CardContent>
          </Card>
        ) : (
          reviewData.questions.map((question) => {
            const isExpanded = expandedQuestions.has(question.id);

            return (
              <Card
                key={question.id}
                className={`border ${
                  question.is_correct ? "border-green-200" : "border-red-200"
                }`}
              >
                <CardHeader
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleQuestionExpand(question.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap flex-1 justify-between">
                          <Badge className="text-xs lowercase">
                            {question.chapter
                              .replace(/_/g, " ")
                              .replace(/^\d+\s*/, "")
                              .toUpperCase()}
                          </Badge>

                          {question.is_correct ? (
                            <div className="text-green-700 bg-transparent flex items-center gap-1 text-sm">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Correct
                            </div>
                          ) : (
                            <div className="text-red-700 bg-transparent flex items-center gap-1 text-sm">
                              <XCircle className="h-3 w-3 mr-1" />
                              Incorrect
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleQuestionExpand(question.id);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <CardTitle className="text-lg leading-relaxed pr-8">
                        {question.question}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4">
                    {/* Answer Choices */}
                    <RadioGroup value="" className="space-y-3" disabled>
                      {(["a", "b", "c", "d"] as const).map((choice) => {
                        const choiceText = getChoiceText(question, choice);
                        if (!choiceText) return null;

                        const isCorrect =
                          question.correct_answer.toLowerCase() === choice;
                        const isUserAnswer =
                          question.user_answer.toLowerCase() === choice;

                        let choiceStyle = "";
                        if (isCorrect) {
                          choiceStyle =
                            "border-green-500 bg-green-50 text-green-900";
                        } else if (isUserAnswer && !isCorrect) {
                          choiceStyle = "border-red-500 bg-red-50 text-red-900";
                        } else {
                          choiceStyle = "opacity-50";
                        }

                        return (
                          <div
                            key={choice}
                            className={`flex items-start space-x-3 p-4 rounded-lg border ${choiceStyle}`}
                          >
                            <RadioGroupItem
                              value={choice}
                              id={`${question.id}-${choice}`}
                              className="mt-[4px]"
                              checked={isUserAnswer}
                            />
                            <Label
                              htmlFor={`${question.id}-${choice}`}
                              className="flex-1 font-normal tracking-wide text-md"
                            >
                              <span className="font-medium mr-2">
                                {choice.toUpperCase()}.
                              </span>
                              {choiceText}
                            </Label>
                            {isCorrect && (
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            )}
                            {isUserAnswer && !isCorrect && (
                              <XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </RadioGroup>

                    {/* Explanation */}
                    {question.explanation && (
                      <div
                        className={`p-4 rounded-lg ${
                          question.is_correct
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        } border`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="space-y-2">
                            <div className="font-semibold">
                              {question.is_correct ? "Correct!" : "Incorrect"}
                            </div>
                            {!question.is_correct && (
                              <div className="text-sm">
                                The correct answer is{" "}
                                <strong>
                                  {question.correct_answer.toUpperCase()}
                                </strong>
                                .
                              </div>
                            )}
                            <AlertDescription className="text-md">
                              {question.explanation}
                            </AlertDescription>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Page {reviewData?.currentPage || currentPage} of {reviewData?.totalPages || totalPages}
          </div>
          
          <Button
            onClick={goToNextPage}
            disabled={reviewData ? currentPage === reviewData.totalPages : true}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
