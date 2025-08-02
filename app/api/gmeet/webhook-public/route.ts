import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import clientPromise from "@/lib/mongodb";
import { TaskStatus } from "@/lib/models/Task";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Get user email from request body or headers
        const userEmail = body.userEmail || request.headers.get('x-user-email');
        
        if (!userEmail) {
            console.log("No user email provided in webhook request");
            return NextResponse.json({
                error: "User email is required",
                message: "Please include userEmail in the request body or x-user-email header"
            }, { status: 400 });
        }

        console.log("Received Google Meet transcript webhook for user:", userEmail, {
            meetingTitle: body.meetingTitle,
            webhookBodyType: body.webhookBodyType,
            transcriptLength: body.transcript?.length || 0,
            chatMessagesLength: body.chatMessages?.length || 0
        });

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                error: "Gemini API key not configured"
            }, { status: 500 });
        }

        // Verify user exists in our system (optional check)
        const client = await clientPromise;
        const db = client.db("zenchron");
        const usersCollection = db.collection("users");
        
        // Check if user exists (you might want to create a users collection or check against your auth system)
        // For now, we'll just proceed with any email provided

        // Process the transcript based on webhook body type
        let transcriptText = '';
        let chatText = '';

        if (body.webhookBodyType === 'simple') {
            transcriptText = body.transcript || '';
            chatText = body.chatMessages || '';
        } else if (body.webhookBodyType === 'advanced') {
            // Process advanced format (array of transcript blocks and chat messages)
            if (body.transcript && Array.isArray(body.transcript)) {
                transcriptText = body.transcript.map((block: any) => 
                    `${block.personName}: ${block.transcriptText}`
                ).join('\n');
            }
            
            if (body.chatMessages && Array.isArray(body.chatMessages)) {
                chatText = body.chatMessages.map((msg: any) => 
                    `${msg.personName}: ${msg.chatMessageText}`
                ).join('\n');
            }
        }

        const fullContent = `${transcriptText}\n\nChat Messages:\n${chatText}`.trim();

        if (!fullContent) {
            return NextResponse.json({
                error: "No transcript or chat content found"
            }, { status: 400 });
        }

        console.log(`Processing meeting: "${body.meetingTitle}" with ${fullContent.length} characters`);

        // Use Gemini to extract tasks from the meeting transcript
        const prompt = `You are an AI assistant that analyzes Google Meet transcripts and extracts actionable tasks. Analyze this meeting transcript and return a JSON response.

Meeting Details:
Title: ${body.meetingTitle || 'Google Meet'}
Start Time: ${body.meetingStartTimestamp || 'Unknown'}
End Time: ${body.meetingEndTimestamp || 'Unknown'}

Transcript and Chat Content:
${fullContent.substring(0, 4000)} // Limit content for API

Analyze the meeting content and extract actionable tasks. Look for:
- Action items assigned to specific people
- Decisions that require follow-up
- Deadlines and due dates mentioned
- Tasks that need to be completed
- Follow-up meetings or calls to schedule
- Documents or deliverables to create
- Reviews or approvals needed
- Any mentions of "action item", "todo", "need to", "should", "must", "deadline", "due"

Task Types (use these exact values):
- follow_up: Follow-up tasks, mentions, questions requiring response
- quick_win: Simple, short tasks that can be done quickly
- high_priority: Urgent tasks with "ASAP", "urgent", "important"
- deep_work: Complex tasks requiring focused attention
- deadline_based: Tasks with specific due dates or deadlines
- recurring: Repeating tasks, habits, regular activities
- scheduled_event: Time-specific events, meetings, appointments
- reference_info: Information for reference only, no action required
- waiting_blocked: Tasks waiting for external input or blocked

Return ONLY a valid JSON object with this structure:
{
  "hasTasks": true/false,
  "tasks": [
    {
      "title": "Task title (concise, actionable)",
      "description": "Detailed description including context from meeting",
      "type": "task_type_from_list_above",
      "priority": 1-5,
      "dueDate": "ISO date string or null",
      "scheduledTime": "ISO date string or null",
      "estimatedDuration": 30,
      "tags": ["meeting", "relevant", "tags"],
      "source": "gmeet",
      "metadata": {
        "meetingTitle": "${body.meetingTitle || 'Google Meet'}",
        "meetingDate": "${body.meetingStartTimestamp || new Date().toISOString()}",
        "assignedTo": "person_name_if_mentioned"
      }
    }
  ]
}

If no actionable tasks are found, return empty tasks array.
Focus on extracting meaningful, actionable tasks rather than general discussion points.`;

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
                throw new Error("No valid JSON found in AI response");
            }

            const analysis = JSON.parse(jsonMatch[0]);
            const extractedTasks = analysis.tasks || [];

            console.log(`AI extracted ${extractedTasks.length} tasks from meeting "${body.meetingTitle}"`);

            // Store tasks in MongoDB
            const tasksCollection = db.collection("tasks");
            const meetingsCollection = db.collection("gmeet_meetings");

            let tasksCreated = 0;
            const createdTasks = [];

            // Store the meeting record
            const meetingRecord = {
                meetingTitle: body.meetingTitle || 'Google Meet',
                meetingStartTimestamp: body.meetingStartTimestamp,
                meetingEndTimestamp: body.meetingEndTimestamp,
                transcriptLength: transcriptText.length,
                chatMessagesLength: chatText.length,
                tasksExtracted: extractedTasks.length,
                processedAt: new Date(),
                webhookBodyType: body.webhookBodyType,
                userEmail: userEmail
            };

            await meetingsCollection.insertOne(meetingRecord);

            // Create tasks
            for (const task of extractedTasks) {
                try {
                    const taskDoc = {
                        userId: userEmail,
                        title: task.title,
                        description: task.description || '',
                        type: task.type || 'custom',
                        priority: Math.max(1, Math.min(5, task.priority || 2)),
                        status: TaskStatus.TODO,
                        source: 'gmeet',
                        dueDate: task.dueDate ? new Date(task.dueDate) : null,
                        scheduledTime: task.scheduledTime ? new Date(task.scheduledTime) : null,
                        estimatedDuration: task.estimatedDuration || 30,
                        tags: task.tags || ['meeting'],
                        metadata: {
                            meetingTitle: body.meetingTitle || 'Google Meet',
                            meetingDate: body.meetingStartTimestamp || new Date().toISOString(),
                            assignedTo: task.metadata?.assignedTo || null,
                            ...task.metadata
                        },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    const insertResult = await tasksCollection.insertOne(taskDoc);
                    tasksCreated++;
                    createdTasks.push({
                        id: insertResult.insertedId,
                        ...task
                    });
                    console.log(`Created task: ${task.title}`);
                } catch (error) {
                    console.error(`Failed to create task from meeting:`, error);
                }
            }

            return NextResponse.json({
                success: true,
                meetingTitle: body.meetingTitle,
                userEmail: userEmail,
                tasksExtracted: tasksCreated,
                tasks: createdTasks,
                message: `Successfully processed meeting and extracted ${tasksCreated} tasks`
            });

        } catch (aiError) {
            console.error(`AI processing failed for meeting:`, aiError);
            return NextResponse.json({
                error: "Failed to process meeting content with AI",
                details: aiError instanceof Error ? aiError.message : 'Unknown AI error'
            }, { status: 500 });
        }

    } catch (error) {
        console.error("Google Meet webhook error:", error);

        let errorMessage = "Failed to process Google Meet transcript";
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