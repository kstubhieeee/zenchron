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
        const tasksCollection = db.collection("tasks");

        // Get all tasks for this user
        const allTasks = await tasksCollection.find({
            userId: session.user.email
        }).toArray();

        // Group by status
        const tasksByStatus = {
            TODO: allTasks.filter(t => t.status === 'TODO'),
            IN_PROGRESS: allTasks.filter(t => t.status === 'IN_PROGRESS'),
            WAITING: allTasks.filter(t => t.status === 'WAITING'),
            DONE: allTasks.filter(t => t.status === 'DONE')
        };

        const pendingTasks = [...tasksByStatus.TODO, ...tasksByStatus.IN_PROGRESS, ...tasksByStatus.WAITING];

        return NextResponse.json({
            success: true,
            totalTasks: allTasks.length,
            pendingTasks: pendingTasks.length,
            tasksByStatus: {
                TODO: tasksByStatus.TODO.length,
                IN_PROGRESS: tasksByStatus.IN_PROGRESS.length,
                WAITING: tasksByStatus.WAITING.length,
                DONE: tasksByStatus.DONE.length
            },
            sampleTasks: allTasks.slice(0, 5).map(task => ({
                id: task._id.toString(),
                title: task.title,
                status: task.status,
                priority: task.priority,
                type: task.type,
                createdAt: task.createdAt
            }))
        });

    } catch (error) {
        console.error("Check tasks error:", error);
        return NextResponse.json(
            {
                error: "Failed to check tasks",
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}