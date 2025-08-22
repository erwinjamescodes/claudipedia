'use client'

import React, { use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Target, 
  Clock, 
  RotateCcw, 
  Home,
  Gamepad2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useSessionDetails } from '@/lib/hooks/use-arcade'
import { useArcadeStore } from '@/lib/stores/arcade-store'
import { useCreateArcadeSession } from '@/lib/hooks/use-arcade'

interface ArcadeCompletePageProps {
  params: Promise<{ id: string }>
}

export default function ArcadeCompletePage({ params }: ArcadeCompletePageProps) {
  const router = useRouter()
  const { id } = use(params)
  const sessionId = parseInt(id)
  const { data: session, isLoading } = useSessionDetails(sessionId)
  const { clearSession } = useArcadeStore()
  const createSession = useCreateArcadeSession()

  const handleStartNewSession = async () => {
    try {
      clearSession()
      const result = await createSession.mutateAsync()
      router.push(`/arcade/${result.sessionId}`)
    } catch (error) {
      console.error('Failed to start new session:', error)
    }
  }

  const handleBackToArcade = () => {
    clearSession()
    router.push('/arcade')
  }

  const handleBackToDashboard = () => {
    router.push('/protected')
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading session results...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h2 className="text-xl font-semibold">Session Not Found</h2>
              <p className="text-muted-foreground">
                Unable to load session results.
              </p>
            </div>
            <Button onClick={handleBackToArcade}>
              Back to Arcade
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 90) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (accuracy >= 80) return { level: 'Great', color: 'text-blue-600', bgColor: 'bg-blue-100' }
    if (accuracy >= 70) return { level: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    if (accuracy >= 60) return { level: 'Fair', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    return { level: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-100' }
  }

  const performance = getPerformanceLevel(session.accuracy)

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <Trophy className="h-16 w-16 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">Congratulations!</h1>
          <p className="text-xl text-muted-foreground mt-2">
            You've completed the Arcade Mode
          </p>
        </div>
      </div>

      {/* Performance Summary */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">
                {session.questionsCompleted}
              </div>
              <div className="text-sm text-muted-foreground">
                Questions Completed
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">
                {session.correctAnswers}
              </div>
              <div className="text-sm text-muted-foreground">
                Correct Answers
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">
                {session.accuracy}%
              </div>
              <div className="text-sm text-muted-foreground">
                Accuracy Rate
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{session.questionsCompleted} / {session.totalQuestions}</span>
            </div>
            <Progress value={100} className="h-3" />
          </div>

          {/* Performance Badge */}
          <div className="flex items-center justify-center">
            <Badge 
              variant="secondary" 
              className={`text-lg px-6 py-2 ${performance.color} ${performance.bgColor}`}
            >
              {performance.level} Performance
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Achievement Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Correct Answers</span>
              </div>
              <span className="font-semibold text-green-600">
                {session.correctAnswers}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm">Incorrect Answers</span>
              </div>
              <span className="font-semibold text-red-600">
                {session.questionsCompleted - session.correctAnswers}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Completion Rate</span>
              </div>
              <span className="font-semibold">100%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Time</span>
              <span className="font-semibold">
                {formatTime(session.totalTimeSeconds)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Average per Question</span>
              <span className="font-semibold">
                {Math.round(session.totalTimeSeconds / session.questionsCompleted)}s
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Started</span>
              <span className="font-semibold text-sm">
                {new Date(session.startedAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleStartNewSession}
              className="flex-1"
              size="lg"
              disabled={createSession.isPending}
            >
              {createSession.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Starting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Start New Arcade Session
                </>
              )}
            </Button>
            
            <Button
              onClick={handleBackToArcade}
              variant="outline"
              size="lg"
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Back to Arcade
            </Button>
            
            <Button
              onClick={handleBackToDashboard}
              variant="ghost"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Motivational Message */}
      <div className="text-center p-6 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">
          {session.accuracy >= 80 
            ? "Outstanding work! You&apos;re well-prepared for your counseling exam." 
            : session.accuracy >= 70 
            ? "Good job! Keep practicing to improve your performance." 
            : "Great effort! Consider reviewing the topics you found challenging."}
        </p>
      </div>
    </div>
  )
}