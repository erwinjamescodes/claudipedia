'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSession } from '@/lib/hooks/use-sessions'
import { useSessionProgress } from '@/lib/hooks/use-questions'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  BookOpen,
  Flag,
  ArrowLeft,
  RotateCcw,
  Plus,
  Trophy,
  TrendingUp
} from 'lucide-react'

interface SessionSummaryProps {
  sessionId: number
}

export function SessionSummary({ sessionId }: SessionSummaryProps) {
  const router = useRouter()
  const { data: session } = useSession(sessionId)
  const { data: progress } = useSessionProgress(sessionId)

  if (!session || !progress) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const correctAnswers = progress.filter(p => p.is_correct).length
  const totalAnswered = progress.length
  const incorrectAnswers = totalAnswered - correctAnswers
  const flaggedQuestions = progress.filter(p => p.is_flagged).length
  const accuracyRate = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0
  const averageTime = progress.length > 0 ? Math.round(progress.reduce((sum, p) => sum + (p.time_spent || 0), 0) / progress.length) : 0
  const totalTimeSpent = progress.reduce((sum, p) => sum + (p.time_spent || 0), 0)

  // Group by chapter
  const chapterStats = progress.reduce((acc, p) => {
    const chapter = p.questions?.chapter || 'Unknown'
    if (!acc[chapter]) {
      acc[chapter] = { total: 0, correct: 0, incorrect: 0, flagged: 0, totalTime: 0 }
    }
    acc[chapter].total += 1
    if (p.is_correct) acc[chapter].correct += 1
    else acc[chapter].incorrect += 1
    if (p.is_flagged) acc[chapter].flagged += 1
    acc[chapter].totalTime += p.time_spent || 0
    return acc
  }, {} as Record<string, { total: number, correct: number, incorrect: number, flagged: number, totalTime: number }>)

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getPerformanceBadge = () => {
    if (accuracyRate >= 90) return { label: 'Excellent', variant: 'default' as const, color: 'text-green-600' }
    if (accuracyRate >= 80) return { label: 'Good', variant: 'secondary' as const, color: 'text-blue-600' }
    if (accuracyRate >= 70) return { label: 'Fair', variant: 'outline' as const, color: 'text-orange-600' }
    return { label: 'Needs Improvement', variant: 'destructive' as const, color: 'text-red-600' }
  }

  const performanceBadge = getPerformanceBadge()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/protected')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-lg font-semibold">Session Complete!</span>
        </div>
      </div>

      {/* Session info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {session.name}
                <Badge variant="secondary">
                  {session.mode.replace('_', ' ')}
                </Badge>
              </CardTitle>
              <CardDescription>
                Completed on {new Date().toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge {...performanceBadge}>
              {performanceBadge.label}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Key metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${performanceBadge.color}`}>
              {correctAnswers}/{totalAnswered}
            </div>
            <p className="text-xs text-muted-foreground">
              {accuracyRate}% accuracy
            </p>
            <Progress value={accuracyRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalTimeSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatTime(averageTime)} per question
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnswered}</div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {correctAnswers} correct
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-500" />
                {incorrectAnswers} incorrect
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Questions</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{flaggedQuestions}</div>
            <p className="text-xs text-muted-foreground">
              For review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Tabs defaultValue="chapter-breakdown" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chapter-breakdown">Chapter Breakdown</TabsTrigger>
          <TabsTrigger value="question-review">Question Review</TabsTrigger>
        </TabsList>

        <TabsContent value="chapter-breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Chapter</CardTitle>
              <CardDescription>
                See how you performed in each topic area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chapter</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Avg Time</TableHead>
                    <TableHead>Flagged</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(chapterStats).map(([chapter, stats]) => {
                    const chapterAccuracy = Math.round((stats.correct / stats.total) * 100)
                    const avgTime = Math.round(stats.totalTime / stats.total)
                    return (
                      <TableRow key={chapter}>
                        <TableCell className="font-medium">{chapter}</TableCell>
                        <TableCell>{stats.total}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={
                              chapterAccuracy >= 80 
                                ? 'text-green-600' 
                                : chapterAccuracy >= 70 
                                ? 'text-orange-600' 
                                : 'text-red-600'
                            }>
                              {chapterAccuracy}%
                            </span>
                            <Progress value={chapterAccuracy} className="h-1 w-16" />
                          </div>
                        </TableCell>
                        <TableCell>{formatTime(avgTime)}</TableCell>
                        <TableCell>
                          {stats.flagged > 0 && (
                            <Badge variant="outline" className="text-yellow-600">
                              {stats.flagged}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="question-review" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Filter to show all questions
              }}
            >
              All ({totalAnswered})
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Filter to show incorrect only
              }}
            >
              Incorrect ({incorrectAnswers})
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Filter to show flagged only
              }}
            >
              Flagged ({flaggedQuestions})
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Chapter</TableHead>
                    <TableHead>Your Answer</TableHead>
                    <TableHead>Correct</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {progress.map((p, index) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="text-sm">
                        {p.questions?.chapter || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={p.is_correct ? "default" : "destructive"}
                          className="w-8 h-8 rounded-full flex items-center justify-center p-0"
                        >
                          {p.selected_answer}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className="w-8 h-8 rounded-full flex items-center justify-center p-0"
                        >
                          {/* We'd need to get this from questions table */}
                          ?
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTime(p.time_spent || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {p.is_correct ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          {p.is_flagged && (
                            <Flag className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action buttons */}
      <div className="flex gap-4 justify-center pt-6">
        <Button onClick={() => router.push('/study/create')}>
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Button>
        <Button variant="outline" onClick={() => {
          // TODO: Implement review incorrect questions
          router.push('/review')
        }}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Review Incorrect
        </Button>
        <Button variant="outline" onClick={() => router.push('/statistics')}>
          <TrendingUp className="h-4 w-4 mr-2" />
          View Statistics
        </Button>
      </div>
    </div>
  )
}