import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("zenchron");
    const collection = db.collection("tasks");

    const tasks = await collection
      .find({ userId: "test@example.com" })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      success: true,
      tasks: tasks.map(task => ({
        ...task,
        _id: task._id.toString()
      })),
      count: tasks.length
    });

  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tasks",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}