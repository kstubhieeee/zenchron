import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { Task, TaskStatus } from "@/lib/models/Task";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');

    const client = await clientPromise;
    const db = client.db("zenchron");
    const collection = db.collection<Task>("tasks");

    // Build query
    const query: any = { userId: session.user.email };
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
    console.log('Tasks POST API called');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.email);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskData = await request.json();
    console.log('Task data received:', taskData);

    // Validate required fields
    if (!taskData.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db("zenchron");
    const collection = db.collection<Task>("tasks");
    console.log('MongoDB connected successfully');

    const task: Omit<Task, '_id'> = {
      userId: session.user.email,
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

    console.log('Inserting task into MongoDB:', task);
    const result = await collection.insertOne(task);
    console.log('Task inserted successfully, ID:', result.insertedId);

    const responseTask = {
      ...task,
      _id: result.insertedId.toString()
    };

    console.log('Returning created task:', responseTask);
    return NextResponse.json({
      task: responseTask
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      { _id: new ObjectId(_id), userId: session.user.email },
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      userId: session.user.email
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