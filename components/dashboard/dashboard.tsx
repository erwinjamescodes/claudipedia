'use client'

import { useSessions } from '@/lib/hooks/use-sessions'
import { useSessionStore } from '@/lib/stores/session-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Play, Plus, RotateCcw, BookOpen, Clock, Target, Gamepad2 } from 'lucide-react'
import Link from 'next/link'

export function Dashboard() {
  const { data: sessions, isLoading } = useSessions()
  const { activeSession, setActiveSession } = useSessionStore()

  // Find active session from the list
  const currentActiveSession = sessions?.find(s => s.is_active && s.questions_answered < s.total_questions_available)

  // Calculate overall statistics
  const completedSessions = sessions?.filter(s => s.questions_answered === s.total_questions_available) || []
  const totalQuestions = sessions?.reduce((sum, s) => sum + s.questions_answered, 0) || 0
  
  const handleContinueSession = (session: any) => {
    setActiveSession({
      id: session.id,
      name: session.name,
      mode: session.mode,
      totalQuestions: session.total_questions_available,
      questionsAnswered: session.questions_answered,
      currentQuestionIndex: session.questions_answered,
      startTime: new Date(session.created_at),
      isActive: true,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-8 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Session Display */}
      {currentActiveSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-500" />
              Active Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{currentActiveSession.name}</h3>
                <Badge variant="secondary">{currentActiveSession.mode.replace('_', ' ')}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {currentActiveSession.questions_answered} of {currentActiveSession.total_questions_available} questions answered
              </div>
              <Progress 
                value={(currentActiveSession.questions_answered / currentActiveSession.total_questions_available) * 100} 
                className="h-2"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                asChild
                onClick={() => handleContinueSession(currentActiveSession)}
              >
                <Link href={`/study/${currentActiveSession.id}`}>
                  Continue Session
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/review">Review Incorrect</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button 
          asChild
          size="lg" 
          className="h-20 flex flex-col gap-2 bg-gradient-to-r from-primary to-primary/80"
        >
          <Link href="/arcade">
            <Gamepad2 className="h-6 w-6" />
            Arcade Mode
          </Link>
        </Button>
        
        <Button 
          asChild
          size="lg" 
          className="h-20 flex flex-col gap-2"
          variant="outline"
        >
          <Link href="/study/create">
            <Plus className="h-6 w-6" />
            New Session
          </Link>
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          className="h-20 flex flex-col gap-2"
          asChild
        >
          <Link href="/review">
            <RotateCcw className="h-6 w-6" />
            Review Questions
          </Link>
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          className="h-20 flex flex-col gap-2"
          asChild
        >
          <Link href="/statistics">
            <Target className="h-6 w-6" />
            View Statistics
          </Link>
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              Across all sessions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Finished sessions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions?.filter(s => s.is_active && s.questions_answered < s.total_questions_available).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Created sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Session History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>
            Your study session history and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions && sessions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session Name</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.slice(0, 5).map((session) => {
                  const isCompleted = session.questions_answered === session.total_questions_available
                  const progress = session.total_questions_available > 0 
                    ? Math.round((session.questions_answered / session.total_questions_available) * 100)
                    : 0

                  return (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {session.mode.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-2 w-20" />
                          <span className="text-sm text-muted-foreground">
                            {session.questions_answered}/{session.total_questions_available}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isCompleted ? "default" : "secondary"}>
                          {isCompleted ? "Completed" : "In Progress"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(session.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isCompleted ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            asChild
                            onClick={() => handleContinueSession(session)}
                          >
                            <Link href={`/study/${session.id}`}>
                              Continue
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/study/${session.id}/summary`}>
                              Review
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No sessions yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first study session
              </p>
              <Button asChild>
                <Link href="/study/create">Create Session</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}