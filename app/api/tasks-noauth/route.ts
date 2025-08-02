import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Task, TaskStatus } from "@/lib/models/Task";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');

    const client = await clientPromise;
    const db = client.db("zenchron");
    const collection = db.collection<Task>("tasks");

    // Build query - using test user for now
    const query: any = { userId: "test@example.com" };
    if (status) query.status = status;
    if (type) query.type = type;

    const tasks = await collection
      .find(query)
      .sort({ 
        priority: -1, // Higher priority first
        scheduledTime: 1, // Earlier scheduled time first
        createdAt: -1 // Newer tasks first
      })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      tasks: tasks.map(task => ({
        ...task,
        _id: task._id?.toString()
      })),
      total: tasks.length
    });

  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const taskData = await request.json();

    // Validate required fields
    if (!taskData.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("zenchron");
    const collection = db.collection<Task>("tasks");

    const task: Omit<Task, '_id'> = {
      userId: "test@example.com", // Using test user
      title: taskData.title,
      description: taskData.description || '',
      type: taskData.type || 'custom',
      priority: taskData.priority || 2,
      status: taskData.status || TaskStatus.TODO,
      source: taskData.source || 'manual',
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      scheduledTime: taskData.scheduledTime ? new Date(taskData.scheduledTime) : undefined,
      estimatedDuration: taskData.estimatedDuration || 30,
      tags: taskData.tags || [],
      metadata: taskData.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(task);

    return NextResponse.json({
      task: {
        ...task,
        _id: result.insertedId.toString()
      }
    });

  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { _id, ...updateData } = await request.json();

    if (!_id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("zenchron");
    const collection = db.collection<Task>("tasks");

    const update: any = {
      ...updateData,
      updatedAt: new Date()
    };

    // Handle date fields
    if (updateData.dueDate) update.dueDate = new Date(updateData.dueDate);
    if (updateData.scheduledTime) update.scheduledTime = new Date(updateData.scheduledTime);
    if (updateData.status === TaskStatus.DONE && !updateData.completedAt) {
      update.completedAt = new Date();
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(_id), userId: "test@example.com" },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("zenchron");
    const collection = db.collection<Task>("tasks");

    const result = await collection.deleteOne({
      _id: new ObjectId(taskId),
      userId: "test@example.com"
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}