import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({
                error: "Not authenticated"
            }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db("zenchron");
        const meetingsCollection = db.collection("gmeet_meetings");

        // Get recent meetings for this user (last 50)
        const meetings = await meetingsCollection
            .find({ userEmail: session.user.email })
            .sort({ processedAt: -1 })
            .limit(50)
            .toArray();

        return NextResponse.json({
            meetings: meetings.map(meeting => ({
                _id: meeting._id,
                meetingTitle: meeting.meetingTitle,
                meetingStartTimestamp: meeting.meetingStartTimestamp,
                meetingEndTimestamp: meeting.meetingEndTimestamp,
                tasksExtracted: meeting.tasksExtracted,
                processedAt: meeting.processedAt,
                transcriptLength: meeting.transcriptLength,
                chatMessagesLength: meeting.chatMessagesLength
            })),
            totalMeetings: meetings.length
        });

    } catch (error) {
        console.error("Get meetings error:", error);
        return NextResponse.json(
            {
                error: "Failed to get meetings",
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}