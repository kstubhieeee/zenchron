import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import clientPromise from "@/lib/mongodb";
import { TaskStatus } from "@/lib/models/Task";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Mock email data for testing
const mockEmails = [
  {
    id: "test-email-1",
    subject: "Urgent: Project deadline moved to Friday",
    from: "manager@company.com",
    date: new Date().toISOString(),
    snippet: "Hi team, we need to move the project deadline to this Friday. Please review the requirements and let me know if you can meet the new timeline.",
    body: "Hi team, we need to move the project deadline to this Friday. Please review the requirements and let me know if you can meet the new timeline. The client is expecting the deliverables by end of day Friday. Thanks!"
  },
  {
    id: "test-email-2", 
    subject: "Meeting request: Q4 Planning Session",
    from: "sarah@company.com",
    date: new Date().toISOString(),
    snippet: "Can we schedule a meeting for next Tuesday at 2 PM to discuss Q4 planning? Please confirm your availability.",
    body: "Can we schedule a meeting for next Tuesday at 2 PM to discuss Q4 planning? We need to review the budget, set goals, and assign responsibilities. Please confirm your availability and let me know if you have any agenda items to add."
  },
  {
    id: "test-email-3",
    subject: "Follow up on client proposal",
    from: "client@external.com", 
    date: new Date().toISOString(),
    snippet: "Hi, just following up on the proposal we sent last week. Do you have any questions or feedback?",
    body: "Hi, just following up on the proposal we sent last week. Do you have any questions or feedback? We're excited to move forward with this project and would love to hear your thoughts. Please let me know when you have a chance to review."
  }
];

export async function POST() {
  try {
    console.log("Starting Gmail test sync with mock data...");

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        error: "Gemini API key not configured"
      }, { status: 500 });
    }

    console.log("Processing mock emails with AI...");

    // Process each mock email with AI
    const processEmailPromises = mockEmails.map(async (email) => {
      const prompt = `You are an AI assistant that analyzes emails and extracts actionable tasks. Analyze this email and return a JSON response.

Email Details:
Subject: ${email.subject}
From: ${email.from}
Date: ${email.date}
Content: ${email.snippet}
Body: ${email.body}

First, determine if this email is work-related and contains actionable tasks.

Work-related emails with tasks typically include:
- Meeting requests requiring response or preparation
- Project deadlines or deliverables mentioned
- Action items or follow-ups requested
- Client requests requiring response
- Task assignments or work coordination
- Deadlines mentioned with specific dates
- Requests for information, documents, or actions
- Review requests or approval needed

Task Types (use these exact values):
- follow_up: Follow-up tasks, mentions, questions requiring response
- quick_win: Simple, short tasks that can be done quickly
- high_priority: Urgent tasks with "ASAP", "urgent", "important"
- deep_work: Complex tasks requiring focused attention
- deadline_based: Tasks with specific due dates or deadlines
- recurring: Repeating tasks, habits, regular activities
- scheduled_event: Time-specific events, meetings, appointments
- reference_info: Information for reference only, no action required
- waiting_blocked: Tasks waiting for external input or blocked

Return ONLY a valid JSON object with this structure:
{
  "isWorkRelated": true/false,
  "hasTasks": true/false,
  "tasks": [
    {
      "title": "Task title (concise, actionable)",
      "description": "Detailed description including context from email",
      "type": "task_type_from_list_above",
      "priority": 1-5,
      "dueDate": "ISO date string or null",
      "scheduledTime": "ISO date string or null",
      "estimatedDuration": 30,
      "tags": ["email", "relevant", "tags"],
      "source": "gmail",
      "metadata": {
        "emailId": "${email.id}",
        "emailSubject": "${email.subject}",
        "emailFrom": "${email.from}"
      }
    }
  ]
}

If no actionable tasks are found, return empty tasks array.
If not work-related, set isWorkRelated to false and empty tasks array.`;

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(`AI response for email ${email.id}:`, text);

        // Extract JSON from response
        let jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
          if (jsonMatch) {
            jsonMatch[0] = jsonMatch[1];
          }
        }

        if (!jsonMatch) {
          throw new Error("No valid JSON found in AI response");
        }

        const analysis = JSON.parse(jsonMatch[0]);

        return {
          ...email,
          isWorkRelated: analysis.isWorkRelated || false,
          hasTasks: analysis.hasTasks || false,
          extractedTasks: analysis.tasks || []
        };
      } catch (error) {
        console.error(`Failed to process email ${email.id}:`, error);
        return {
          ...email,
          isWorkRelated: false,
          hasTasks: false,
          extractedTasks: []
        };
      }
    });

    const processedEmails = await Promise.all(processEmailPromises);

    // Filter work-related emails with tasks
    const workEmailsWithTasks = processedEmails.filter(email => 
      email.isWorkRelated && email.hasTasks && email.extractedTasks.length > 0
    );

    console.log(`Found ${workEmailsWithTasks.length} work emails with tasks`);

    // Create tasks in MongoDB
    let tasksCreated = 0;
    const client = await clientPromise;
    const db = client.db("zenchron");
    const collection = db.collection("tasks");

    for (const email of workEmailsWithTasks) {
      for (const task of email.extractedTasks) {
        try {
          const taskDoc = {
            userId: "test@example.com", // Test user
            title: task.title,
            description: task.description || '',
            type: task.type || 'custom',
            priority: Math.max(1, Math.min(5, task.priority || 2)),
            status: TaskStatus.TODO,
            source: 'gmail',
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            scheduledTime: task.scheduledTime ? new Date(task.scheduledTime) : null,
            estimatedDuration: task.estimatedDuration || 30,
            tags: task.tags || ['email'],
            metadata: task.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const result = await collection.insertOne(taskDoc);
          tasksCreated++;
          console.log(`Created task: ${task.title} (ID: ${result.insertedId})`);
        } catch (error) {
          console.error(`Failed to create task from email ${email.id}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Gmail test sync completed successfully",
      workEmails: workEmailsWithTasks,
      totalFetched: mockEmails.length,
      workEmailsCount: workEmailsWithTasks.length,
      tasksCreated,
      processedEmails: processedEmails.length,
      details: {
        processedEmails: processedEmails.map(email => ({
          id: email.id,
          subject: email.subject,
          isWorkRelated: email.isWorkRelated,
          hasTasks: email.hasTasks,
          taskCount: email.extractedTasks.length
        }))
      }
    });

  } catch (error) {
    console.error("Gmail test sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gmail test sync failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}