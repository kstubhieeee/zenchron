import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { google } from "googleapis";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const body = await request.json();

        if (!session?.accessToken || !session?.user?.email) {
            return NextResponse.json({
                error: "Not authenticated",
                details: "No access token or user email found in session"
            }, { status: 401 });
        }

        const { taskId, title, description, startTime, endTime, attendees } = body;

        if (!taskId || !title || !startTime) {
            return NextResponse.json({
                error: "Missing required fields",
                details: "taskId, title, and startTime are required"
            }, { status: 400 });
        }

        // Initialize Google Calendar API
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: session.accessToken });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        // Check if event already exists for this task
        const client = await clientPromise;
        const db = client.db("zenchron");
        const tasksCollection = db.collection("tasks");
        const calendarEventsCollection = db.collection("calendar_events");

        const existingEvent = await calendarEventsCollection.findOne({
            userId: session.user.email,
            taskId: taskId
        });

        if (existingEvent) {
            return NextResponse.json({
                error: "Event already exists for this task",
                eventId: existingEvent.googleEventId
            }, { status: 409 });
        }

        // Create the calendar event
        const event = {
            summary: title,
            description: description || `Task: ${title}`,
            start: {
                dateTime: new Date(startTime).toISOString(),
                timeZone: 'UTC',
            },
            end: {
                dateTime: endTime ? new Date(endTime).toISOString() : new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString(), // Default 1 hour
                timeZone: 'UTC',
            },
            attendees: attendees ? attendees.map((email: string) => ({ email })) : [],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 1 day before
                    { method: 'popup', minutes: 30 }, // 30 minutes before
                ],
            },
        };

        const calendarResponse = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });

        const googleEventId = calendarResponse.data.id;

        // Store the event mapping in our database
        await calendarEventsCollection.insertOne({
            userId: session.user.email,
            taskId: taskId,
            googleEventId: googleEventId,
            title: title,
            startTime: new Date(startTime),
            endTime: endTime ? new Date(endTime) : new Date(new Date(startTime).getTime() + 60 * 60 * 1000),
            createdAt: new Date(),
            syncDirection: 'task_to_calendar'
        });

        // Update the task to mark it as having a calendar event
        await tasksCollection.updateOne(
            { _id: new (require('mongodb')).ObjectId(taskId), userId: session.user.email },
            { 
                $set: { 
                    'metadata.googleEventId': googleEventId,
                    'metadata.hasCalendarEvent': true,
                    updatedAt: new Date()
                }
            }
        );

        return NextResponse.json({
            success: true,
            eventId: googleEventId,
            eventUrl: `https://calendar.google.com/calendar/event?eid=${googleEventId}`,
            message: "Calendar event created successfully"
        });

    } catch (error) {
        console.error("Create calendar event error:", error);

        let errorMessage = "Failed to create calendar event";
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