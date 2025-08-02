import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json({
                error: "Not authenticated"
            }, { status: 401 });
        }

        // Create a test webhook payload
        const testPayload = {
            webhookBodyType: "simple",
            meetingTitle: "Test Meeting - " + new Date().toLocaleString(),
            meetingStartTimestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
            meetingEndTimestamp: new Date().toISOString(),
            transcript: `John Doe: Hi everyone, let's start our project meeting. We need to complete the website redesign by Friday.
Alice Smith: I'll handle the homepage mockups and send them by Thursday.
John Doe: Great! Also, we need to schedule a client review meeting for next Monday at 2 PM.
Alice Smith: I'll send the calendar invite today. Should we prepare a presentation?
John Doe: Yes, let's create a 10-slide presentation. I'll take slides 1-5, you handle 6-10.
Alice Smith: Perfect. I'll also follow up with the development team about technical requirements.`,
            chatMessages: `Alice Smith: Can you share the project timeline?
John Doe: I'll upload it to the shared drive after the meeting.
Alice Smith: Don't forget we have the client deadline on February 20th.`,
            userEmail: session.user.email
        };

        // Send to our webhook endpoint
        const webhookUrl = `${request.nextUrl.origin}/api/gmeet/webhook-public`;
        
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPayload)
        });

        const result = await response.json();

        return NextResponse.json({
            success: true,
            message: "Test webhook sent successfully",
            webhookResponse: result,
            testPayload: testPayload
        });

    } catch (error) {
        console.error("Test webhook error:", error);
        return NextResponse.json(
            {
                error: "Failed to send test webhook",
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}