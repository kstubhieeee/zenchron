import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const body = await request.json();
        const { pageIds } = body;

        if (!session?.user?.email) {
            return NextResponse.json({
                error: "Not authenticated"
            }, { status: 401 });
        }

        if (!pageIds || !Array.isArray(pageIds)) {
            return NextResponse.json({
                error: "Page IDs array is required"
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("zenchron");
        const processedPagesCollection = db.collection("processed_notion_pages");

        // Find all processed pages for this user
        const processedPages = await processedPagesCollection.find({
            userId: session.user.email,
            pageId: { $in: pageIds }
        }).toArray();

        const processedPageIds = processedPages.map(page => page.pageId);

        return NextResponse.json({
            processedPageIds,
            processedPages: processedPages.map(page => ({
                pageId: page.pageId,
                pageTitle: page.pageTitle,
                tasksExtracted: page.tasksExtracted,
                processedAt: page.processedAt
            }))
        });

    } catch (error) {
        console.error("Check processed pages error:", error);
        return NextResponse.json(
            {
                error: "Failed to check processed pages",
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}