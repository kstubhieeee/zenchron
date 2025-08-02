import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
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

        // Get tasks that don't have calendar events yet
        const client = await clientPromise;
        const db = client.db("zenchron");
        const tasksCollection = db.collection("tasks");

        const tasks = await tasksCollection.find({
            userId: session.user.email,
            status: { $in: ['TODO', 'IN_PROGRESS'] },
            $or: [
                { 'metadata.hasCalendarEvent': { $ne: true } },
                { 'metadata.hasCalendarEvent': { $exists: false } }
            ]
        }).limit(20).toArray();

        console.log(`Analyzing ${tasks.length} tasks for calendar event suggestions`);

        const suggestions = [];

        for (const task of tasks) {
            const prompt = `You are an AI assistant that analyzes tasks and determines if they should have calendar events created. Analyze this task and return a JSON response.

Task Details:
Title: ${task.title}
Description: ${task.description || ''}
Type: ${task.type}
Priority: ${task.priority}
Due Date: ${task.dueDate ? new Date(task.dueDate).toISOString() : 'None'}
Scheduled Time: ${task.scheduledTime ? new Date(task.scheduledTime).toISOString() : 'None'}
Tags: ${task.tags?.join(', ') || ''}

Determine if this task should have a calendar event created. Tasks that should have calendar events typically include:
- Tasks mentioning "meeting", "call", "presentation", "demo", "interview"
- Tasks with specific times, deadlines, or scheduled times
- Tasks requiring collaboration with others or involving other people
- Tasks mentioning "schedule", "book", "arrange", "plan", "organize"
- Tasks that are time-sensitive or have appointments
- Tasks requiring focused work time or preparation
- Tasks with high priority that need dedicated time blocks
- Tasks that involve external parties or clients
- Tasks that are work-related and need time allocation
- Tasks that mention specific dates or times

Tasks that should NOT have calendar events:
- Very simple tasks that take less than 15 minutes
- Tasks that are already completed (status: DONE)
- Tasks that are purely informational or reference-only
- Tasks that are too vague to schedule

Be more inclusive - when in doubt, suggest creating a calendar event as it helps with time management.

Return ONLY a valid JSON object with this structure:
{
  "shouldCreateEvent": true/false,
  "event": {
    "title": "Calendar event title",
    "description": "Event description with context",
    "suggestedStartTime": "ISO date string (when should this happen)",
    "suggestedDuration": 60,
    "eventType": "meeting|call|presentation|appointment|work_session",
    "attendees": ["email1@example.com", "email2@example.com"],
    "reasoning": "Why this task needs a calendar event"
  }
}

If this task should not have a calendar event, set shouldCreateEvent to false.
For suggestedStartTime:
- Use the task's scheduledTime if available
- Use the task's dueDate if available (but schedule it before the due date)
- Otherwise suggest tomorrow at 9 AM as a reasonable default
- Format as ISO date string`;

            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Extract JSON from response
                let jsonMatch = text.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
                    if (jsonMatch) {
                        jsonMatch[0] = jsonMatch[1];
                    }
                }

                if (!jsonMatch) {
                    console.log(`No valid JSON found in AI response for task ${task._id}`);
                    continue;
                }

                const analysis = JSON.parse(jsonMatch[0]);

                if (analysis.shouldCreateEvent && analysis.event) {
                    suggestions.push({
                        taskId: task._id.toString(),
                        taskTitle: task.title,
                        ...analysis.event
                    });
                }

            } catch (aiError) {
                console.error(`AI processing failed for task ${task._id}:`, aiError);
            }
        }

        return NextResponse.json({
            success: true,
            tasksAnalyzed: tasks.length,
            suggestions: suggestions,
            message: `Found ${suggestions.length} tasks that could benefit from calendar events`
        });

    } catch (error) {
        console.error("Analyze tasks error:", error);

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