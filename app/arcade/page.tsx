"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Play, BookOpen } from "lucide-react";
import {
  useCreateArcadeSession,
  useActiveSession,
} from "@/lib/hooks/use-arcade";
import { useArcadeStore } from "@/lib/stores/arcade-store";

export default function ArcadePage() {
  const router = useRouter();
  const createSession = useCreateArcadeSession();
  const { currentSession } = useArcadeStore();

  // Fetch active session from API
  const activeSessionQuery = useActiveSession();

  const handleStartArcade = async () => {
    try {
      const result = await createSession.mutateAsync();
      router.push(`/arcade/${result.sessionId}`);
    } catch (error) {
      console.error("Failed to start arcade session:", error);
    }
  };

  const handleResumeSession = () => {
    if (currentSession) {
      router.push(`/arcade/${currentSession.sessionId}`);
    }
  };

  const handleReviewAnswers = () => {
    if (currentSession) {
      router.push(`/arcade/${currentSession.sessionId}/review`);
    }
  };

  // Show loading state while fetching active session
  if (activeSessionQuery.isLoading) {
    return (
      <div className="flex flex-col max-w-4xl mx-auto p-6 gap-8 min-h-screen">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mt-20">
            <h1 className="text-5xl font-extrabold font-serif italic text-primary">
              Claudipedia
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Loading your session...
          </p>
        </div>
        <div className="flex justify-center">
          {/* <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /> */}
          <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-4xl mx-auto p-6 gap-8 min-h-screen ">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mt-20">
          <h1 className="text-5xl font-extrabold font-serif italic text-primary">
            Claudipedia
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Master all 1100 counseling questions in a simplified, game-like
          experience. Questions appear randomly, each one only once per session.
        </p>
      </div>

      {/* Active Session Card */}
      {currentSession && currentSession.isActive && (
        <Card className="border-primary/50 bg-primary/5 w-full">
          <CardHeader className="flex justify-between">
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" fill="black" />
              Your Progress
            </CardTitle>
            <CardDescription>
              Click resume to continue your current learning session
            </CardDescription>{" "}
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <p className="font-medium">
                  Question {currentSession.questionsCompleted + 1} of{" "}
                  {currentSession.totalQuestions}
                </p>
                <div className="text-sm text-muted-foreground">
                  (
                  {Math.round(
                    (currentSession.questionsCompleted /
                      currentSession.totalQuestions) *
                      100
                  )}
                  % Complete)
                </div>{" "}
              </div>
              <div className="flex flex-row gap-2">
                <div className="text-sm text-muted-foreground">
                  {currentSession.accuracy}% accuracy
                </div>
              </div>
            </div>
            <Progress
              value={
                (currentSession.questionsCompleted /
                  currentSession.totalQuestions) *
                100
              }
              className="h-2"
            />
            <div className="flex gap-3">
              <Button onClick={handleResumeSession} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Resume Session
              </Button>
              <Button
                onClick={handleReviewAnswers}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Review Answers
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-primary/50 w-full">
          <CardHeader className="text-center">
            <Image
              src="/coverage.webp"
              alt="Complete Coverage"
              width={80}
              height={80}
              className="mx-auto mb-2"
            />
            <CardTitle className="text-lg">Complete Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              All 1100 questions from Encyclopedia of Counseling. Each question
              appears only once.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 w-full">
          <CardHeader className="text-center">
            <Image
              src="/timer.png"
              alt="No Time Pressure"
              width={80}
              height={80}
              className="mx-auto mb-2"
            />
            <CardTitle className="text-lg">No Time Pressure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Take your time to think through each question. Focus on learning,
              not speed.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 w-full">
          <CardHeader className="text-center">
            <Image
              src="/medal.webp"
              alt="Immediate Feedback"
              width={80}
              height={80}
              className="mx-auto mb-2"
            />
            <CardTitle className="text-lg">Immediate Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Get instant feedback with detailed explanations to reinforce
              learning.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Start Button */}
      {(!currentSession || !currentSession.isActive) && (
        <Card className="border-primary/50 w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Ready to Start?</h2>
                <p className="text-muted-foreground">
                  Begin your journey through all 1100 counseling exam questions
                </p>
              </div>

              <Button
                onClick={handleStartArcade}
                size="lg"
                className="px-8 py-6 text-lg"
                disabled={createSession.isPending}
              >
                {createSession.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Starting Session...
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-2" />
                    Start Arcade Mode
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
