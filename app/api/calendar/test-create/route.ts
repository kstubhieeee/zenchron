import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { google } from "googleapis";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken || !session?.user?.email) {
            return NextResponse.json({
                error: "Not authenticated",
                details: "No access token or user email found in session"
            }, { status: 401 });
        }

        console.log("Testing Google Calendar API access...");

        // Initialize Google Calendar API
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: session.accessToken });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        // Create a simple test event
        const testEvent = {
            summary: "Test Event - Zenchron Calendar Integration",
            description: "This is a test event created by the Zenchron task management system to verify calendar integration is working.",
            start: {
                dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
                timeZone: 'UTC',
            },
            end: {
                dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
                timeZone: 'UTC',
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 10 },
                ],
            },
        };

        const calendarResponse = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: testEvent,
        });

        const eventId = calendarResponse.data.id;
        const eventUrl = `https://calendar.google.com/calendar/event?eid=${eventId}`;

        return NextResponse.json({
            success: true,
            message: "Test calendar event created successfully!",
            eventId: eventId,
            eventUrl: eventUrl,
            eventTitle: testEvent.summary,
            startTime: testEvent.start.dateTime,
            endTime: testEvent.end.dateTime,
            calendarResponse: {
                status: calendarResponse.status,
                statusText: calendarResponse.statusText
            }
        });

    } catch (error) {
        console.error("Calendar test error:", error);

        let errorMessage = "Failed to create test calendar event";
        let errorDetails = "";

        if (error instanceof Error) {
            errorMessage = error.message;
            errorDetails = error.stack || "";
        }

        // Check for specific Google API errors
        if (error && typeof error === 'object' && 'code' in error) {
            switch (error.code) {
                case 401:
                    errorMessage = "Authentication failed - please re-login to Google";
                    break;
                case 403:
                    errorMessage = "Permission denied - please grant calendar access";
                    break;
                case 404:
                    errorMessage = "Calendar not found";
                    break;
                default:
                    errorMessage = `Google Calendar API error (${error.code})`;
            }
        }

        return NextResponse.json(
            {
                error: errorMessage,
                details: errorDetails,
                timestamp: new Date().toISOString(),
                suggestion: "Try logging out and logging back in to refresh your Google Calendar permissions"
            },
            { status: 500 }
        );
    }
}