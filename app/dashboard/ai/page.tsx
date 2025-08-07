"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Brain, RefreshCw, Clock, AlertTriangle, CheckCircle, Target, Calendar, TrendingUp, Lightbulb, Zap, ArrowRight, Timer, Flag, X, Sparkles, BarChart3, Users, Activity } from 'lucide-react';
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { LoaderOne } from "@/components/ui/loader";

interface TaskAnalysis {
  totalTasks: number;
  criticalTasks: number;
  urgentTasks: number;
  blockedTasks: number;
  estimatedTotalTime: number;
  keyInsights: string[];
  recommendations: string[];
}

interface ExecutionPhase {
  name: string;
  description: string;
  duration: string;
  taskIds: string[];
  reasoning: string;
}

interface ExecutionPlan {
  strategy: string;
  phases: ExecutionPhase[];
  riskFactors: string[];
  successMetrics: string[];
}

interface TimetableEntry {
  timeSlot: string;
  taskId: string;
  taskTitle: string;
  action: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string;
  preparationNeeded: string;
  expectedOutcome: string;
}

interface PriorityTask {
  taskId: string;
  taskTitle: string;
  reasoning: string;
}

interface PriorityMatrix {
  doFirst: PriorityTask[];
  schedule: PriorityTask[];
  delegate: PriorityTask[];
  eliminate: PriorityTask[];
}

interface AIAnalysisResponse {
  success: boolean;
  tasksAnalyzed: number;
  analysis: TaskAnalysis;
  executionPlan: ExecutionPlan;
  timetable: TimetableEntry[];
  priorityMatrix: PriorityMatrix;
  generatedAt: string;
  message: string;
}

