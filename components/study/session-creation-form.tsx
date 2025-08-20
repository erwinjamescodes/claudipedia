'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useChapters } from '@/lib/hooks/use-questions'
import { useCreateSession } from '@/lib/hooks/use-sessions'
import { useSessionStore } from '@/lib/stores/session-store'
import type { StudyMode } from '@/lib/stores/session-store'
import { Loader2, BookOpen, Clock, Shuffle } from 'lucide-react'
import { toast } from 'sonner'

const sessionSchema = z.object({
  name: z.string().min(1, 'Session name is required'),
  mode: z.enum(['random', 'by_chapter', 'mixed', 'review', 'mock_exam']),
  selectedChapters: z.array(z.string()).optional(),
  timeLimitMinutes: z.number().min(30).max(300).optional(),
  questionCount: z.number().min(10).max(200).optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleChoices: z.boolean().optional(),
})

type SessionFormData = z.infer<typeof sessionSchema>

const studyModes: { value: StudyMode; label: string; description: string }[] = [
  {
    value: 'random',
    label: 'Random',
    description: 'Questions from all chapters in random order'
  },
  {
    value: 'by_chapter',
    label: 'By Chapter',
    description: 'Focus on specific chapters'
  },
  {
    value: 'mixed',
    label: 'Mixed',
    description: 'Mix of selected chapters'
  },
  {
    value: 'review',
    label: 'Review',
    description: 'Review previously answered questions'
  },
  {
    value: 'mock_exam',
    label: 'Mock Exam',
    description: 'Timed practice exam simulation'
  },
]

export function SessionCreationForm() {
  const router = useRouter()
  const { data: chapters, isLoading: chaptersLoading } = useChapters()
  const createSession = useCreateSession()
  const { setActiveSession } = useSessionStore()
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [questionCount, setQuestionCount] = useState(50)
  const [timeLimit, setTimeLimit] = useState(120)

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      name: 'Study Session',
      mode: 'random',
      selectedChapters: [],
      timeLimitMinutes: 120,
      questionCount: 50,
      shuffleQuestions: true,
      shuffleChoices: false,
    },
  })

  const watchedMode = form.watch('mode')
  const showChapterSelection = watchedMode === 'by_chapter' || watchedMode === 'mixed'
  const showMockExamSettings = watchedMode === 'mock_exam'
  const showReviewSettings = watchedMode === 'review'

  const onSubmit = async (data: SessionFormData) => {
    try {
      const sessionData = {
        name: data.name,
        mode: data.mode,
        selectedChapters: showChapterSelection ? selectedChapters : [],
        ...(showMockExamSettings && {
          mockExamSettings: {
            timeLimitMinutes: timeLimit,
            questionCount: questionCount,
            shuffleQuestions: data.shuffleQuestions || true,
            shuffleChoices: data.shuffleChoices || false,
          }
        })
      }

      const session = await createSession.mutateAsync(sessionData)
      
      // Set as active session
      setActiveSession({
        id: session.id,
        name: session.name,
        mode: session.mode,
        totalQuestions: session.total_questions_available,
        questionsAnswered: session.questions_answered,
        currentQuestionIndex: 0,
        startTime: new Date(),
        isActive: true,
      })

      toast.success('Study session created successfully!')
      router.push(`/study/${session.id}`)
    } catch (error) {
      toast.error('Failed to create session. Please try again.')
      console.error('Session creation error:', error)
    }
  }

  const handleChapterToggle = (chapterName: string, checked: boolean) => {
    if (checked) {
      setSelectedChapters(prev => [...prev, chapterName])
    } else {
      setSelectedChapters(prev => prev.filter(c => c !== chapterName))
    }
  }

  const estimatedQuestions = showChapterSelection 
    ? chapters?.filter(c => selectedChapters.includes(c.name)).reduce((sum, c) => sum + c.questionCount, 0) || 0
    : chapters?.reduce((sum, c) => sum + c.questionCount, 0) || 0

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Session Name */}
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>Basic information about your study session</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter session name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Study Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Study Mode</CardTitle>
            <CardDescription>Choose how you want to study</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 gap-4"
                    >
                      {studyModes.map((mode) => (
                        <div key={mode.value} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent">
                          <RadioGroupItem value={mode.value} id={mode.value} />
                          <div className="flex-1">
                            <Label htmlFor={mode.value} className="font-medium cursor-pointer">
                              {mode.label}
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {mode.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Chapter Selection */}
        {showChapterSelection && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Chapter Selection
              </CardTitle>
              <CardDescription>
                Select the chapters you want to study
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chaptersLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                  {chapters?.map((chapter) => (
                    <div key={chapter.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={chapter.name}
                          checked={selectedChapters.includes(chapter.name)}
                          onCheckedChange={(checked) => 
                            handleChapterToggle(chapter.name, checked as boolean)
                          }
                        />
                        <Label htmlFor={chapter.name} className="cursor-pointer">
                          {chapter.name}
                        </Label>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {chapter.questionCount} questions
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mock Exam Settings */}
        {showMockExamSettings && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Mock Exam Settings
              </CardTitle>
              <CardDescription>Configure your timed practice exam</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Time Limit: {timeLimit} minutes</Label>
                  <Slider
                    value={[timeLimit]}
                    onValueChange={([value]) => setTimeLimit(value)}
                    max={300}
                    min={30}
                    step={15}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>30 min</span>
                    <span>300 min</span>
                  </div>
                </div>

                <div>
                  <Label className="text-base">Questions: {questionCount}</Label>
                  <Slider
                    value={[questionCount]}
                    onValueChange={([value]) => setQuestionCount(value)}
                    max={200}
                    min={10}
                    step={10}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>10</span>
                    <span>200</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="shuffleQuestions"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Shuffle Questions</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Randomize question order
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shuffleChoices"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Shuffle Answer Choices</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Randomize A, B, C, D options
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Preview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Questions Available</h3>
                <p className="text-sm text-muted-foreground">
                  Based on your current selection
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {showMockExamSettings ? Math.min(questionCount, estimatedQuestions) : estimatedQuestions}
                </div>
                <p className="text-sm text-muted-foreground">questions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/protected')}
            disabled={createSession.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createSession.isPending || estimatedQuestions === 0}
            className="flex-1"
          >
            {createSession.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Session...
              </>
            ) : (
              'Start Session'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}