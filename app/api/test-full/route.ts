import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();
    
    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    console.log('Testing full flow with input:', input);

    // Test 1: MongoDB Connection
    console.log('Testing MongoDB...');
    const client = await clientPromise;
    const db = client.db("zenchron");
    console.log('MongoDB connected successfully');

    // Test 2: Gemini AI
    console.log('Testing Gemini AI...');
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const currentDate = new Date();
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const prompt = `
You are an AI task categorization system. Analyze the following input and return a JSON array of tasks.

Current date: ${currentDate.toISOString()}
Tomorrow's date: ${tomorrow.toISOString()}

User input: "${input}"

Task Types:
- follow_up: Follow-up tasks, mentions, questions
- quick_win: Simple, short tasks
- high_priority: Urgent tasks with "ASAP", "urgent"
- deep_work: Complex tasks requiring focus
- deadline_based: Tasks with specific due dates
- recurring: Repeating tasks
- scheduled_event: Time-specific events, meetings
- reference_info: Information for reference only
- waiting_blocked: Tasks waiting for external input
- custom: Any other tasks

Return ONLY a valid JSON array:
[
  {
    "title": "Task title",
    "description": "Task description",
    "type": "task_type",
    "priority": 1-5,
    "dueDate": "ISO date string or null",
    "scheduledTime": "ISO date string or null",
    "estimatedDuration": 30,
    "tags": ["tag1", "tag2"],
    "source": "manual"
  }
]

Examples:
- "Call John tomorrow" → scheduled for tomorrow morning
- "Review reports by Friday" → deadline-based with Friday due date
- "Quick email to Sarah" → quick_win with high priority
`;

    console.log('Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Gemini response:', text);

    // Extract JSON
    let jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      jsonMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1];
      }
    }

    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response");
    }

    const tasks = JSON.parse(jsonMatch[0]);
    console.log('Parsed tasks:', tasks);

    // Test 3: Save to MongoDB
    console.log('Saving tasks to MongoDB...');
    const collection = db.collection("tasks");
    
    const enhancedTasks = tasks.map((task: any) => ({
      ...task,
      userId: "test@example.com", // Test user
      status: 'todo',
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      scheduledTime: task.scheduledTime ? new Date(task.scheduledTime) : null,
    }));

    const insertResult = await collection.insertMany(enhancedTasks);
    console.log('Tasks saved successfully:', insertResult.insertedIds);

    return NextResponse.json({
      success: true,
      message: "Full test completed successfully",
      steps: {
        mongodb: "Connected successfully",
        gemini: "Generated tasks successfully",
        database: `Inserted ${insertResult.insertedIds.length} tasks`
      },
      tasks: enhancedTasks,
      insertedIds: Object.values(insertResult.insertedIds).map(id => id.toString())
    });

  } catch (error) {
    console.error("Full test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Full test failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}