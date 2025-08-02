import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({
                error: "Not authenticated"
            }, { status: 401 });
        }

        // Get all pending tasks (TODO, IN_PROGRESS, WAITING)
        const client = await clientPromise;
        const db = client.db("zenchron");
        const tasksCollection = db.collection("tasks");

        const pendingTasks = await tasksCollection.find({
            userId: session.user.email,
            status: { $in: ['TODO', 'IN_PROGRESS', 'WAITING'] }
        }).sort({ priority: -1, dueDate: 1, createdAt: 1 }).toArray();

        console.log(`Found ${pendingTasks.length} pending tasks for user: ${session.user.email}`);

        // Return mock analysis data for testing
        const mockAnalysis = {
            success: true,
            tasksAnalyzed: pendingTasks.length,
            analysis: {
                totalTasks: pendingTasks.length,
                criticalTasks: Math.floor(pendingTasks.length * 0.2),
                urgentTasks: Math.floor(pendingTasks.length * 0.3),
                blockedTasks: Math.floor(pendingTasks.length * 0.1),
                estimatedTotalTime: pendingTasks.reduce((sum, task) => sum + (task.estimatedDuration || 60), 0),
                keyInsights: [
                    "You have a good mix of high and medium priority tasks",
                    "Most tasks have reasonable time estimates",
                    "Consider batching similar tasks together for efficiency"
                ],
                recommendations: [
                    "Start with the highest priority tasks first",
                    "Block time for deep work tasks",
                    "Set up calendar events for important deadlines"
                ]
            },
            executionPlan: {
                strategy: "Focus on high-priority tasks first, then batch similar work types together for maximum efficiency.",
                phases: [
                    {
                        name: "Phase 1: Critical Tasks",
                        description: "Handle urgent and important tasks immediately",
                        duration: "2-3 hours",
                        taskIds: pendingTasks.slice(0, 2).map(t => t._id.toString()),
                        reasoning: "These tasks have the highest impact and urgency"
                    },
                    {
                        name: "Phase 2: Planned Work",
                        description: "Work on important but less urgent tasks",
                        duration: "4-5 hours",
                        taskIds: pendingTasks.slice(2, 5).map(t => t._id.toString()),
                        reasoning: "These tasks require focused attention but have more flexible timing"
                    }
                ],
                riskFactors: [
                    "Task dependencies might cause delays",
                    "Interruptions could disrupt deep work sessions"
                ],
                successMetrics: [
                    "Complete all critical tasks by end of day",
                    "Make progress on at least 3 planned tasks"
                ]
            },
            timetable: pendingTasks.slice(0, 5).map((task, index) => ({
                timeSlot: `${9 + index * 2}:00 AM - ${11 + index * 2}:00 AM`,
                taskId: task._id.toString(),
                taskTitle: task.title,
                action: `Work on: ${task.title}`,
                priority: task.priority >= 4 ? 'HIGH' : task.priority >= 3 ? 'MEDIUM' : 'LOW',
                reasoning: `Optimal time for ${task.type} type work`,
                preparationNeeded: "Gather necessary materials and eliminate distractions",
                expectedOutcome: `Complete or make significant progress on ${task.title}`
            })),
            priorityMatrix: {
                doFirst: pendingTasks.filter(t => t.priority >= 4).slice(0, 3).map(task => ({
                    taskId: task._id.toString(),
                    taskTitle: task.title,
                    reasoning: "High priority task requiring immediate attention"
                })),
                schedule: pendingTasks.filter(t => t.priority === 3).slice(0, 3).map(task => ({
                    taskId: task._id.toString(),
                    taskTitle: task.title,
                    reasoning: "Important task that can be scheduled for later"
                })),
                delegate: [],
                eliminate: []
            },
            generatedAt: new Date().toISOString(),
            message: `Successfully analyzed ${pendingTasks.length} pending tasks and generated execution plan`
        };

        return NextResponse.json(mockAnalysis);

    } catch (error) {
        console.error("Test analysis error:", error);
        return NextResponse.json(
            {
                error: "Failed to test analysis",
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}