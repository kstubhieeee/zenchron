import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { WebClient } from '@slack/web-api';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { TaskStatus } from "@/lib/models/Task";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const body = await request.json();
        const { token } = body;

        if (!session?.user?.email) {
            return NextResponse.json({
                error: "Not authenticated",
                details: "User session not found"
            }, { status: 401 });
        }

        if (!token) {
            return NextResponse.json({
                error: "Slack token is required"
            }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                error: "Gemini API key not configured"
            }, { status: 500 });
        }

        const slack = new WebClient(token);

        console.log("Starting Slack task extraction...");

        // Get user info to find the current user's ID
        const authTest = await slack.auth.test();
        const botUserId = authTest.user_id;
        const humanUserId = 'U09923DMKCZ'; // Your human user ID

        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db("zenchron");
        const tasksCollection = db.collection("tasks");
        const slackSyncCollection = db.collection("slack_sync_state");

        // Get the last sync timestamp for this user
        const lastSync = await slackSyncCollection.findOne({
            userId: session.user.email,
            type: 'slack_messages'
        });

        // Calculate the timestamp to fetch from (last sync + 1 second, or 7 days ago if first sync)
        let oldestTimestamp: string;
        if (lastSync && lastSync.lastMessageTimestamp) {
            // Add 1 second to the last processed timestamp to avoid duplicates
            const lastTs = parseFloat(lastSync.lastMessageTimestamp);
            oldestTimestamp = (lastTs + 1).toString();
            console.log(`Incremental sync from: ${new Date(lastTs * 1000).toISOString()}`);
        } else {
            // First sync - get messages from last 7 days
            const sevenDaysAgo = Math.floor((Date.now() - (7 * 24 * 60 * 60 * 1000)) / 1000);
            oldestTimestamp = sevenDaysAgo.toString();
            console.log(`First sync from: ${new Date(sevenDaysAgo * 1000).toISOString()}`);
        }

        const relevantMessages: any[] = [];
        const debugInfo: any[] = [];
        let latestTimestamp = oldestTimestamp;

        // Known channels to check (you can expand this list)
        const channelsToCheck = [
            { id: 'C09923E7LC9', name: 'all-kstubhie' }
            // Add more channels as needed
        ];

        for (const channel of channelsToCheck) {
            try {
                console.log(`Checking channel: ${channel.name} from timestamp: ${oldestTimestamp}`);
                
                const messagesResponse = await slack.conversations.history({
                    channel: channel.id,
                    oldest: oldestTimestamp,
                    limit: 50 // Reasonable limit
                });

                if (messagesResponse.messages && messagesResponse.messages.length > 0) {
                    // Filter for messages that might contain tasks or mentions
                    const taskMessages = messagesResponse.messages
                        .filter((message: any) => {
                            // Include messages that:
                            // 1. Mention the user
                            // 2. Contain task-related keywords
                            // 3. Are not from the user themselves
                            const mentionsUser = message.text?.includes(`<@${humanUserId}>`);
                            const hasTaskKeywords = message.text && (
                                message.text.toLowerCase().includes('todo') ||
                                message.text.toLowerCase().includes('task') ||
                                message.text.toLowerCase().includes('action') ||
                                message.text.toLowerCase().includes('need to') ||
                                message.text.toLowerCase().includes('should') ||
                                message.text.toLowerCase().includes('must') ||
                                message.text.toLowerCase().includes('deadline') ||
                                message.text.toLowerCase().includes('due') ||
                                message.text.toLowerCase().includes('follow up') ||
                                message.text.toLowerCase().includes('reminder')
                            );
                            const isFromUser = message.user === humanUserId || message.user === botUserId;
                            
                            return (mentionsUser || hasTaskKeywords) && !isFromUser && message.text;
                        })
                        .map((message: any) => ({
                            ...message,
                            channel_id: channel.id,
                            channel_name: channel.name,
                            channel_type: 'channel'
                        }));

                    relevantMessages.push(...taskMessages);
                    
                    // Update latest timestamp
                    if (messagesResponse.messages.length > 0) {
                        const channelLatest = Math.max(...messagesResponse.messages.map((m: any) => parseFloat(m.ts)));
                        if (channelLatest > parseFloat(latestTimestamp)) {
                            latestTimestamp = channelLatest.toString();
                        }
                    }

                    debugInfo.push({
                        channel: channel.name,
                        messageCount: taskMessages.length,
                        totalMessages: messagesResponse.messages.length,
                        type: 'channel'
                    });
                } else {
                    debugInfo.push({
                        channel: channel.name,
                        messageCount: 0,
                        totalMessages: 0,
                        type: 'channel'
                    });
                }
            } catch (error) {
                console.error(`Error fetching from channel ${channel.name}:`, error);
                debugInfo.push({
                    channel: channel.name,
                    messageCount: 0,
                    type: 'channel',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        console.log(`Found ${relevantMessages.length} relevant messages for task extraction`);

        if (relevantMessages.length === 0) {
            // Update sync state even if no messages found
            await slackSyncCollection.updateOne(
                { userId: session.user.email, type: 'slack_messages' },
                { 
                    $set: { 
                        lastMessageTimestamp: latestTimestamp,
                        lastSyncAt: new Date(),
                        messagesProcessed: 0
                    }
                },
                { upsert: true }
            );

            return NextResponse.json({
                success: true,
                messagesProcessed: 0,
                tasksExtracted: 0,
                tasks: [],
                debug: debugInfo,
                syncInfo: {
                    lastTimestamp: latestTimestamp,
                    isIncremental: !!lastSync
                }
            });
        }

        // Sort messages by timestamp (oldest first for processing)
        relevantMessages.sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts));

        // Get user info for message authors
        const userIds = [...new Set(relevantMessages.map(msg => msg.user))].filter(Boolean);
        const usersInfo: any = {};

        for (const uid of userIds) {
            try {
                const userInfo = await slack.users.info({ user: uid });
                if (userInfo.user) {
                    usersInfo[uid] = userInfo.user;
                }
            } catch (error) {
                console.error(`Error fetching user info for ${uid}:`, error);
            }
        }

        // Process messages with AI to extract tasks
        let tasksCreated = 0;
        const createdTasks = [];

        for (const message of relevantMessages) {
            const userInfo = usersInfo[message.user];
            const userName = userInfo?.real_name || userInfo?.name || 'Unknown User';
            const messageDate = new Date(parseFloat(message.ts) * 1000).toISOString();

            const prompt = `You are an AI assistant that analyzes Slack messages and extracts actionable tasks. Analyze this message and return a JSON response.

Message Details:
From: ${userName}
Channel: ${message.channel_name}
Date: ${messageDate}
Content: ${message.text}

Analyze the message and extract actionable tasks. Look for:
- Direct requests or assignments
- Action items mentioned
- Deadlines and due dates
- Follow-up tasks
- Things that need to be done
- Mentions of "need to", "should", "must", "action", "task", "todo"
- Meeting follow-ups or decisions

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
  "hasTasks": true/false,
  "tasks": [
    {
      "title": "Task title (concise, actionable)",
      "description": "Detailed description including context from message",
      "type": "task_type_from_list_above",
      "priority": 1-5,
      "dueDate": "ISO date string or null",
      "scheduledTime": "ISO date string or null",
      "estimatedDuration": 30,
      "tags": ["slack", "relevant", "tags"],
      "source": "slack",
      "metadata": {
        "messageId": "${message.ts}",
        "channelId": "${message.channel_id}",
        "channelName": "${message.channel_name}",
        "fromUser": "${userName}",
        "messageDate": "${messageDate}"
      }
    }
  ]
}

If no actionable tasks are found, return empty tasks array.
Focus on extracting meaningful, actionable tasks rather than general conversation.`;

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
                    console.log(`No valid JSON found in AI response for message ${message.ts}`);
                    continue;
                }

                const analysis = JSON.parse(jsonMatch[0]);
                const extractedTasks = analysis.tasks || [];

                // Create tasks in MongoDB
                for (const task of extractedTasks) {
                    try {
                        const taskDoc = {
                            userId: session.user.email,
                            title: task.title,
                            description: task.description || '',
                            type: task.type || 'custom',
                            priority: Math.max(1, Math.min(5, task.priority || 2)),
                            status: TaskStatus.TODO,
                            source: 'slack',
                            dueDate: task.dueDate ? new Date(task.dueDate) : null,
                            scheduledTime: task.scheduledTime ? new Date(task.scheduledTime) : null,
                            estimatedDuration: task.estimatedDuration || 30,
                            tags: task.tags || ['slack'],
                            metadata: {
                                messageId: message.ts,
                                channelId: message.channel_id,
                                channelName: message.channel_name,
                                fromUser: userName,
                                messageDate: messageDate,
                                ...task.metadata
                            },
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };

                        const insertResult = await tasksCollection.insertOne(taskDoc);
                        tasksCreated++;
                        createdTasks.push({
                            id: insertResult.insertedId,
                            ...task
                        });
                        console.log(`Created task: ${task.title} from message by ${userName}`);
                    } catch (error) {
                        console.error(`Failed to create task from message ${message.ts}:`, error);
                    }
                }

            } catch (aiError) {
                console.error(`AI processing failed for message ${message.ts}:`, aiError);
            }
        }

        // Update sync state with the latest timestamp
        await slackSyncCollection.updateOne(
            { userId: session.user.email, type: 'slack_messages' },
            { 
                $set: { 
                    lastMessageTimestamp: latestTimestamp,
                    lastSyncAt: new Date(),
                    messagesProcessed: relevantMessages.length,
                    tasksExtracted: tasksCreated
                }
            },
            { upsert: true }
        );

        return NextResponse.json({
            success: true,
            messagesProcessed: relevantMessages.length,
            tasksExtracted: tasksCreated,
            tasks: createdTasks,
            debug: debugInfo,
            syncInfo: {
                lastTimestamp: latestTimestamp,
                isIncremental: !!lastSync,
                syncedFrom: new Date(parseFloat(oldestTimestamp) * 1000).toISOString(),
                syncedTo: new Date(parseFloat(latestTimestamp) * 1000).toISOString()
            }
        });

    } catch (error) {
        console.error("Slack task extraction error:", error);

        let errorMessage = "Failed to extract tasks from Slack messages";
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