"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  TrendingUp,
  Target,
  Loader2,
  BookOpen,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";
import { CHAPTERS } from "@/lib/constants";

interface AnalyticsPageProps {
  params: Promise<{ id: string }>;
}

interface AnalyticsData {
  session: {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    totalTimeSeconds: number;
    averageTimePerQuestion: number;
    questionsRemaining: number;
    completionPercentage: number;
    recentAccuracy: number;
    isActive: boolean;
    startedAt: string;
    completedAt: string | null;
  };
  chapterPerformance: Array<{
    chapter: string;
    accuracy: number;
    totalQuestions: number;
    correctAnswers: number;
    averageTime: number;
  }>;
  progressOverTime: Array<{
    questionNumber: number;
    accuracy: number;
    timestamp: string;
    isCorrect: boolean;
  }>;
  timeDistribution: Record<string, number>;
  rawProgressData: number;
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const sessionId = parseInt(id);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/arcade/sessions/${sessionId}/analytics`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchAnalytics();
    }
  }, [sessionId]);

  const handleBackToArcade = () => {
    router.push(`/arcade`);
  };

  const getChapterDisplayName = (chapter: string) => {
    return CHAPTERS[chapter as keyof typeof CHAPTERS]?.name || chapter;
  };

  const getChapterColor = (chapter: string) => {
    return CHAPTERS[chapter as keyof typeof CHAPTERS]?.color || "bg-gray-500";
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center space-y-4 mt-48">
          <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h2 className="text-xl font-semibold">Error Loading Analytics</h2>
              <p className="text-muted-foreground">
                {error || "Unable to load analytics data"}
              </p>
            </div>
            <Button onClick={handleBackToArcade}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { session, chapterPerformance, progressOverTime } = analyticsData;

  // Prepare data for charts
  const chapterChartData = chapterPerformance.map((chapter) => ({
    name: getChapterDisplayName(chapter.chapter),
    accuracy: chapter.accuracy,
    questions: chapter.totalQuestions,
    correctAnswers: chapter.correctAnswers,
    color: getChapterColor(chapter.chapter).replace("bg-", "#"),
    fill: getChapterColor(chapter.chapter)
      .replace("bg-blue-500", "#3b82f6")
      .replace("bg-green-500", "#22c55e")
      .replace("bg-purple-500", "#a855f7")
      .replace("bg-orange-500", "#f97316")
      .replace("bg-red-500", "#ef4444")
      .replace("bg-yellow-500", "#eab308")
      .replace("bg-pink-500", "#ec4899")
      .replace("bg-indigo-500", "#6366f1")
      .replace("bg-teal-500", "#14b8a6"),
  }));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mt-8">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleBackToArcade}
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

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Overall Accuracy
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {session.accuracy}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Questions Completed
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {session.totalQuestions}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Recent Performance
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {session.recentAccuracy}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Chapter Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance Charts</TabsTrigger>
          <TabsTrigger value="insights">Insights & Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Chapter Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-green-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {chapterPerformance.filter((c) => c.accuracy >= 80).length}
                </div>
                <div className="text-sm font-medium text-green-700 mb-1">
                  Strong Performance
                </div>
                <div className="text-xs text-muted-foreground">
                  ≥80% accuracy
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {
                    chapterPerformance.filter(
                      (c) => c.accuracy >= 60 && c.accuracy < 80
                    ).length
                  }
                </div>
                <div className="text-sm font-medium text-yellow-700 mb-1">
                  Moderate Performance
                </div>
                <div className="text-xs text-muted-foreground">
                  60-79% accuracy
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {chapterPerformance.filter((c) => c.accuracy < 60).length}
                </div>
                <div className="text-sm font-medium text-red-700 mb-1">
                  Needs Improvement
                </div>
                <div className="text-xs text-muted-foreground">
                  &lt;60% accuracy
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Chapters Detailed View */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                All Chapter Performance (Ranked by Accuracy)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {chapterPerformance
                  .sort((a, b) => b.accuracy - a.accuracy)
                  .map((chapter, index) => (
                    <div
                      key={chapter.chapter}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-sm font-bold text-gray-700">
                          #{index + 1}
                        </div>
                        <div
                          className={`w-4 h-4 rounded ${getChapterColor(
                            chapter.chapter
                          )}`}
                        />
                        <div>
                          <div className="font-medium text-sm">
                            {getChapterDisplayName(chapter.chapter)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {chapter.totalQuestions} questions •{" "}
                            {chapter.correctAnswers} correct
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              chapter.accuracy >= 80
                                ? "text-green-600"
                                : chapter.accuracy >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {chapter.accuracy}%
                          </div>
                          <div className="w-20">
                            <Progress
                              value={chapter.accuracy}
                              className="h-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chapter Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chapterChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      interval={0}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 rounded-lg shadow-lg border">
                              <p className="font-semibold text-sm">{label}</p>
                              <p className="text-blue-600">
                                Accuracy: {data.accuracy}%
                              </p>
                              <p className="text-gray-600">
                                Questions: {data.questions}
                              </p>
                              <p className="text-green-600">
                                Correct: {data.correctAnswers}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="accuracy">
                      {chapterChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chapter Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Chapter Summary Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {chapterPerformance.filter((c) => c.accuracy >= 80).length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Strong Chapters (≥80%)
                  </p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {
                      chapterPerformance.filter(
                        (c) => c.accuracy >= 60 && c.accuracy < 80
                      ).length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Moderate Chapters (60-79%)
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {chapterPerformance.filter((c) => c.accuracy < 60).length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Needs Work (&lt;60%)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Chapter Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Chapter Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chapterPerformance
                  .sort((a, b) => b.accuracy - a.accuracy)
                  .map((chapter) => (
                    <div
                      key={chapter.chapter}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded ${getChapterColor(
                              chapter.chapter
                            )}`}
                          />
                          <div>
                            <h3 className="font-medium text-sm">
                              {getChapterDisplayName(chapter.chapter)}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Chapter {chapter.chapter.split("_")[0]}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xl font-bold ${
                              chapter.accuracy >= 80
                                ? "text-green-600"
                                : chapter.accuracy >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {chapter.accuracy}%
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-blue-600">
                            {chapter.totalQuestions}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Total Questions
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-green-600">
                            {chapter.correctAnswers}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Correct Answers
                          </p>
                        </div>
                      </div>

                      <Progress value={chapter.accuracy} className="h-2" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chapterPerformance
                    .filter((chapter) => chapter.accuracy >= 70)
                    .sort((a, b) => b.accuracy - a.accuracy)
                    .slice(0, 3)
                    .map((chapter) => (
                      <div
                        key={chapter.chapter}
                        className="flex items-center gap-3 p-2 bg-green-50 rounded-lg"
                      >
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-sm">
                            {getChapterDisplayName(chapter.chapter)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {chapter.accuracy}% accuracy
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chapterPerformance
                    .filter((chapter) => chapter.accuracy < 70)
                    .sort((a, b) => a.accuracy - b.accuracy)
                    .slice(0, 3)
                    .map((chapter) => (
                      <div
                        key={chapter.chapter}
                        className="flex items-center gap-3 p-2 bg-red-50 rounded-lg"
                      >
                        <XCircle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium text-sm">
                            {getChapterDisplayName(chapter.chapter)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {chapter.accuracy}% accuracy
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-600">Study Focus</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Review chapters with &lt;70% accuracy</li>
                    <li>• Practice more questions in weak areas</li>
                    <li>• Focus on understanding concepts vs memorization</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-orange-600">
                    Study Strategy
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>
                      • Complete {session.questionsRemaining} remaining
                      questions
                    </li>
                    <li>• Current overall accuracy: {session.accuracy}%</li>
                    <li>• Aim to maintain or improve current performance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
