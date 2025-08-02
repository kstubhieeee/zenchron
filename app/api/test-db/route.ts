import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("zenchron");
    
    // Test connection
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful",
      database: "zenchron",
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to MongoDB",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}