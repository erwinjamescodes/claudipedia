'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Gamepad2, Play, RotateCcw, Trophy, Clock, Target } from 'lucide-react'
import { useCreateArcadeSession } from '@/lib/hooks/use-arcade'
import { useArcadeStore } from '@/lib/stores/arcade-store'

export default function ArcadePage() {
  const router = useRouter()
  const createSession = useCreateArcadeSession()
  const { currentSession, clearSession } = useArcadeStore()

  const handleStartArcade = async () => {
    try {
      const result = await createSession.mutateAsync()
      router.push(`/arcade/${result.sessionId}`)
    } catch (error) {
      console.error('Failed to start arcade session:', error)
    }
  }

  const handleResumeSession = () => {
    if (currentSession) {
      router.push(`/arcade/${currentSession.sessionId}`)
    }
  }

  const handleStartNew = () => {
    clearSession()
    handleStartArcade()
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Gamepad2 className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Arcade Mode</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Master all 1100 counseling questions in a simplified, game-like experience. 
          Questions appear randomly, each one only once per session.
        </p>
      </div>

      {/* Active Session Card */}
      {currentSession && currentSession.isActive && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Active Session
            </CardTitle>
            <CardDescription>
              Resume your current arcade session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">
                  Question {currentSession.questionsCompleted + 1} of {currentSession.totalQuestions}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentSession.correctAnswers} correct • {currentSession.accuracy}% accuracy
                </p>
              </div>
              <Badge variant="secondary">
                {Math.round((currentSession.questionsCompleted / currentSession.totalQuestions) * 100)}% Complete
              </Badge>
            </div>
            <Progress 
              value={(currentSession.questionsCompleted / currentSession.totalQuestions) * 100} 
              className="h-2"
            />
            <div className="flex gap-3">
              <Button onClick={handleResumeSession} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Resume Session
              </Button>
              <Button 
                onClick={handleStartNew} 
                variant="outline"
                disabled={createSession.isPending}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Start New
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <Target className="h-8 w-8 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Complete Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              All 1100 questions from 9 chapters. Each question appears exactly once per session.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">No Time Pressure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Take your time to think through each question. Focus on learning, not speed.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Trophy className="h-8 w-8 mx-auto text-primary mb-2" />
            <CardTitle className="text-lg">Immediate Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Get instant feedback with detailed explanations to reinforce learning.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Start Button */}
      {(!currentSession || !currentSession.isActive) && (
        <Card>
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

      {/* Stats Summary */}
      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="font-semibold mb-4">What to Expect</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">1100</div>
            <div className="text-sm text-muted-foreground">Total Questions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">9</div>
            <div className="text-sm text-muted-foreground">Chapters Covered</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">∞</div>
            <div className="text-sm text-muted-foreground">No Time Limit</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">✓</div>
            <div className="text-sm text-muted-foreground">Instant Feedback</div>
          </div>
        </div>
      </div>
    </div>
  )
}