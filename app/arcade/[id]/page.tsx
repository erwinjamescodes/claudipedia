"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronRight,
  CheckCircle,
  XCircle,
  BookOpen,
  ArrowLeft,
  Gamepad2,
} from "lucide-react";
import { toast } from "sonner";
import { useArcadeStore } from "@/lib/stores/arcade-store";
import {
  useNextQuestion,
  useSubmitAnswer,
  useSessionDetails,
} from "@/lib/hooks/use-arcade";
import Image from "next/image";

interface ArcadeQuestionPageProps {
  params: Promise<{ id: string }>;
}

export default function ArcadeQuestionPage({
  params,
}: ArcadeQuestionPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const sessionId = parseInt(id);
  const [selectedAnswer, setSelectedAnswer] = useState<
    "a" | "b" | "c" | "d" | null
  >(null);

  const {
    currentQuestion,
    selectedAnswer: storeSelectedAnswer,
    showFeedback,
    isSubmitted,
    lastFeedback,
    progress,
    nextQuestion,
    setSelectedAnswer: setStoreSelectedAnswer,
  } = useArcadeStore();

  const { data: questionData, isLoading, refetch } = useNextQuestion(sessionId);
  const submitAnswer = useSubmitAnswer();
  useSessionDetails(sessionId); // Keep session data in sync

  // Handle question completion
  useEffect(() => {
    if (questionData?.isComplete) {
      router.push(`/arcade/${sessionId}/complete`);
    }
  }, [questionData?.isComplete, router, sessionId]);

  // Sync selected answer with store
  useEffect(() => {
    setSelectedAnswer(storeSelectedAnswer as "a" | "b" | "c" | "d" | null);
  }, [storeSelectedAnswer]);

  const handleAnswerSelect = (answer: "a" | "b" | "c" | "d") => {
    if (isSubmitted) return;
    setSelectedAnswer(answer);
    setStoreSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion) {
      toast.error("Please select an answer");
      return;
    }

    try {
      await submitAnswer.mutateAsync({
        answer: selectedAnswer,
        timeSpent: 0, // No timer in arcade mode
      });
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const handleNextQuestion = () => {
    // Clear state but keep current question until new one loads
    nextQuestion();
    setSelectedAnswer(null);

    // Fetch the next question - this will replace currentQuestion when successful
    refetch();
  };

  const handleBackToLanding = () => {
    router.push("/arcade");
  };

  if (isLoading && !currentQuestion) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading your next question...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion && !isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h2 className="text-xl font-semibold">No Question Available</h2>
              <p className="text-muted-foreground">
                Unable to load the next question. Please try again.
              </p>
            </div>
            <Button onClick={handleBackToLanding}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Arcade
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getChoiceText = (choice: "a" | "b" | "c" | "d") => {
    if (!currentQuestion) return "";
    switch (choice) {
      case "a":
        return currentQuestion.choice_a || "";
      case "b":
        return currentQuestion.choice_b || "";
      case "c":
        return currentQuestion.choice_c || "";
      case "d":
        return currentQuestion.choice_d || "";
    }
  };

  const isCorrectAnswer = (choice: "a" | "b" | "c" | "d") => {
    return showFeedback && lastFeedback?.correctAnswer.toLowerCase() === choice;
  };

  const isUserAnswer = (choice: "a" | "b" | "c" | "d") => {
    return showFeedback && lastFeedback?.userAnswer.toLowerCase() === choice;
  };

  const getChoiceStyle = (choice: "a" | "b" | "c" | "d") => {
    if (!showFeedback) return "";

    if (isCorrectAnswer(choice)) {
      return "border-green-500 bg-green-50 text-green-900";
    }

    if (isUserAnswer(choice) && !isCorrectAnswer(choice)) {
      return "border-red-500 bg-red-50 text-red-900";
    }

    return "opacity-50";
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={handleBackToLanding} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
        <div className="flex items-center justify-center gap-1">
          <Image
            src="/book.webp"
            alt="Book icon"
            width={24}
            height={24}
            className="text-primary"
          />
          <p className="text-md font-bold">Claudipedia</p>
        </div>
      </div>

      {/* Progress */}
      {progress && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  Question {progress.current} of {progress.total}
                </span>
                {/* <span className="text-muted-foreground">
                  {Math.round(((progress.current - 1) / progress.total) * 100)}%
                  Complete
                </span> */}
              </div>
              <Progress
                value={((progress.current - 1) / progress.total) * 100}
                className="h-2"
              />
              {/* <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{progress.correctAnswers} correct answers</span>
                <span>
                  {progress.current > 1 &&
                    `${Math.round(
                      (progress.correctAnswers / (progress.current - 1)) * 100
                    )}% accuracy`}
                </span>
              </div> */}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Badge variant="outline" className="text-xs">
                  {currentQuestion.chapter
                    .replace(/_/g, " ")
                    .replace(/^\d+\s*/, "")
                    .toUpperCase()}
                </Badge>
                <CardTitle className="text-lg leading-relaxed">
                  {currentQuestion.question}
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Answer Choices */}
            <RadioGroup
              value={selectedAnswer || ""}
              onValueChange={(value) =>
                handleAnswerSelect(value as "a" | "b" | "c" | "d")
              }
              className="space-y-3"
              disabled={isSubmitted}
            >
              {(["a", "b", "c", "d"] as const).map((choice) => {
                const choiceText = getChoiceText(choice);
                if (!choiceText) return null;

                return (
                  <div
                    key={choice}
                    className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${getChoiceStyle(
                      choice
                    )} ${
                      !showFeedback && selectedAnswer === choice
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    <RadioGroupItem value={choice} id={choice} />
                    <Label htmlFor={choice} className="flex-1 cursor-pointer ">
                      <span className="font-medium mr-2">
                        {choice.toUpperCase()}.
                      </span>
                      {choiceText}
                    </Label>
                    {showFeedback && isCorrectAnswer(choice) && (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    )}
                    {showFeedback &&
                      isUserAnswer(choice) &&
                      !isCorrectAnswer(choice) && (
                        <XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                      )}
                  </div>
                );
              })}
            </RadioGroup>

            {/* Feedback Section */}
            {showFeedback && lastFeedback && (
              <div
                className={
                  lastFeedback.isCorrect
                    ? "border-green-200 bg-green-50 w-full p-4 rounded-lg"
                    : "border-red-200 bg-red-50 w-full p-4 rounded-lg"
                }
              >
                <div className="flex items-start gap-3 w-full">
                  {lastFeedback.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="space-y-2  w-full">
                    <div className="font-semibold">
                      {lastFeedback.isCorrect ? "Correct!" : "Incorrect"}
                    </div>
                    {!lastFeedback.isCorrect && (
                      <div className="text-sm">
                        The correct answer is{" "}
                        <strong>
                          {lastFeedback.correctAnswer.toUpperCase()}
                        </strong>
                        .
                      </div>
                    )}
                    {lastFeedback.explanation && (
                      <AlertDescription className="text-sm">
                        {/* <BookOpen className="h-4 w-4 inline mr-2" /> */}
                        {lastFeedback.explanation}
                      </AlertDescription>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isSubmitted ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer || submitAnswer.isPending}
                  className="flex-1"
                  size="lg"
                >
                  {submitAnswer.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Answer"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="flex-1"
                  size="lg"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Next Question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
