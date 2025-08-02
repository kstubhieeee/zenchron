import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Client } from '@notionhq/client';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { TaskStatus } from "@/lib/models/Task";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const body = await request.json();
        const { pageId, token } = body;

        if (!session?.user?.email) {
            return NextResponse.json({
                error: "Not authenticated",
                details: "User session not found"
            }, { status: 401 });
        }

        if (!pageId) {
            return NextResponse.json({
                error: "Page ID is required"
            }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                error: "Gemini API key not configured"
            }, { status: 500 });
        }

        // Use OAuth token if provided, otherwise fall back to internal integration
        let authToken = token;
        if (!authToken) {
            authToken = process.env.NOTION_INTERNAL_SECRET;
            if (!authToken) {
                return NextResponse.json({ 
                    error: "No Notion token provided and internal secret not configured" 
                }, { status: 500 });
            }
        }

        const notion = new Client({ auth: authToken });

        console.log(`Extracting tasks from Notion page: ${pageId}`);

        // Check if this page has already been processed
        const client = await clientPromise;
        const db = client.db("zenchron");
        const processedPagesCollection = db.collection("processed_notion_pages");
        const tasksCollection = db.collection("tasks");

        const existingProcessed = await processedPagesCollection.findOne({
            userId: session.user.email,
            pageId: pageId
        });

        if (existingProcessed) {
            // Get existing tasks for this page
            const existingTasks = await tasksCollection.find({
                userId: session.user.email,
                source: 'notion',
                'metadata.pageId': pageId
            }).toArray();

            return NextResponse.json({
                alreadyProcessed: true,
                message: "This page has already been processed",
                processedAt: existingProcessed.processedAt,
                existingTasks: existingTasks.map(task => ({
                    title: task.title,
                    description: task.description,
                    type: task.type,
                    priority: task.priority,
                    dueDate: task.dueDate,
                    scheduledTime: task.scheduledTime,
                    tags: task.tags
                })),
                tasksCount: existingTasks.length
            });
        }

        // Get page details and content
        const page = await notion.pages.retrieve({ page_id: pageId });
        const blocks = await notion.blocks.children.list({
            block_id: pageId,
            page_size: 100,
        });

        // Process blocks to extract readable content
        const content = await processBlocks(blocks.results, notion);
        const pageTitle = getPageTitle(page);

        // Convert content to text for AI processing
        const contentText = content.map(block => {
            let text = `${block.type}: ${block.content}`;
            if (block.children && block.children.length > 0) {
                const childText = block.children.map(child => `  - ${child.content}`).join('\n');
                text += '\n' + childText;
            }
            return text;
        }).join('\n');

        console.log(`Processing page "${pageTitle}" with ${content.length} blocks`);

        // Use Gemini to extract tasks from the page content
        const prompt = `You are an AI assistant that analyzes Notion page content and extracts actionable tasks. Analyze this page and return a JSON response.

Page Details:
Title: ${pageTitle}
Content: ${contentText.substring(0, 3000)} // Limit content for API

Analyze the content and extract actionable tasks. Look for:
- To-do items and checkboxes
- Action items mentioned in text
- Deadlines and due dates
- Meeting notes with follow-ups
- Project tasks and deliverables
- Goals and objectives that need action
- Any mentions of "need to", "should", "must", "action", "task", "todo"

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
      "description": "Detailed description including context from page",
      "type": "task_type_from_list_above",
      "priority": 1-5,
      "dueDate": "ISO date string or null",
      "scheduledTime": "ISO date string or null",
      "estimatedDuration": 30,
      "tags": ["notion", "relevant", "tags"],
      "source": "notion",
      "metadata": {
        "pageId": "${pageId}",
        "pageTitle": "${pageTitle}",
        "blockId": "block_id_if_specific"
      }
    }
  ]
}

If no actionable tasks are found, return empty tasks array.
Focus on extracting meaningful, actionable tasks rather than general information.`;

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
            const extractedTasks = analysis.tasks || [];

            console.log(`AI extracted ${extractedTasks.length} tasks from page "${pageTitle}"`);

            // Create tasks in MongoDB
            let tasksCreated = 0;
            const createdTasks = [];

            for (const task of extractedTasks) {
                try {
                    const taskDoc = {
                        userId: session.user.email,
                        title: task.title,
                        description: task.description || '',
                        type: task.type || 'custom',
                        priority: Math.max(1, Math.min(5, task.priority || 2)),
                        status: TaskStatus.TODO,
                        source: 'notion',
                        dueDate: task.dueDate ? new Date(task.dueDate) : null,
                        scheduledTime: task.scheduledTime ? new Date(task.scheduledTime) : null,
                        estimatedDuration: task.estimatedDuration || 30,
                        tags: task.tags || ['notion'],
                        metadata: {
                            pageId: pageId,
                            pageTitle: pageTitle,
                            blockId: task.metadata?.blockId || null,
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
                    console.log(`Created task: ${task.title}`);
                } catch (error) {
                    console.error(`Failed to create task from page ${pageId}:`, error);
                }
            }

            // Mark page as processed
            await processedPagesCollection.insertOne({
                userId: session.user.email,
                pageId: pageId,
                pageTitle: pageTitle,
                tasksExtracted: tasksCreated,
                processedAt: new Date(),
                contentBlocks: content.length
            });

            return NextResponse.json({
                success: true,
                pageTitle: pageTitle,
                tasksExtracted: tasksCreated,
                tasks: createdTasks,
                contentBlocks: content.length,
                processedAt: new Date().toISOString()
            });

        } catch (aiError) {
            console.error(`AI processing failed for page ${pageId}:`, aiError);
            return NextResponse.json({
                error: "Failed to process page content with AI",
                details: aiError instanceof Error ? aiError.message : 'Unknown AI error'
            }, { status: 500 });
        }

    } catch (error) {
        console.error("Notion task extraction error:", error);

        let errorMessage = "Failed to extract tasks from Notion page";
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

// Process blocks to extract readable content (same as page-content route)
async function processBlocks(blocks: any[], notion: Client): Promise<any[]> {
    const processedBlocks = [];

    for (const block of blocks) {
        const processedBlock: any = {
            id: block.id,
            type: block.type,
            created_time: block.created_time,
            last_edited_time: block.last_edited_time
        };

        // Extract text content based on block type
        switch (block.type) {
            case 'paragraph':
                processedBlock.content = extractRichText(block.paragraph?.rich_text || []);
                break;
            
            case 'heading_1':
                processedBlock.content = extractRichText(block.heading_1?.rich_text || []);
                processedBlock.level = 1;
                break;
            
            case 'heading_2':
                processedBlock.content = extractRichText(block.heading_2?.rich_text || []);
                processedBlock.level = 2;
                break;
            
            case 'heading_3':
                processedBlock.content = extractRichText(block.heading_3?.rich_text || []);
                processedBlock.level = 3;
                break;
            
            case 'bulleted_list_item':
                processedBlock.content = extractRichText(block.bulleted_list_item?.rich_text || []);
                break;
            
            case 'numbered_list_item':
                processedBlock.content = extractRichText(block.numbered_list_item?.rich_text || []);
                break;
            
            case 'to_do':
                processedBlock.content = extractRichText(block.to_do?.rich_text || []);
                processedBlock.checked = block.to_do?.checked || false;
                break;
            
            case 'toggle':
                processedBlock.content = extractRichText(block.toggle?.rich_text || []);
                break;
            
            case 'quote':
                processedBlock.content = extractRichText(block.quote?.rich_text || []);
                break;
            
            case 'code':
                processedBlock.content = extractRichText(block.code?.rich_text || []);
                processedBlock.language = block.code?.language || 'plain text';
                break;
            
            case 'callout':
                processedBlock.content = extractRichText(block.callout?.rich_text || []);
                processedBlock.icon = block.callout?.icon;
                break;
            
            case 'divider':
                processedBlock.content = '---';
                break;
            
            default:
                processedBlock.content = extractRichText(block[block.type]?.rich_text || []) || `${block.type} block`;
        }

        // Handle child blocks if they exist
        if (block.has_children) {
            try {
                const childBlocks = await notion.blocks.children.list({
                    block_id: block.id,
                    page_size: 50,
                });
                processedBlock.children = await processBlocks(childBlocks.results, notion);
            } catch (error) {
                console.log(`Could not fetch children for block ${block.id}:`, error);
                processedBlock.children = [];
            }
        }

        processedBlocks.push(processedBlock);
    }

    return processedBlocks;
}

// Extract plain text from rich text array
function extractRichText(richText: any[]): string {
    return richText.map(text => text.plain_text || '').join('');
}

// Helper function to extract page title
function getPageTitle(page: any): string {
    if (page.properties && page.properties.title) {
        const titleProp = page.properties.title;
        if (titleProp.title && titleProp.title.length > 0) {
            return titleProp.title[0].plain_text || 'Untitled Page';
        }
    }
    
    // For database pages, try other title properties
    for (const [key, value] of Object.entries(page.properties || {})) {
        if ((value as any).type === 'title' && (value as any).title && (value as any).title.length > 0) {
            return (value as any).title[0].plain_text || 'Untitled Page';
        }
    }
    
    return 'Untitled Page';
}