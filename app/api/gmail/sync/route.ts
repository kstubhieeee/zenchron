import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { google } from "googleapis";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: [
                        "openid",
                        "email",
                        "profile",
                        "https://www.googleapis.com/auth/gmail.readonly",
                        "https://www.googleapis.com/auth/calendar",
                        "https://www.googleapis.com/auth/calendar.events"
                    ].join(" "),
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }: any) {
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
            }
            return token;
        },
        async session({ session, token }: any) {
            session.accessToken = token.accessToken;
            return session;
        },
    },
};

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        console.log("Session:", session ? "exists" : "null");
        console.log("Access token:", session?.accessToken ? "exists" : "missing");

        if (!session?.accessToken) {
            return NextResponse.json({
                error: "Not authenticated",
                details: "No access token found in session"
            }, { status: 401 });
        }

        // Initialize Gmail API
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: session.accessToken });

        const gmail = google.gmail({ version: "v1", auth: oauth2Client });

        console.log("Fetching emails from Gmail API...");

        // Fetch recent emails (last 50)
        const response = await gmail.users.messages.list({
            userId: "me",
            maxResults: 10, // Reduced for testing
            q: "is:unread OR newer_than:7d", // Unread or from last 7 days
        });

        console.log("Gmail API response:", response.data.messages?.length || 0, "messages found");

        if (!response.data.messages) {
            return NextResponse.json({
                workEmails: [],
                totalFetched: 0,
                workEmailsCount: 0
            });
        }

        // Get detailed email data
        const emailPromises = response.data.messages.map(async (message) => {
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
            body = body.replace(/<[^>]*>/g, "").substring(0, 500);

            return {
                id: message.id,
                subject,
                from,
                date,
                body,
                snippet: emailData.data.snippet || "",
            };
        });

        const emails = await Promise.all(emailPromises);
        console.log("Processed", emails.length, "emails");

        // Check if Gemini API key is available
        if (!process.env.GEMINI_API_KEY) {
            console.log("No Gemini API key found, returning all emails as work-related");
            const workEmails = emails.map(email => ({ ...email, isWork: true }));
            return NextResponse.json({
                workEmails,
                totalFetched: emails.length,
                workEmailsCount: workEmails.length,
            });
        }

        console.log("Starting AI classification...");

        // Use Gemini 2.0 Flash to classify each email individually based on content
        const classifyEmailPromises = emails.map(async (email) => {
            const prompt = `You are an AI assistant that classifies individual emails as work-related or personal based on their content.

Analyze this single email and determine if it's work-related or personal:

Subject: ${email.subject}
From: ${email.from}
Content: ${email.snippet}
Body: ${email.body.substring(0, 400)}

Work-related emails typically include:
- Business communications and professional discussions
- Meeting requests, invitations, or scheduling
- Project updates, deadlines, or task assignments
- Client communications or customer service
- Work deadlines, deliverables, or milestones
- Professional networking or job-related content
- Company announcements or internal communications
- Work-related notifications or system alerts
- Invoices, contracts, or business documents
- Team collaboration or work coordination

Personal emails typically include:
- Social media notifications or updates
- Shopping, promotional, or marketing emails
- Personal conversations with friends/family
- Entertainment subscriptions or newsletters
- Personal finance or banking notifications
- Social events that are not work-related
- Personal hobbies or interests
- Travel bookings or personal arrangements

Respond with ONLY one word: "WORK" or "PERSONAL"
Do not include any explanation or additional text.`;

            try {
                const response = await fetch(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-goog-api-key": process.env.GEMINI_API_KEY!,
                        },
                        body: JSON.stringify({
                            contents: [
                                {
                                    parts: [
                                        {
                                            text: prompt
                                        }
                                    ]
                                }
                            ]
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error(`Gemini API error: ${response.status}`);
                }

                const data = await response.json();
                const classification = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase();

                return {
                    ...email,
                    isWork: classification === "WORK"
                };
            } catch (error) {
                console.error(`Failed to classify email ${email.id}:`, error);
                // Fallback: classify as work if AI fails (conservative approach)
                return {
                    ...email,
                    isWork: true
                };
            }
        });

        // Wait for all classifications to complete
        const classifiedEmails = await Promise.all(classifyEmailPromises);

        // Filter only work-related emails
        const workEmails = classifiedEmails.filter(email => email.isWork);

        return NextResponse.json({
            workEmails,
            totalFetched: emails.length,
            workEmailsCount: workEmails.length,
        });

    } catch (error) {
        console.error("Gmail sync error:", error);

        // More detailed error information
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