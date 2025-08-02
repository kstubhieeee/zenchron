import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { google } from "googleapis";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { TaskStatus } from "@/lib/models/Task";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        console.log("Session:", session ? "exists" : "null");
        console.log("Access token:", session?.accessToken ? "exists" : "missing");

        if (!session?.accessToken || !session?.user?.email) {
            return NextResponse.json({
                error: "Not authenticated",
                details: "No access token or user email found in session"
            }, { status: 401 });
        }

        // Initialize Gmail API
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: session.accessToken });

        const gmail = google.gmail({ version: "v1", auth: oauth2Client });

        console.log("Setting up Gmail labels...");

        // Create or get the "ZenchronProcessed" label
        let processedLabelId = await getOrCreateLabel(gmail, "ZenchronProcessed");
        console.log("Processed label ID:", processedLabelId);

        console.log("Fetching emails from Gmail API...");

        // Fetch recent emails that haven't been processed yet (for new processing)
        const newEmailsResponse = await gmail.users.messages.list({
            userId: "me",
            maxResults: 20,
            q: `(is:unread OR newer_than:7d) -label:ZenchronProcessed`, // Exclude already processed emails
        });

        // Also fetch already processed emails for display (last 30 days)
        const processedEmailsResponse = await gmail.users.messages.list({
            userId: "me",
            maxResults: 50,
            q: `newer_than:30d label:ZenchronProcessed`, // Only processed emails from last 30 days
        });

        console.log("New emails to process:", newEmailsResponse.data.messages?.length || 0);
        console.log("Already processed emails:", processedEmailsResponse.data.messages?.length || 0);

        const newEmails = newEmailsResponse.data.messages || [];
        const processedEmails = processedEmailsResponse.data.messages || [];

        if (newEmails.length === 0 && processedEmails.length === 0) {
            return NextResponse.json({
                workEmails: [],
                processedWorkEmails: [],
                totalFetched: 0,
                workEmailsCount: 0,
                tasksCreated: 0,
                processedEmailsCount: 0
            });
        }

        // Get detailed email data for new emails
        const newEmailPromises = newEmails.map(async (message) => {
            const emailData = await gmail.users.messages.get({
                userId: "me",
                id: message.id!,
                format: "full",
            });

            const headers = emailData.data.payload?.headers || [];
            const subject = headers.find(h => h.name === "Subject")?.value || "";
            const from = headers.find(h => h.name === "From")?.value || "";
            const date = headers.find(h => h.name === "Date")?.value || "";

            // Get email body
            let body = "";
            const payload = emailData.data.payload;

            if (payload?.body?.data) {
                body = Buffer.from(payload.body.data, "base64").toString();
            } else if (payload?.parts) {
                const textPart = payload.parts.find(part => part.mimeType === "text/plain");
                if (textPart?.body?.data) {
                    body = Buffer.from(textPart.body.data, "base64").toString();
                }
            }

            // Clean and truncate body for AI processing
            body = body.replace(/<[^>]*>/g, "").substring(0, 1000);

            return {
                id: message.id,
                subject,
                from,
                date,
                body,
                snippet: emailData.data.snippet || "",
                labels: emailData.data.labelIds || [],
                isProcessed: false
            };
        });

        // Get detailed email data for already processed emails
        const processedEmailPromises = processedEmails.map(async (message) => {
            const emailData = await gmail.users.messages.get({
                userId: "me",
                id: message.id!,
                format: "full",
            });

            const headers = emailData.data.payload?.headers || [];
            const subject = headers.find(h => h.name === "Subject")?.value || "";
            const from = headers.find(h => h.name === "From")?.value || "";
            const date = headers.find(h => h.name === "Date")?.value || "";

            return {
                id: message.id,
                subject,
                from,
                date,
                snippet: emailData.data.snippet || "",
                labels: emailData.data.labelIds || [],
                isProcessed: true,
                extractedTasks: [] // We'll try to get this from database
            };
        });

        const newEmailsData = await Promise.all(newEmailPromises);
        const processedEmailsData = await Promise.all(processedEmailPromises);
        
        console.log("New emails to process:", newEmailsData.length);
        console.log("Already processed emails:", processedEmailsData.length);

        // For processed emails, try to get their tasks from the database
        const client = await clientPromise;
        const db = client.db("zenchron");
        const tasksCollection = db.collection("tasks");

        for (const email of processedEmailsData) {
            try {
                const tasks = await tasksCollection.find({
                    userId: session.user.email,
                    source: 'gmail',
                    'metadata.emailId': email.id
                }).toArray();
                
                email.extractedTasks = tasks.map(task => ({
                    title: task.title,
                    description: task.description,
                    type: task.type,
                    priority: task.priority,
                    dueDate: task.dueDate,
                    scheduledTime: task.scheduledTime,
                    tags: task.tags
                }));
            } catch (error) {
                console.error(`Failed to get tasks for email ${email.id}:`, error);
                email.extractedTasks = [];
            }
        }

        if (!process.env.GEMINI_API_KEY) {
            console.log("No Gemini API key found, skipping AI processing");
            return NextResponse.json({
                workEmails: [],
                processedWorkEmails: processedEmailsData.filter(email => email.extractedTasks.length > 0),
                totalFetched: newEmailsData.length,
                workEmailsCount: 0,
                tasksCreated: 0,
                processedEmailsCount: processedEmailsData.length,
                error: "Gemini API key not configured"
            });
        }

        console.log("Starting AI classification and task extraction for new emails...");

        // Use Gemini to classify NEW emails and extract tasks
        const processEmailPromises = newEmailsData.map(async (email) => {
            const prompt = `You are an AI assistant that analyzes emails and extracts actionable tasks. Analyze this email and return a JSON response.

Email Details:
Subject: ${email.subject}
From: ${email.from}
Date: ${email.date}
Content: ${email.snippet}
Body: ${email.body.substring(0, 800)}

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

        const aiProcessedEmails = await Promise.all(processEmailPromises);

        // Filter work-related emails with tasks
        const workEmailsWithTasks = aiProcessedEmails.filter(email => 
            email.isWorkRelated && email.hasTasks && email.extractedTasks.length > 0
        );

        console.log(`Found ${workEmailsWithTasks.length} work emails with tasks`);

        // Create tasks in MongoDB for NEW emails only
        let tasksCreated = 0;

        for (const email of workEmailsWithTasks) {
            for (const task of email.extractedTasks) {
                try {
                    const taskDoc = {
                        userId: session.user.email,
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

                    await tasksCollection.insertOne(taskDoc);
                    tasksCreated++;
                    console.log(`Created task: ${task.title}`);
                } catch (error) {
                    console.error(`Failed to create task from email ${email.id}:`, error);
                }
            }
        }

        // Label newly processed emails
        const labelPromises = aiProcessedEmails.map(async (email) => {
            try {
                await gmail.users.messages.modify({
                    userId: "me",
                    id: email.id,
                    requestBody: {
                        addLabelIds: [processedLabelId]
                    }
                });
                console.log(`Labeled email ${email.id} as processed`);
            } catch (error) {
                console.error(`Failed to label email ${email.id}:`, error);
            }
        });

        await Promise.all(labelPromises);

        // Filter processed emails that have tasks
        const processedWorkEmails = processedEmailsData.filter(email => 
            email.extractedTasks && email.extractedTasks.length > 0
        );

        return NextResponse.json({
            workEmails: workEmailsWithTasks, // New emails with tasks
            processedWorkEmails: processedWorkEmails, // Already processed emails with tasks
            totalFetched: newEmailsData.length,
            workEmailsCount: workEmailsWithTasks.length,
            tasksCreated,
            processedEmailsCount: processedWorkEmails.length,
            totalProcessedEmails: processedEmailsData.length
        });

    } catch (error) {
        console.error("Gmail sync error:", error);

        let errorMessage = "Failed to sync emails";
        let errorDetails = "";

        if (error instanceof Error) {
            errorMessage = error.message;
            errorDetails = error.stack || "";
        }

        return NextResponse.json(
            {
                error: errorMessage,
                details: errorDetails,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

// Helper function to get or create a Gmail label
async function getOrCreateLabel(gmail: any, labelName: string): Promise<string> {
    try {
        // First, try to find existing label
        const labelsResponse = await gmail.users.labels.list({
            userId: "me"
        });

        const existingLabel = labelsResponse.data.labels?.find(
            (label: any) => label.name === labelName
        );

        if (existingLabel) {
            return existingLabel.id;
        }

        // Create new label if it doesn't exist
        const createResponse = await gmail.users.labels.create({
            userId: "me",
            requestBody: {
                name: labelName,
                labelListVisibility: "labelShow",
                messageListVisibility: "show"
            }
        });

        return createResponse.data.id;
    } catch (error) {
        console.error("Error managing Gmail label:", error);
        throw error;
    }
}