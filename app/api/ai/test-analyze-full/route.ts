import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import clientPromise from "@/lib/mongodb";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        error: "Gemini API key not configured"
      }, { status: 500 });
    }

    // Get ALL tasks for testing (using a test user)
    const client = await clientPromise;
    const db = client.db("zenchron");
    const tasksCollection = db.collection("tasks");

    // Fetch all tasks for comprehensive analysis
    const allTasks = await tasksCollection.find({}).limit(20).toArray();

    // Separate pending and completed tasks (handle both uppercase and lowercase)
    const pendingTasks = allTasks.filter(task =>
      ['TODO', 'IN_PROGRESS', 'WAITING', 'todo', 'in_progress', 'waiting'].includes(task.status)
    );

    const completedTasks = allTasks.filter(task =>
      ['DONE', 'done', 'completed'].includes(task.status)
    ).slice(-5); // Last 5 completed tasks for context

    console.log(`Found ${allTasks.length} total tasks, ${pendingTasks.length} pending, ${completedTasks.length} completed`);

    if (pendingTasks.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending tasks found",
        totalTasks: allTasks.length,
        pendingTasks: 0,
        completedTasks: completedTasks.length
      });
    }

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

    const completedTaskSummary = completedTasks.map((task) => ({
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

Create a practical, actionable plan that maximizes productivity while being realistic about human limitations and energy cycles.`;

    console.log("Sending prompt to AI...");
    console.log("Prompt length:", prompt.length);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log("AI Response received, length:", text.length);
      console.log("AI Response preview:", text.substring(0, 200) + "...");

      // Extract JSON from response
      let jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          jsonMatch[0] = jsonMatch[1];
        }
      }

      if (!jsonMatch) {
        console.error("No JSON found in AI response");
        return NextResponse.json({
          error: "No JSON found in AI response",
          rawResponse: text.substring(0, 1000),
          promptLength: prompt.length,
          tasksAnalyzed: pendingTasks.length
        }, { status: 500 });
      }

      let aiAnalysis;
      try {
        aiAnalysis = JSON.parse(jsonMatch[0]);
        console.log("Successfully parsed AI analysis");
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return NextResponse.json({
          error: "Invalid JSON format in AI response",
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          rawJson: jsonMatch[0].substring(0, 500),
          tasksAnalyzed: pendingTasks.length
        }, { status: 500 });
      }

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
        details: aiError instanceof Error ? aiError.message : 'Unknown AI error',
        tasksFound: pendingTasks.length,
        promptLength: prompt.length
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Task analysis error:", error);

    return NextResponse.json(
      {
        error: "Failed to analyze tasks",
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}