function AIPageContent() {
  const [analysis, setAnalysis] = useState<TaskAnalysis | null>(null);
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(null);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [priorityMatrix, setPriorityMatrix] = useState<PriorityMatrix | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const aiLoadingStates = [
    { text: "Initializing AI analysis..." },
    { text: "Gathering task data..." },
    { text: "Analyzing productivity patterns..." },
    { text: "Calculating priority matrix..." },
    { text: "Generating smart suggestions..." },
    { text: "Optimizing task schedule..." },
    { text: "Creating personalized insights..." },
    { text: "AI analysis complete!" },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const analyzeTasksWithAI = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ai/analyze-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: AIAnalysisResponse = await response.json();

        if (data.success) {
          setAnalysis(data.analysis);
          setExecutionPlan(data.executionPlan);
          setTimetable(data.timetable || []);
          setPriorityMatrix(data.priorityMatrix);
          setLastAnalysis(data.generatedAt);

          if (data.tasksAnalyzed === 0) {
            alert("🎉 Great! You have no pending tasks. All your tasks are completed!");
          } else {
            alert(`✅ AI analysis complete!\n\nAnalyzed ${data.tasksAnalyzed} pending tasks and generated a comprehensive execution plan with prioritized timetable.`);
          }
        } else {
          console.error("API returned success=false:", data);
          alert(`❌ Analysis failed: ${data.message || 'Unknown error'}`);
        }
      } else {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        alert(`❌ Analysis failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("AI analysis failed:", error);
      alert("❌ Failed to analyze tasks. Please check your connection and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH': return <AlertTriangle className="h-4 w-4" />;
      case 'MEDIUM': return <Clock className="h-4 w-4" />;
      case 'LOW': return <CheckCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-8 text-white">

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Brain className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="font-bodoni text-4xl font-bold mb-2">AI Task Planner</h1>
                  <p className="text-indigo-100 text-lg">Intelligent execution plans and prioritization for your tasks</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={analyzeTasksWithAI}
                  disabled={isAnalyzing}
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                >
                  <Brain className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-pulse" : ""}`} />
                  {isAnalyzing ? "Analyzing..." : "Analyze Tasks"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Overview */}
        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0  bg-gradient-to-br from-blue-50 to-indigo-50 hover: transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-700">{analysis.totalTasks}</div>
                    <div className="text-blue-600 font-medium">Total Tasks</div>
                    <div className="text-blue-500 text-sm">Pending tasks analyzed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0  bg-gradient-to-br from-red-50 to-rose-50 hover: transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-700">{analysis.criticalTasks}</div>
                    <div className="text-red-600 font-medium">Critical Tasks</div>
                    <div className="text-red-500 text-sm">High priority & urgent</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0  bg-gradient-to-br from-orange-50 to-amber-50 hover: transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-700">{analysis.urgentTasks}</div>
                    <div className="text-orange-600 font-medium">Urgent Tasks</div>
                    <div className="text-orange-500 text-sm">Time-sensitive items</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0  bg-gradient-to-br from-purple-50 to-violet-50 hover: transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Timer className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-700">{Math.round(analysis.estimatedTotalTime / 60)}h</div>
                    <div className="text-purple-600 font-medium">Total Time</div>
                    <div className="text-purple-500 text-sm">Estimated duration</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Insights */}
        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 ">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Key Insights</CardTitle>
                    <CardDescription>AI-generated insights about your task portfolio</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.keyInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 ">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Recommendations</CardTitle>
                    <CardDescription>AI suggestions for improved productivity</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 leading-relaxed">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Execution Plan */}
        {executionPlan && (
          <Card className="border-0 ">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Execution Strategy</CardTitle>
                  <CardDescription>AI-generated execution plan for optimal task completion</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Overall Strategy
                  </h4>
                  <p className="text-blue-800 leading-relaxed">{executionPlan.strategy}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-6 text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-gray-600" />
                    Execution Phases
                  </h4>
                  <div className="space-y-4">
                    {executionPlan.phases.map((phase, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-6 hover: transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 px-3 py-1">
                            {phase.name}
                          </Badge>
                          <span className="text-sm text-gray-500 font-medium">{phase.duration}</span>
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">{phase.description}</p>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 italic">{phase.reasoning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                    <h4 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Risk Factors
                    </h4>
                    <ul className="space-y-2">
                      {executionPlan.riskFactors.map((risk, index) => (
                        <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                    <h4 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Success Metrics
                    </h4>
                    <ul className="space-y-2">
                      {executionPlan.successMetrics.map((metric, index) => (
                        <li key={index} className="text-sm text-green-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Priority Matrix */}
        {priorityMatrix && (
          <Card className="border-0 ">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Eisenhower Priority Matrix</CardTitle>
                  <CardDescription>Tasks categorized by urgency and importance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-red-200 rounded-xl p-6 bg-gradient-to-br from-red-50 to-rose-50">
                  <h4 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <Flag className="h-5 w-5" />
                    Do First (Urgent & Important)
                  </h4>
                  <div className="space-y-3">
                    {priorityMatrix.doFirst.map((task, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-red-200 ">
                        <p className="font-medium text-sm text-gray-900 mb-2">{task.taskTitle}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{task.reasoning}</p>
                      </div>
                    ))}
                    {priorityMatrix.doFirst.length === 0 && (
                      <p className="text-sm text-gray-500 italic text-center py-4">No urgent & important tasks</p>
                    )}
                  </div>
                </div>

                <div className="border-2 border-blue-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule (Important, Not Urgent)
                  </h4>
                  <div className="space-y-3">
                    {priorityMatrix.schedule.map((task, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-blue-200 ">
                        <p className="font-medium text-sm text-gray-900 mb-2">{task.taskTitle}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{task.reasoning}</p>
                      </div>
                    ))}
                    {priorityMatrix.schedule.length === 0 && (
                      <p className="text-sm text-gray-500 italic text-center py-4">No tasks to schedule</p>
                    )}
                  </div>
                </div>

                <div className="border-2 border-yellow-200 rounded-xl p-6 bg-gradient-to-br from-yellow-50 to-amber-50">
                  <h4 className="font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    Delegate (Urgent, Not Important)
                  </h4>
                  <div className="space-y-3">
                    {priorityMatrix.delegate.map((task, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-yellow-200 ">
                        <p className="font-medium text-sm text-gray-900 mb-2">{task.taskTitle}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{task.reasoning}</p>
                      </div>
                    ))}
                    {priorityMatrix.delegate.length === 0 && (
                      <p className="text-sm text-gray-500 italic text-center py-4">No tasks to delegate</p>
                    )}
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-slate-50">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <X className="h-5 w-5" />
                    Eliminate (Neither Urgent nor Important)
                  </h4>
                  <div className="space-y-3">
                    {priorityMatrix.eliminate.map((task, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 ">
                        <p className="font-medium text-sm text-gray-900 mb-2">{task.taskTitle}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{task.reasoning}</p>
                      </div>
                    ))}
                    {priorityMatrix.eliminate.length === 0 && (
                      <p className="text-sm text-gray-500 italic text-center py-4">No tasks to eliminate</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Structured Timetable */}
        {timetable.length > 0 && (
          <Card className="border-0 ">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">AI-Generated Timetable</CardTitle>
                  <CardDescription>Optimized schedule for maximum productivity</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {timetable.map((entry, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6 hover: transition-all duration-300">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                            {entry.timeSlot}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={`${getPriorityColor(entry.priority)} border flex items-center gap-1`}
                          >
                            {getPriorityIcon(entry.priority)}
                            {entry.priority}
                          </Badge>
                        </div>

                        <h4 className="font-semibold text-gray-900 text-lg mb-2">{entry.taskTitle}</h4>
                        <p className="text-sm text-gray-700 mb-4 leading-relaxed">{entry.action}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <strong className="text-blue-800">Why now:</strong>
                            <p className="text-blue-700 mt-1">{entry.reasoning}</p>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <strong className="text-purple-800">Preparation:</strong>
                            <p className="text-purple-700 mt-1">{entry.preparationNeeded}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <strong className="text-green-800">Expected outcome:</strong>
                          <p className="text-green-700 mt-1">{entry.expectedOutcome}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Getting Started */}
        {!analysis && (
          <Card className="border-0 ">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">AI Task Planning Assistant</CardTitle>
                  <CardDescription>Get intelligent execution plans for your pending tasks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <div className="p-4 bg-purple-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Brain className="h-10 w-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Ready to optimize your productivity?
                </h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Click "Analyze Tasks" to get AI-powered insights, execution plans, and structured timetables
                  for all your pending tasks. The AI will analyze priorities, dependencies, and optimal scheduling.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                  <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <Target className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2 text-blue-900">Smart Prioritization</h4>
                    <p className="text-sm text-blue-700">AI analyzes urgency, importance, and dependencies</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                    <Calendar className="h-10 w-10 text-green-500 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2 text-green-900">Structured Timetable</h4>
                    <p className="text-sm text-green-700">Optimized schedule with time slots and actions</p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                    <Zap className="h-10 w-10 text-purple-500 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2 text-purple-900">Execution Strategy</h4>
                    <p className="text-sm text-purple-700">Phase-based approach with success metrics</p>
                  </div>
                </div>

                <Button onClick={analyzeTasksWithAI} disabled={isAnalyzing} className="bg-blue-600 hover:bg-purple-700 text-white px-8 py-3">
                  <Brain className={`h-5 w-5 mr-2 ${isAnalyzing ? "animate-pulse" : ""}`} />
                  {isAnalyzing ? "Analyzing..." : "Start AI Analysis"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last Analysis Info */}
        {lastAnalysis && (
          <div className="text-center text-sm text-gray-500">
            Last analysis: {new Date(lastAnalysis).toLocaleString()}
          </div>
        )}

        {/* Multi-Step Loader */}
        <MultiStepLoader
          loadingStates={aiLoadingStates}
          loading={isAnalyzing}
          duration={1500}
          loop={false}
        />
      </div>
    </DashboardLayout>
  );
}

export default function AIPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoaderOne />
        </div>
      </DashboardLayout>
    );
  }

  return <AIPageContent />;
}
