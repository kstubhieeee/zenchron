"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { 
  Brain, 
  RefreshCw, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Target, 
  Calendar,
  TrendingUp,
  Lightbulb,
  Zap,
  ArrowRight,
  Timer,
  Flag,
  X
} from "lucide-react";

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
        
        console.log("AI Analysis Response:", data); // Debug log
        
        // Check if we have valid data
        if (data.success) {
          setAnalysis(data.analysis);
          setExecutionPlan(data.executionPlan);
          setTimetable(data.timetable || []);
          setPriorityMatrix(data.priorityMatrix);
          setLastAnalysis(data.generatedAt);
          
          if (data.tasksAnalyzed === 0) {
            alert("🎉 Great! You have no pending tasks. All your tasks are completed!");
          } else {
            console.log("Analysis data:", {
              analysis: data.analysis,
              executionPlan: data.executionPlan,
              timetable: data.timetable,
              priorityMatrix: data.priorityMatrix
            });
            
            // Force a re-render by updating state in the next tick
            setTimeout(() => {
              console.log("State after update:", {
                analysis,
                executionPlan,
                timetable,
                priorityMatrix
              });
            }, 100);
            
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

  const testWithMockData = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ai/test-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: AIAnalysisResponse = await response.json();
        
        console.log("Mock Analysis Response:", data); // Debug log
        
        setAnalysis(data.analysis);
        setExecutionPlan(data.executionPlan);
        setTimetable(data.timetable || []);
        setPriorityMatrix(data.priorityMatrix);
        setLastAnalysis(data.generatedAt);
        
        alert(`✅ Mock analysis complete!\n\nTesting with ${data.tasksAnalyzed} tasks. Check if the UI displays correctly.`);
      } else {
        const errorData = await response.json();
        alert(`❌ Mock test failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Mock test failed:", error);
      alert("❌ Mock test failed. Check console for details.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const setTestData = () => {
    console.log("Setting test data directly...");
    
    setAnalysis({
      totalTasks: 5,
      criticalTasks: 2,
      urgentTasks: 3,
      blockedTasks: 1,
      estimatedTotalTime: 300,
      keyInsights: [
        "You have a good balance of high and medium priority tasks",
        "Most tasks have reasonable time estimates",
        "Consider grouping similar tasks together"
      ],
      recommendations: [
        "Start with critical tasks first",
        "Block time for deep work",
        "Set up calendar reminders"
      ]
    });

    setExecutionPlan({
      strategy: "Focus on high-priority tasks first, then batch similar work types together.",
      phases: [
        {
          name: "Phase 1: Critical Tasks",
          description: "Handle urgent and important tasks immediately",
          duration: "2-3 hours",
          taskIds: ["1", "2"],
          reasoning: "These tasks have the highest impact"
        }
      ],
      riskFactors: ["Task dependencies", "Time constraints"],
      successMetrics: ["Complete critical tasks", "Make progress on remaining items"]
    });

    setTimetable([
      {
        timeSlot: "9:00 AM - 11:00 AM",
        taskId: "1",
        taskTitle: "Complete project proposal",
        action: "Write and review project proposal document",
        priority: "HIGH" as const,
        reasoning: "High energy morning hours optimal for creative work",
        preparationNeeded: "Gather requirements and templates",
        expectedOutcome: "Complete draft of project proposal"
      },
      {
        timeSlot: "11:00 AM - 12:00 PM",
        taskId: "2",
        taskTitle: "Review client feedback",
        action: "Analyze and respond to client feedback",
        priority: "MEDIUM" as const,
        reasoning: "Good time for analytical work",
        preparationNeeded: "Open client feedback document",
        expectedOutcome: "Action plan for addressing feedback"
      }
    ]);

    setPriorityMatrix({
      doFirst: [
        {
          taskId: "1",
          taskTitle: "Complete project proposal",
          reasoning: "High priority with tight deadline"
        }
      ],
      schedule: [
        {
          taskId: "2",
          taskTitle: "Review client feedback",
          reasoning: "Important but can be scheduled"
        }
      ],
      delegate: [],
      eliminate: []
    });

    setLastAnalysis(new Date().toISOString());
    
    console.log("Test data set successfully!");
    alert("✅ Test data set! Check if the UI displays correctly now.");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Task Planner</h1>
            <p className="text-gray-600">Intelligent execution plans and prioritization for your pending tasks</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={analyzeTasksWithAI} 
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <Brain className={`h-4 w-4 ${isAnalyzing ? "animate-pulse" : ""}`} />
              {isAnalyzing ? "Analyzing..." : "Analyze Tasks"}
            </Button>
            
          </div>
        </div>

        {/* Analysis Overview */}
        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Total Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.totalTasks}
                </div>
                <p className="text-sm text-gray-500">Pending tasks analyzed</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Critical Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {analysis.criticalTasks}
                </div>
                <p className="text-sm text-gray-500">High priority & urgent</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Urgent Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {analysis.urgentTasks}
                </div>
                <p className="text-sm text-gray-500">Time-sensitive items</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Timer className="h-5 w-5 text-purple-600" />
                  Total Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(analysis.estimatedTotalTime / 60)}h
                </div>
                <p className="text-sm text-gray-500">Estimated duration</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Insights */}
        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Key Insights
                </CardTitle>
                <CardDescription>
                  AI-generated insights about your task portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.keyInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Recommendations
                </CardTitle>
                <CardDescription>
                  AI suggestions for improved productivity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Execution Plan */}
        {executionPlan && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Execution Strategy
              </CardTitle>
              <CardDescription>
                AI-generated execution plan for optimal task completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Overall Strategy</h4>
                  <p className="text-blue-800">{executionPlan.strategy}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Execution Phases</h4>
                  <div className="space-y-4">
                    {executionPlan.phases.map((phase, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            {phase.name}
                          </Badge>
                          <span className="text-sm text-gray-500">{phase.duration}</span>
                        </div>
                        <p className="text-gray-700 mb-2">{phase.description}</p>
                        <p className="text-sm text-gray-600 italic">{phase.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">Risk Factors</h4>
                    <ul className="space-y-1">
                      {executionPlan.riskFactors.map((risk, index) => (
                        <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Success Metrics</h4>
                    <ul className="space-y-1">
                      {executionPlan.successMetrics.map((metric, index) => (
                        <li key={index} className="text-sm text-green-600 flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Eisenhower Priority Matrix
              </CardTitle>
              <CardDescription>
                Tasks categorized by urgency and importance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Do First (Urgent & Important)
                  </h4>
                  <div className="space-y-2">
                    {priorityMatrix.doFirst.map((task, index) => (
                      <div key={index} className="bg-white p-2 rounded border">
                        <p className="font-medium text-sm">{task.taskTitle}</p>
                        <p className="text-xs text-gray-600">{task.reasoning}</p>
                      </div>
                    ))}
                    {priorityMatrix.doFirst.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No urgent & important tasks</p>
                    )}
                  </div>
                </div>

                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule (Important, Not Urgent)
                  </h4>
                  <div className="space-y-2">
                    {priorityMatrix.schedule.map((task, index) => (
                      <div key={index} className="bg-white p-2 rounded border">
                        <p className="font-medium text-sm">{task.taskTitle}</p>
                        <p className="text-xs text-gray-600">{task.reasoning}</p>
                      </div>
                    ))}
                    {priorityMatrix.schedule.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No tasks to schedule</p>
                    )}
                  </div>
                </div>

                <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Delegate (Urgent, Not Important)
                  </h4>
                  <div className="space-y-2">
                    {priorityMatrix.delegate.map((task, index) => (
                      <div key={index} className="bg-white p-2 rounded border">
                        <p className="font-medium text-sm">{task.taskTitle}</p>
                        <p className="text-xs text-gray-600">{task.reasoning}</p>
                      </div>
                    ))}
                    {priorityMatrix.delegate.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No tasks to delegate</p>
                    )}
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Eliminate (Neither Urgent nor Important)
                  </h4>
                  <div className="space-y-2">
                    {priorityMatrix.eliminate.map((task, index) => (
                      <div key={index} className="bg-white p-2 rounded border">
                        <p className="font-medium text-sm">{task.taskTitle}</p>
                        <p className="text-xs text-gray-600">{task.reasoning}</p>
                      </div>
                    ))}
                    {priorityMatrix.eliminate.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No tasks to eliminate</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Structured Timetable */}
        {timetable.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                AI-Generated Timetable
              </CardTitle>
              <CardDescription>
                Optimized schedule for maximum productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timetable.map((entry, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {entry.timeSlot}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={`${getPriorityColor(entry.priority)} flex items-center gap-1`}
                          >
                            {getPriorityIcon(entry.priority)}
                            {entry.priority}
                          </Badge>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-1">{entry.taskTitle}</h4>
                        <p className="text-sm text-gray-700 mb-2">{entry.action}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                          <div>
                            <strong>Why now:</strong> {entry.reasoning}
                          </div>
                          <div>
                            <strong>Preparation:</strong> {entry.preparationNeeded}
                          </div>
                        </div>
                        
                        <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-800">
                          <strong>Expected outcome:</strong> {entry.expectedOutcome}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Task Planning Assistant
              </CardTitle>
              <CardDescription>
                Get intelligent execution plans for your pending tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to optimize your productivity?
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Click "Analyze Tasks" to get AI-powered insights, execution plans, and structured timetables 
                  for all your pending tasks. The AI will analyze priorities, dependencies, and optimal scheduling.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  <div className="text-center p-4">
                    <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="font-medium mb-1">Smart Prioritization</h4>
                    <p className="text-sm text-gray-600">AI analyzes urgency, importance, and dependencies</p>
                  </div>
                  <div className="text-center p-4">
                    <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-medium mb-1">Structured Timetable</h4>
                    <p className="text-sm text-gray-600">Optimized schedule with time slots and actions</p>
                  </div>
                  <div className="text-center p-4">
                    <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <h4 className="font-medium mb-1">Execution Strategy</h4>
                    <p className="text-sm text-gray-600">Phase-based approach with success metrics</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Info - Remove this after fixing */}
       

        {/* Last Analysis Info */}
        {lastAnalysis && (
          <div className="text-center text-sm text-gray-500">
            Last analysis: {new Date(lastAnalysis).toLocaleString()}
          </div>
        )}
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
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Task Planner</h1>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return <AIPageContent />;
}