import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { input, source = 'manual' } = await request.json();

    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    console.log('Initializing Gemini AI...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const currentDate = new Date();
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const prompt = `
You are an AI task categorization system. Analyze the following input and return a JSON array of tasks with proper categorization.

Current date and time: ${currentDate.toISOString()}
Tomorrow's date: ${tomorrow.toISOString()}

Input source: ${source}
User input: "${input}"

Task Types Available:
- follow_up: Follow-up tasks, mentions, questions requiring response
- quick_win: Simple, short tasks that can be done quickly
- high_priority: Urgent tasks with keywords like "ASAP", "urgent", "important"
- deep_work: Complex tasks requiring focused attention, large projects
- deadline_based: Tasks with specific due dates or deadlines
- recurring: Repeating tasks, habits, regular activities
- scheduled_event: Time-specific events, meetings, appointments
- reference_info: Information for reference only, no action required
- waiting_blocked: Tasks waiting for external input or blocked
- custom: Any other tasks

Priority Levels (1-5):
1: Low priority
2: Medium priority  
3: High priority
4: Urgent
5: Critical

Rules for date/time assignment:
- If user says "tomorrow", use tomorrow's date with appropriate time
- If user says "today", use today's date with appropriate time
- If user mentions specific time, use that time
- If no time specified, assign reasonable time based on task type:
  - Meetings: business hours (9 AM - 5 PM)
  - Deep work: morning hours (9 AM - 12 PM)
  - Quick tasks: any time during day
  - Follow-ups: business hours
- If user says "by [date]", set dueDate to that date
- For recurring tasks, set appropriate scheduledTime for first occurrence

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "Task title (concise, actionable)",
    "description": "Detailed description if needed",
    "type": "task_type_from_list_above",
    "priority": 1-5,
    "dueDate": "ISO date string or null",
    "scheduledTime": "ISO date string or null", 
    "estimatedDuration": minutes_as_number,
    "tags": ["relevant", "tags"],
    "source": "${source}"
  }
]

Examples:
- "Call John about the project tomorrow" → scheduled for tomorrow morning
- "Review quarterly reports by Friday" → deadline-based with Friday due date
- "Quick email to Sarah" → quick_win with high priority
- "Prepare presentation for Monday meeting" → deep_work with Monday due date

Analyze the input and extract all actionable tasks. If it's just information, categorize as reference_info.
`;

    console.log('Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Gemini response:', text);

    // Extract JSON from the response
    let jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      // Try to find JSON in code blocks
      jsonMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1];
      }
    }

    if (!jsonMatch) {
      console.error('No JSON found in response:', text);
      throw new Error("No valid JSON found in AI response");
    }

    console.log('Extracted JSON:', jsonMatch[0]);
    const tasks = JSON.parse(jsonMatch[0]);
    console.log('Parsed tasks:', tasks);

    // Validate and enhance the tasks
    const enhancedTasks = tasks.map((task: any) => ({
      ...task,
      userId: "test@example.com", // Using test user
      status: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Ensure dates are properly formatted
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      scheduledTime: task.scheduledTime ? new Date(task.scheduledTime).toISOString() : null,
      // Ensure required fields
      tags: task.tags || [],
      estimatedDuration: task.estimatedDuration || 30,
      priority: Math.max(1, Math.min(5, task.priority || 2))
    }));

    console.log('Enhanced tasks:', enhancedTasks);

    const responseData = {
      tasks: enhancedTasks,
      originalInput: input,
      source,
      processedAt: new Date().toISOString()
    };

    console.log('Returning response:', responseData);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Task categorization error:", error);
    return NextResponse.json(
      {
        error: "Failed to categorize tasks",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}