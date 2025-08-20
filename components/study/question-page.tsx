'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSession } from '@/lib/hooks/use-sessions'
import { useCurrentQuestion, useSubmitAnswer } from '@/lib/hooks/use-questions'
import { useQuestionStore } from '@/lib/stores/question-store'
import { useSessionStore } from '@/lib/stores/session-store'
import { useTimer } from '@/lib/hooks/use-timer'
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts'
import { 
  Clock, 
  Flag, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  BookOpen,
  ArrowLeft,
  SkipForward,
  AlertTriangle,
  Keyboard
} from 'lucide-react'
import { toast } from 'sonner'

interface QuestionPageProps {
  sessionId: number
}

export function QuestionPage({ sessionId }: QuestionPageProps) {
  const router = useRouter()
  const { data: session } = useSession(sessionId)
  const { data: currentQuestion, isLoading, error } = useCurrentQuestion(sessionId)
  const submitAnswer = useSubmitAnswer()
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  
  const {
    setCurrentQuestion,
    submitAnswer: storeSubmitAnswer,
    flagQuestion,
    showFeedback,
    isSubmitted,
    getUserAnswer,
  } = useQuestionStore()
  
  const {
    elapsedTime,
    remainingTime,
    isRunning,
    isTimeUp,
    warningLevel,
    startTimer,
    setQuestionStartTime,
    getQuestionElapsedTime,
    formatTime,
  } = useTimer()
  
  const { activeSession, incrementQuestionsAnswered } = useSessionStore()

  // Keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts({
    onSelect1: () => !isSubmitted && setSelectedAnswer('A'),
    onSelect2: () => !isSubmitted && setSelectedAnswer('B'),
    onSelect3: () => !isSubmitted && setSelectedAnswer('C'),
    onSelect4: () => !isSubmitted && setSelectedAnswer('D'),
    onSubmit: () => !isSubmitted && selectedAnswer && handleSubmitAnswer(),
    onNext: () => isSubmitted && handleContinue(),
    onFlag: () => handleFlagQuestion(),
    onSkip: () => handleSkipQuestion(),
    disabled: !currentQuestion,
  })

  // Timer effect
  useEffect(() => {
    if (!session) return

    // Start timer for mock exam mode
    if (session.mode === 'mock_exam') {
      // This would need mock exam settings from the API
      startTimer(120) // Default 2 hours, should come from settings
    } else {
      startTimer() // Unlimited time
    }
  }, [session, startTimer])

  // Set question start time when question changes
  useEffect(() => {
    if (currentQuestion) {
      setCurrentQuestion(currentQuestion)
      setQuestionStartTime()
      setSelectedAnswer(null)
    }
  }, [currentQuestion, setCurrentQuestion, setQuestionStartTime])

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion || !session) return

    const timeSpent = getQuestionElapsedTime()

    try {
      const result = await submitAnswer.mutateAsync({
        sessionId,
        questionId: currentQuestion.id,
        selectedAnswer,
        timeSpent,
      })

      // Update local store
      storeSubmitAnswer(currentQuestion.id, selectedAnswer, timeSpent)
      
      // Update session progress
      incrementQuestionsAnswered()

      toast.success(result.isCorrect ? 'Correct!' : 'Incorrect')
    } catch (error) {
      toast.error('Failed to submit answer')
      console.error('Submit answer error:', error)
    }
  }

  const handleContinue = () => {
    // The useCurrentQuestion hook will automatically refetch and get the next question
    setSelectedAnswer(null)
  }

  const handleFlagQuestion = () => {
    if (!currentQuestion) return
    
    const existingAnswer = getUserAnswer(currentQuestion.id)
    const newFlaggedState = !existingAnswer?.isFlagged
    
    flagQuestion(currentQuestion.id, newFlaggedState)
    toast.success(newFlaggedState ? 'Question flagged' : 'Flag removed')
  }

  const handleSkipQuestion = () => {
    if (!currentQuestion) return
    // For now, we'll just go to the next question without saving an answer
    handleContinue()
    toast.info('Question skipped')
  }

  const handleFinishSession = () => {
    router.push(`/study/${sessionId}/summary`)
  }

  // Handle time up
  useEffect(() => {
    if (isTimeUp && session?.mode === 'mock_exam') {
      toast.error('Time is up! Ending session...')
      setTimeout(() => {
        handleFinishSession()
      }, 2000)
    }
  }, [isTimeUp, session?.mode])

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded" />
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-20 bg-muted rounded" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !currentQuestion) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <div>
              <h2 className="text-2xl font-bold">Session Complete!</h2>
              <p className="text-muted-foreground mt-2">
                You've completed all questions in this session.
              </p>
            </div>
            <Button onClick={handleFinishSession}>
              View Results
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const userAnswer = getUserAnswer(currentQuestion.id)
  const progress = session ? (session.questions_answered / session.total_questions_available) * 100 : 0
  const questionNumber = session ? session.questions_answered + 1 : 1

  return (
    <div className="space-y-6">
      {/* Header with progress and timer */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/protected')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>{formatTime(elapsedTime)}</span>
          </div>
          
          {remainingTime !== null && (
            <div className="flex items-center gap-2 text-sm">
              {warningLevel === 'critical' && (
                <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
              )}
              <span className="text-muted-foreground">Remaining:</span>
              <span className={
                warningLevel === 'critical' 
                  ? 'text-red-500 font-bold animate-pulse' 
                  : warningLevel === 'warning'
                  ? 'text-orange-500 font-medium'
                  : ''
              }>
                {formatTime(remainingTime)}
              </span>
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => toast.info(
            <div>
              <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
              <div className="space-y-1 text-sm">
                {shortcuts.map((shortcut, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{shortcut.key}:</span>
                    <span>{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        >
          <Keyboard className="h-4 w-4" />
          Shortcuts
        </Button>
      </div>

      {/* Time warning alert */}
      {warningLevel === 'critical' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Warning:</strong> Less than 5 minutes remaining!
          </AlertDescription>
        </Alert>
      )}

      {/* Progress indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Question {questionNumber} of {session?.total_questions_available}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {currentQuestion.chapter}
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFlagQuestion}
              className={`flex items-center gap-2 ${userAnswer?.isFlagged ? 'text-yellow-600' : 'text-muted-foreground'}`}
            >
              <Flag className="h-4 w-4" />
              {userAnswer?.isFlagged ? 'Flagged (F)' : 'Flag (F)'}
            </Button>
          </div>
          
          <CardTitle className="text-lg leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Answer choices */}
          <RadioGroup 
            value={selectedAnswer || ''} 
            onValueChange={(value) => setSelectedAnswer(value as 'A' | 'B' | 'C' | 'D')}
            disabled={isSubmitted}
          >
            <div className="space-y-3">
              {[
                { key: 'A', text: currentQuestion.choice_a },
                { key: 'B', text: currentQuestion.choice_b },
                { key: 'C', text: currentQuestion.choice_c },
                { key: 'D', text: currentQuestion.choice_d },
              ].map((choice) => (
                <div 
                  key={choice.key}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                    isSubmitted
                      ? choice.key === currentQuestion.correct_answer
                        ? 'bg-green-50 border-green-200'
                        : choice.key === selectedAnswer
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50'
                      : 'hover:bg-accent'
                  }`}
                >
                  <RadioGroupItem 
                    value={choice.key} 
                    id={choice.key}
                    disabled={isSubmitted}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={choice.key} 
                      className="cursor-pointer leading-relaxed"
                    >
                      <span className="font-medium bg-muted px-1.5 py-0.5 rounded text-xs mr-3">
                        {choice.key}
                      </span> 
                      {choice.text}
                    </Label>
                  </div>
                  
                  {isSubmitted && choice.key === currentQuestion.correct_answer && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                  
                  {isSubmitted && choice.key === selectedAnswer && choice.key !== currentQuestion.correct_answer && (
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </RadioGroup>

          {/* Feedback */}
          {showFeedback && isSubmitted && (
            <Alert className={userAnswer?.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-start gap-3">
                {userAnswer?.isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-2">
                  <div className="font-medium">
                    {userAnswer?.isCorrect ? 'Correct!' : 'Incorrect'}
                  </div>
                  {!userAnswer?.isCorrect && (
                    <div className="text-sm">
                      The correct answer is <strong>{currentQuestion.correct_answer}</strong>
                    </div>
                  )}
                  {currentQuestion.explanation && (
                    <AlertDescription className="text-sm">
                      <strong>Explanation:</strong> {currentQuestion.explanation}
                    </AlertDescription>
                  )}
                </div>
              </div>
            </Alert>
          )}

          {/* Action buttons */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSkipQuestion}
                disabled={isSubmitted}
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Skip (S)
              </Button>
            </div>
            
            <div className="flex gap-2">
              {!isSubmitted ? (
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer || submitAnswer.isPending}
                >
                  Submit Answer (Enter)
                </Button>
              ) : (
                <Button onClick={handleContinue}>
                  Next Question (Space)
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Running stats */}
          {session && session.questions_answered > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Session Progress</span>
                <span>{session.questions_answered} answered</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}