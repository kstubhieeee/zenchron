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
        const slackSyncCollection = db.collection("slack_sync_state");

        const syncState = await slackSyncCollection.findOne({
            userId: session.user.email,
            type: 'slack_messages'
        });

        return NextResponse.json({
            hasSynced: !!syncState,
            lastSync: syncState?.lastSyncAt || null,
            lastMessageTimestamp: syncState?.lastMessageTimestamp || null,
            messagesProcessed: syncState?.messagesProcessed || 0,
            tasksExtracted: syncState?.tasksExtracted || 0
        });

    } catch (error) {
        console.error("Get sync state error:", error);
        return NextResponse.json(
            {
                error: "Failed to get sync state",
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}