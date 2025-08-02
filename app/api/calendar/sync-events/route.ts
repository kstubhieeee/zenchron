import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { google } from "googleapis";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { TaskStatus } from "@/lib/models/Task";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken || !session?.user?.email) {
            return NextResponse.json({
                error: "Not authenticated",
                details: "No access token or user email found in session"
            }, { status: 401 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                error: "Gemini API key not configured"
            }, { status: 500 });
        }

        // Initialize Google Calendar API
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: session.accessToken });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        console.log("Syncing calendar events for user:", session.user.email);

        // Get events from the last 30 days and next 30 days
        const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const eventsResponse = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin,
            timeMax: timeMax,
            maxResults: 100,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = eventsResponse.data.items || [];
        console.log(`Found ${events.length} calendar events`);

        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db("zenchron");
        const tasksCollection = db.collection("tasks");
        const calendarEventsCollection = db.collection("calendar_events");

        // Get already synced events to avoid duplicates
        const syncedEvents = await calendarEventsCollection.find({
            userId: session.user.email,
            syncDirection: 'calendar_to_task'
        }).toArray();

        const syncedEventIds = new Set(syncedEvents.map(event => event.googleEventId));

        let tasksCreated = 0;
        const createdTasks = [];

        // Process each calendar event
        for (const event of events) {
            // Skip if already synced
            if (syncedEventIds.has(event.id)) {
                continue;
            }

            // Skip all-day events without specific times
            if (!event.start?.dateTime || !event.end?.dateTime) {
                continue;
            }

            // Skip events without meaningful content
            if (!event.summary || event.summary.trim().length < 3) {
                continue;
            }

            const eventTitle = event.summary || 'Untitled Event';
            const eventDescription = event.description || '';
            const eventLocation = event.location || '';
            const startTime = new Date(event.start.dateTime);
            const endTime = new Date(event.end.dateTime);
            const attendees = event.attendees?.map(a => a.email).filter(Boolean) || [];

            // Use AI to determine if this event should become a task
            const prompt = `You are an AI assistant that analyzes Google Calendar events and determines if they should become actionable tasks. Analyze this calendar event and return a JSON response.

Event Details:
Title: ${eventTitle}
Description: ${eventDescription}
Location: ${eventLocation}
Start Time: ${startTime.toISOString()}
End Time: ${endTime.toISOString()}
Attendees: ${attendees.join(', ')}

Determine if this calendar event should become a task. Events that should become tasks typically include:
- Meetings that require preparation or follow-up
- Appointments that need action items
- Events with deliverables or outcomes
- Meetings where you need to present or contribute
- Events that are work-related and actionable

Events that should NOT become tasks:
- Personal appointments (doctor, dentist, etc.)
- Social events without work context
- Recurring personal events (lunch, gym, etc.)
- Events you're just attending passively
- All-day events or holidays

Task Types (use these exact values):
- scheduled_event: Time-specific events, meetings, appointments
- follow_up: Events requiring follow-up actions
- deadline_based: Events with deliverables or deadlines
- deep_work: Events requiring preparation or focused work
- quick_win: Simple preparation or follow-up tasks

Return ONLY a valid JSON object with this structure:
{
  "shouldCreateTask": true/false,
  "task": {
    "title": "Task title (actionable, not just the event name)",
    "description": "What needs to be done for/after this event",
    "type": "task_type_from_list_above",
    "priority": 1-5,
    "dueDate": "ISO date string (usually event start time)",
    "scheduledTime": "ISO date string (event start time)",
    "estimatedDuration": 30,
    "tags": ["calendar", "meeting", "relevant", "tags"],
    "source": "calendar"
  }
}

If this event should not become a task, set shouldCreateTask to false.
Focus on creating actionable tasks rather than just copying calendar events.`;

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
                    console.log(`No valid JSON found in AI response for event ${event.id}`);
                    continue;
                }

                const analysis = JSON.parse(jsonMatch[0]);

                if (analysis.shouldCreateTask && analysis.task) {
                    const task = analysis.task;

                    // Create task in MongoDB
                    const taskDoc = {
                        userId: session.user.email,
                        title: task.title,
                        description: task.description || '',
                        type: task.type || 'scheduled_event',
                        priority: Math.max(1, Math.min(5, task.priority || 3)),
                        status: TaskStatus.TODO,
                        source: 'calendar',
                        dueDate: task.dueDate ? new Date(task.dueDate) : startTime,
                        scheduledTime: task.scheduledTime ? new Date(task.scheduledTime) : startTime,
                        estimatedDuration: task.estimatedDuration || Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)),
                        tags: task.tags || ['calendar', 'meeting'],
                        metadata: {
                            googleEventId: event.id,
                            eventTitle: eventTitle,
                            eventLocation: eventLocation,
                            eventStartTime: startTime.toISOString(),
                            eventEndTime: endTime.toISOString(),
                            attendees: attendees,
                            hasCalendarEvent: true
                        },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    const insertResult = await tasksCollection.insertOne(taskDoc);
                    tasksCreated++;
                    createdTasks.push({
                        id: insertResult.insertedId,
                        ...task,
                        eventId: event.id
                    });

                    // Record the sync to prevent duplicates
                    await calendarEventsCollection.insertOne({
                        userId: session.user.email,
                        taskId: insertResult.insertedId.toString(),
                        googleEventId: event.id,
                        title: eventTitle,
                        startTime: startTime,
                        endTime: endTime,
                        createdAt: new Date(),
                        syncDirection: 'calendar_to_task'
                    });

                    console.log(`Created task from calendar event: ${task.title}`);
                }

            } catch (aiError) {
                console.error(`AI processing failed for event ${event.id}:`, aiError);
            }
        }

        return NextResponse.json({
            success: true,
            eventsProcessed: events.length,
            tasksCreated: tasksCreated,
            tasks: createdTasks,
            message: `Successfully processed ${events.length} calendar events and created ${tasksCreated} tasks`
        });

    } catch (error) {
        console.error("Calendar sync error:", error);

        let errorMessage = "Failed to sync calendar events";
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