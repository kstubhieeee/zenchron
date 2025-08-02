import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const body = await request.json();
        const { taskId } = body;

        if (!session?.user?.email) {
            return NextResponse.json({
                error: "Not authenticated"
            }, { status: 401 });
        }

        if (!taskId) {
            return NextResponse.json({
                error: "Task ID is required"
            }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                error: "Gemini API key not configured"
            }, { status: 500 });
        }

        // Get the specific task
        const client = await clientPromise;
        const db = client.db("zenchron");
        const tasksCollection = db.collection("tasks");

        const task = await tasksCollection.findOne({
            _id: new (require('mongodb')).ObjectId(taskId),
            userId: session.user.email
        });

        if (!task) {
            return NextResponse.json({
                error: "Task not found"
            }, { status: 404 });
        }

        console.log(`Analyzing single task for calendar event: ${task.title}`);

        const prompt = `You are an AI assistant that analyzes a task and creates a calendar event suggestion. Analyze this task and return a JSON response.

Task Details:
Title: ${task.title}
Description: ${task.description || ''}
Type: ${task.type}
Priority: ${task.priority}
Due Date: ${task.dueDate ? new Date(task.dueDate).toISOString() : 'None'}
Scheduled Time: ${task.scheduledTime ? new Date(task.scheduledTime).toISOString() : 'None'}
Tags: ${task.tags?.join(', ') || ''}

Create a calendar event suggestion for this task. Almost all tasks can benefit from having dedicated time blocks, so be inclusive in your suggestions.

Return ONLY a valid JSON object with this structure:
{
  "shouldCreateEvent": true,
  "event": {
    "title": "Calendar event title (make it actionable)",
    "description": "Event description with context and what needs to be accomplished",
    "suggestedStartTime": "ISO date string (when should this happen)",
    "suggestedDuration": 60,
    "eventType": "meeting|call|presentation|appointment|work_session|focus_time",
    "attendees": [],
    "reasoning": "Why this task benefits from a calendar event"
  }
}

Guidelines for event creation:
- For meetings/calls: Use the task title as event title
- For work tasks: Use "Work on: [task title]" or "Focus time: [task title]"
- For deadlines: Schedule before the due date with buffer time
- Default duration: 30-60 minutes for most tasks, 15-30 for quick tasks, 90-120 for complex tasks
- Default time: Use scheduledTime if available, otherwise dueDate minus buffer, otherwise tomorrow 9 AM
- Always set shouldCreateEvent to true unless the task is purely informational

Make the event title and description actionable and clear about what needs to be accomplished.`;

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
                // Fallback: create a basic event suggestion
                const fallbackEvent = {
                    shouldCreateEvent: true,
                    event: {
                        title: task.title.toLowerCase().includes('meeting') || task.title.toLowerCase().includes('call') 
                            ? task.title 
                            : `Work on: ${task.title}`,
                        description: task.description || `Dedicated time to work on: ${task.title}`,
                        suggestedStartTime: task.scheduledTime || task.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                        suggestedDuration: task.estimatedDuration || 60,
                        eventType: "work_session",
                        attendees: [],
                        reasoning: "This task would benefit from dedicated time allocation"
                    }
                };
                
                return NextResponse.json({
                    success: true,
                    taskId: taskId,
                    taskTitle: task.title,
                    ...fallbackEvent.event
                });
            }

            const analysis = JSON.parse(jsonMatch[0]);

            if (analysis.shouldCreateEvent && analysis.event) {
                return NextResponse.json({
                    success: true,
                    taskId: taskId,
                    taskTitle: task.title,
                    ...analysis.event
                });
            } else {
                // Even if AI says no, provide a basic suggestion
                return NextResponse.json({
                    success: true,
                    taskId: taskId,
                    taskTitle: task.title,
                    title: `Work on: ${task.title}`,
                    description: task.description || `Dedicated time to work on: ${task.title}`,
                    suggestedStartTime: task.scheduledTime || task.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    suggestedDuration: task.estimatedDuration || 60,
                    eventType: "work_session",
                    attendees: [],
                    reasoning: "This task would benefit from dedicated time allocation"
                });
            }

        } catch (aiError) {
            console.error(`AI processing failed for task ${taskId}:`, aiError);
            
            // Fallback: create a basic event suggestion
            return NextResponse.json({
                success: true,
                taskId: taskId,
                taskTitle: task.title,
                title: task.title.toLowerCase().includes('meeting') || task.title.toLowerCase().includes('call') 
                    ? task.title 
                    : `Work on: ${task.title}`,
                description: task.description || `Dedicated time to work on: ${task.title}`,
                suggestedStartTime: task.scheduledTime || task.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                suggestedDuration: task.estimatedDuration || 60,
                eventType: "work_session",
                attendees: [],
                reasoning: "This task would benefit from dedicated time allocation"
            });
        }

    } catch (error) {
        console.error("Analyze single task error:", error);

        let errorMessage = "Failed to analyze task";
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