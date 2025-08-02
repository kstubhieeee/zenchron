import { NextResponse } from "next/server";

// Mock data to simulate both new and processed emails
const mockNewEmails = [
  {
    id: "new-email-1",
    subject: "New: Client feedback needed on proposal",
    from: "client@company.com",
    date: new Date().toISOString(),
    snippet: "Hi, we've reviewed your proposal and have some feedback. Can we schedule a call to discuss?",
    extractedTasks: [
      {
        title: "Schedule call with client for proposal feedback",
        description: "Client has reviewed proposal and wants to discuss feedback",
        type: "follow_up",
        priority: 3,
        tags: ["client", "proposal", "feedback"]
      }
    ],
    isProcessed: false
  }
];

const mockProcessedEmails = [
  {
    id: "processed-email-1",
    subject: "Urgent: Project deadline moved to Friday",
    from: "manager@company.com",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    snippet: "Hi team, we need to move the project deadline to this Friday. Please review the requirements.",
    extractedTasks: [
      {
        title: "Review project requirements for Friday deadline",
        description: "Manager moved deadline to Friday, need to review requirements",
        type: "deadline_based",
        priority: 4,
        tags: ["project", "deadline", "urgent"]
      },
      {
        title: "Confirm timeline feasibility with manager",
        description: "Let manager know if Friday deadline is achievable",
        type: "follow_up",
        priority: 3,
        tags: ["communication", "deadline"]
      }
    ],
    isProcessed: true
  },
  {
    id: "processed-email-2",
    subject: "Meeting request: Q4 Planning Session",
    from: "sarah@company.com",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    snippet: "Can we schedule a meeting for next Tuesday at 2 PM to discuss Q4 planning?",
    extractedTasks: [
      {
        title: "Confirm availability for Q4 planning meeting",
        description: "Sarah requested meeting for Tuesday 2 PM for Q4 planning",
        type: "scheduled_event",
        priority: 2,
        tags: ["meeting", "q4", "planning"]
      }
    ],
    isProcessed: true
  }
];

export async function POST() {
  try {
    console.log("Simulating Gmail sync with processed emails...");

    // Simulate the response structure from the real Gmail sync
    const response = {
      workEmails: mockNewEmails, // New emails with tasks
      processedWorkEmails: mockProcessedEmails, // Already processed emails with tasks
      totalFetched: mockNewEmails.length,
      workEmailsCount: mockNewEmails.length,
      tasksCreated: mockNewEmails.reduce((total, email) => total + email.extractedTasks.length, 0),
      processedEmailsCount: mockProcessedEmails.length,
      totalProcessedEmails: mockProcessedEmails.length
    };

    return NextResponse.json({
      success: true,
      message: "Gmail test sync with processed emails completed",
      ...response
    });

  } catch (error) {
    console.error("Gmail test processed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gmail test processed failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}