import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({
        error: "Not authenticated"
      }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        error: "Gemini API key not configured"
      }, { status: 500 });
    }

    // Get ALL tasks (including completed ones for better context)
    const client = await clientPromise;
    const db = client.db("zenchron");
    const tasksCollection = db.collection("tasks");

    // Fetch all tasks for comprehensive analysis
    const allTasks = await tasksCollection.find({
      userId: session.user.email
    }).sort({ priority: -1, dueDate: 1, createdAt: 1 }).toArray();

    // Separate pending and completed tasks (handle both uppercase and lowercase)
    const pendingTasks = allTasks.filter(task =>
      ['TODO', 'IN_PROGRESS', 'WAITING', 'todo', 'in_progress', 'waiting'].includes(task.status)
    );

    const completedTasks = allTasks.filter(task =>
      ['DONE', 'done', 'completed'].includes(task.status)
    ).slice(-10); // Last 10 completed tasks for context

    if (pendingTasks.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending tasks found",
        analysis: null,
        executionPlan: null,
        timetable: []
      });
    }

    console.log(`Analyzing ${pendingTasks.length} pending tasks for user: ${session.user.email}`);

    // Prepare task data for AI analysis
    const pendingTaskSummary = pendingTasks.map((task, index) => ({
      id: task._id.toString(),
      index: index + 1,
      title: task.title,
      description: task.description || '',
      type: task.type,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      scheduledTime: task.scheduledTime ? new Date(task.scheduledTime).toISOString() : null,
      estimatedDuration: task.estimatedDuration || 60,
      tags: task.tags || [],
      source: task.source || 'manual'
    }));

    const completedTaskSummary = completedTasks.map((task, index) => ({
      id: task._id.toString(),
      title: task.title,
      type: task.type,
      priority: task.priority,
      completedAt: task.updatedAt ? new Date(task.updatedAt).toISOString() : null,
      estimatedDuration: task.estimatedDuration || 60,
      source: task.source || 'manual'
    }));

    const currentTime = new Date().toLocaleString();

    const prompt = `You are an AI productivity consultant analyzing a user's complete task portfolio to create an optimal execution plan. Current date/time: ${currentTime}

PENDING TASKS TO ANALYZE (${pendingTasks.length} tasks):
${pendingTaskSummary.map(task => `
Task ${task.index}: ${task.title}
- Description: ${task.description}
- Type: ${task.type}
- Priority: ${task.priority}/5
- Status: ${task.status}
- Due Date: ${task.dueDate || 'Not set'}
- Scheduled Time: ${task.scheduledTime || 'Not set'}
- Estimated Duration: ${task.estimatedDuration} minutes
- Tags: ${task.tags.join(', ')}
- Source: ${task.source}
`).join('\n')}

RECENTLY COMPLETED TASKS FOR CONTEXT (${completedTasks.length} tasks):
${completedTaskSummary.map(task => `
- ${task.title} (${task.type}, Priority: ${task.priority}/5, Duration: ${task.estimatedDuration}min, Source: ${task.source})
`).join('\n')}

Analyze these tasks and create a comprehensive execution plan. Return ONLY a valid JSON object with this structure:

{
  "analysis": {
    "totalTasks": ${pendingTasks.length},
    "criticalTasks": 0,
    "urgentTasks": 0,
    "blockedTasks": 0,
    "estimatedTotalTime": 0,
    "keyInsights": [
      "Insight about task distribution",
      "Insight about priorities",
      "Insight about deadlines"
    ],
    "recommendations": [
      "Specific recommendation for improvement",
      "Suggestion for better organization"
    ]
  },
  "executionPlan": {
    "strategy": "Description of overall execution strategy",
    "phases": [
      {
        "name": "Phase 1: Immediate Actions",
        "description": "What to focus on first",
        "duration": "1-2 hours",
        "taskIds": ["task_id_1", "task_id_2"],
        "reasoning": "Why these tasks should be done first"
      }
    ],
    "riskFactors": [
      "Potential risk or bottleneck",
      "Dependency issue to watch"
    ],
    "successMetrics": [
      "How to measure progress",
      "Key milestones to track"
    ]
  },
  "timetable": [
    {
      "timeSlot": "9:00 AM - 10:30 AM",
      "taskId": "task_id",
      "taskTitle": "Task title",
      "action": "Specific action to take",
      "priority": "HIGH|MEDIUM|LOW",
      "reasoning": "Why this timing is optimal",
      "preparationNeeded": "What to prepare beforehand",
      "expectedOutcome": "What should be accomplished"
    }
  ],
  "priorityMatrix": {
    "doFirst": [
      {
        "taskId": "task_id",
        "taskTitle": "Task title",
        "reasoning": "Why this is urgent and important"
      }
    ],
    "schedule": [
      {
        "taskId": "task_id",
        "taskTitle": "Task title",
        "reasoning": "Why this is important but not urgent"
      }
    ],
    "delegate": [
      {
        "taskId": "task_id",
        "taskTitle": "Task title",
        "reasoning": "Why this could be delegated"
      }
    ],
    "eliminate": [
      {
        "taskId": "task_id",
        "taskTitle": "Task title",
        "reasoning": "Why this might not be necessary"
      }
    ]
  }
}

ANALYSIS GUIDELINES:
1. Consider task dependencies and logical sequencing
2. Account for due dates and time constraints
3. Balance high-priority tasks with quick wins
4. Identify potential bottlenecks or blockers
5. Suggest realistic time slots based on task complexity
6. Consider energy levels throughout the day
7. Group similar tasks for efficiency
8. Account for context switching costs
9. Identify tasks that could be batched together
10. Suggest breaks and buffer time

Create a practical, actionable plan that maximizes productivity while being realistic about human limitations and energy cycles.`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("AI Response text:", text.substring(0, 500) + "..."); // Debug log

      // Extract JSON from response
      let jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          jsonMatch[0] = jsonMatch[1];
        }
      }

      if (!jsonMatch) {
        console.error("No JSON found in AI response:", text);
        // Return fallback analysis
        return NextResponse.json({
          success: true,
          tasksAnalyzed: pendingTasks.length,
          analysis: {
            totalTasks: pendingTasks.length,
            criticalTasks: Math.floor(pendingTasks.length * 0.2),
            urgentTasks: Math.floor(pendingTasks.length * 0.3),
            blockedTasks: 0,
            estimatedTotalTime: pendingTasks.reduce((sum, task) => sum + (task.estimatedDuration || 60), 0),
            keyInsights: [
              "AI analysis encountered an issue, showing basic task overview",
              `You have ${pendingTasks.length} pending tasks to work on`,
              "Consider prioritizing by due date and importance"
            ],
            recommendations: [
              "Start with highest priority tasks first",
              "Break large tasks into smaller chunks",
              "Set realistic time estimates for each task"
            ]
          },
          executionPlan: {
            strategy: "Work through tasks systematically, starting with highest priority items.",
            phases: [
              {
                name: "Phase 1: High Priority",
                description: "Focus on urgent and important tasks",
                duration: "2-3 hours",
                taskIds: pendingTasks.slice(0, 3).map(t => t._id.toString()),
                reasoning: "These tasks have the highest impact"
              }
            ],
            riskFactors: ["Task dependencies", "Time constraints"],
            successMetrics: ["Complete high priority tasks", "Make progress on remaining items"]
          },
          timetable: pendingTasks.slice(0, 5).map((task, index) => ({
            timeSlot: `${9 + index * 2}:00 AM - ${11 + index * 2}:00 AM`,
            taskId: task._id.toString(),
            taskTitle: task.title,
            action: `Work on: ${task.title}`,
            priority: task.priority >= 4 ? 'HIGH' : task.priority >= 3 ? 'MEDIUM' : 'LOW',
            reasoning: "Scheduled based on task priority",
            preparationNeeded: "Gather necessary resources",
            expectedOutcome: `Progress on ${task.title}`
          })),
          priorityMatrix: {
            doFirst: pendingTasks.filter(t => t.priority >= 4).slice(0, 3).map(task => ({
              taskId: task._id.toString(),
              taskTitle: task.title,
              reasoning: "High priority task"
            })),
            schedule: pendingTasks.filter(t => t.priority === 3).slice(0, 3).map(task => ({
              taskId: task._id.toString(),
              taskTitle: task.title,
              reasoning: "Important but not urgent"
            })),
            delegate: [],
            eliminate: []
          },
          generatedAt: new Date().toISOString(),
          message: `Analyzed ${pendingTasks.length} tasks with fallback analysis`
        });
      }

      let aiAnalysis;
      try {
        aiAnalysis = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "Raw JSON:", jsonMatch[0]);
        throw new Error("Invalid JSON format in AI response");
      }

      // Store the analysis for future reference
      const analysisRecord = {
        userId: session.user.email,
        analysisDate: new Date(),
        tasksAnalyzed: pendingTasks.length,
        totalTasks: allTasks.length,
        analysis: aiAnalysis,
        taskSnapshot: {
          pending: pendingTaskSummary,
          recentlyCompleted: completedTaskSummary
        },
        createdAt: new Date()
      };

      await db.collection("ai_task_analyses").insertOne(analysisRecord);

      return NextResponse.json({
        success: true,
        tasksAnalyzed: pendingTasks.length,
        totalTasks: allTasks.length,
        completedTasksContext: completedTasks.length,
        analysis: aiAnalysis.analysis,
        executionPlan: aiAnalysis.executionPlan,
        timetable: aiAnalysis.timetable,
        priorityMatrix: aiAnalysis.priorityMatrix,
        generatedAt: new Date().toISOString(),
        message: `Successfully analyzed ${pendingTasks.length} pending tasks (${allTasks.length} total) and generated execution plan`
      });

    } catch (aiError) {
      console.error(`AI analysis failed:`, aiError);
      return NextResponse.json({
        error: "Failed to analyze tasks with AI",
        details: aiError instanceof Error ? aiError.message : 'Unknown AI error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Task analysis error:", error);

    let errorMessage = "Failed to analyze tasks";
    let errorDetails = "";

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || "";
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}