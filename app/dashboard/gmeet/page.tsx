"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Download, Video, FileText, Zap, Copy, CheckCircle, AlertCircle, ExternalLink, Settings, Webhook, User } from "lucide-react";
import { useSession } from "next-auth/react";

interface MeetingRecord {
  _id: string;
  meetingTitle: string;
  meetingStartTimestamp: string;
  meetingEndTimestamp: string;
  tasksExtracted: number;
  processedAt: string;
}

function GMeetPageContent() {
  const { data: session } = useSession();
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ totalMeetings: 0, totalTasks: 0 });
  const [mounted, setMounted] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set the webhook URL based on current domain
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      setWebhookUrl(`${baseUrl}/api/gmeet/webhook-public`);
    }
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/gmeet/meetings");
      if (response.ok) {
        const data = await response.json();
        setMeetings(data.meetings || []);
        setStats({
          totalMeetings: data.meetings?.length || 0,
          totalTasks: data.meetings?.reduce((sum: number, meeting: MeetingRecord) => sum + meeting.tasksExtracted, 0) || 0
        });
      }
    } catch (error) {
      console.error("Failed to load meetings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy webhook URL:", error);
    }
  };

  const copyUserEmail = async () => {
    try {
      if (session?.user?.email) {
        await navigator.clipboard.writeText(session.user.email);
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
      }
    } catch (error) {
      console.error("Failed to copy user email:", error);
    }
  };

  const testWebhook = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/gmeet/test-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Test webhook successful! Created ${data.webhookResponse.tasksExtracted || 0} tasks.`);
        // Refresh meetings to show the test meeting
        loadMeetings();
      } else {
        const errorData = await response.json();
        alert(`Test webhook failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Test webhook failed:", error);
      alert("Test webhook failed. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadExtension = () => {
    // Create a zip file download link for the extension
    const link = document.createElement('a');
    link.href = '/transcriptonic-extension.zip'; // You'll need to create this zip file
    link.download = 'transcriptonic-extension.zip';
    link.click();
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Google Meet Integration</h1>
            <p className="text-gray-600">Extract tasks from meeting transcripts using TranscripTonic extension</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={loadMeetings} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Video className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Loading..." : "Refresh Meetings"}
            </Button>
            <Button 
              onClick={testWebhook} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Test Webhook
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-600" />
                Total Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalMeetings}
              </div>
              <p className="text-sm text-gray-500">Processed with TranscripTonic</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Tasks Extracted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalTasks}
              </div>
              <p className="text-sm text-gray-500">AI-generated from transcripts</p>
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Setup Instructions
            </CardTitle>
            <CardDescription>
              Follow these steps to set up TranscripTonic extension with webhook integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Step 1: Download Extension */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-blue-700 mb-2">Step 1: Install TranscripTonic Extension</h3>
                <p className="text-sm text-gray-600 mb-3">
                  The TranscripTonic extension is located in your project at: <code className="bg-gray-100 px-2 py-1 rounded">/transcriptonic/extension</code>
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">To install the extension:</p>
                  <ol className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>1. Open Chrome and go to <code>chrome://extensions/</code></li>
                    <li>2. Enable "Developer mode" in the top right</li>
                    <li>3. Click "Load unpacked" button</li>
                    <li>4. Navigate to your project folder and select the <code>/transcriptonic/extension</code> directory</li>
                    <li>5. The extension should now appear in your Chrome extensions</li>
                  </ol>
                </div>
                <Button 
                  onClick={() => window.open('chrome://extensions/', '_blank')}
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Chrome Extensions
                </Button>
              </div>

              {/* Step 2: Configure Webhook */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-green-700 mb-2">Step 2: Configure Webhook URL</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Copy this webhook URL and your user email for the TranscripTonic extension settings:
                </p>
                
                {/* Webhook URL */}
                <div className="mb-3">
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Webhook URL:</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <code className="flex-1 text-sm font-mono">{webhookUrl}</code>
                    <Button
                      onClick={copyWebhookUrl}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* User Email */}
                <div className="mb-3">
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Your User Email:</label>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <User className="h-4 w-4 text-blue-600" />
                    <code className="flex-1 text-sm font-mono text-blue-800">
                      {session?.user?.email || 'Not logged in'}
                    </code>
                    <Button
                      onClick={copyUserEmail}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      disabled={!session?.user?.email}
                    >
                      {emailCopied ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-600">To configure the webhook:</p>
                  <ol className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>1. Click on the TranscripTonic extension icon in Chrome</li>
                    <li>2. Go to the "Webhooks" or "Settings" section</li>
                    <li>3. Paste the webhook URL above</li>
                    <li>4. <strong>Important:</strong> Add your user email to the webhook request body</li>
                    <li>5. Enable "Automatically post transcript after each meeting"</li>
                    <li>6. Choose "Simple webhook body" for easier processing</li>
                  </ol>
                </div>
                
                <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> You need to modify the TranscripTonic extension to include your user email 
                    in the webhook request. Add <code>"userEmail": "{session?.user?.email}"</code> to the webhook body.
                  </p>
                </div>
              </div>

              {/* Step 3: Modify Extension */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-orange-700 mb-2">Step 3: Modify Extension (Required)</h3>
                <p className="text-sm text-gray-600 mb-3">
                  You need to modify the TranscripTonic extension to include your user email:
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Edit the file <code>/transcriptonic/extension/background.js</code>:</p>
                  <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                    <div className="mb-2 text-gray-400">// Find the postTranscriptToWebhook function and modify the webhookData:</div>
                    <div className="text-yellow-400">webhookData = &#123;</div>
                    <div className="ml-4">webhookBodyType: "simple",</div>
                    <div className="ml-4">meetingTitle: meeting.meetingTitle || meeting.title || "",</div>
                    <div className="ml-4">meetingStartTimestamp: new Date(meeting.meetingStartTimestamp).toLocaleString("default", timeFormat).toUpperCase(),</div>
                    <div className="ml-4">meetingEndTimestamp: new Date(meeting.meetingEndTimestamp).toLocaleString("default", timeFormat).toUpperCase(),</div>
                    <div className="ml-4">transcript: getTranscriptString(meeting.transcript),</div>
                    <div className="ml-4">chatMessages: getChatMessagesString(meeting.chatMessages),</div>
                    <div className="ml-4 text-green-400"><strong>userEmail: "{session?.user?.email || 'your-email@example.com'}", // ADD THIS LINE</strong></div>
                    <div className="text-yellow-400">&#125;</div>
                  </div>
                </div>
              </div>

              {/* Step 4: Usage */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-purple-700 mb-2">Step 4: Usage</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Once configured, the extension will automatically work:
                </p>
                <ol className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>1. Join any Google Meet meeting</li>
                  <li>2. The extension will record the transcript automatically</li>
                  <li>3. When the meeting ends, the transcript is sent to the webhook</li>
                  <li>4. AI processes the transcript and extracts actionable tasks</li>
                  <li>5. Tasks appear in your <code>/dashboard/tasks</code> automatically</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Webhook Configuration Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Configuration Details
            </CardTitle>
            <CardDescription>
              Technical details about the webhook integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">Webhook Endpoint:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>URL:</strong> <code>/api/gmeet/webhook</code></li>
                  <li>• <strong>Method:</strong> POST</li>
                  <li>• <strong>Content-Type:</strong> application/json</li>
                  <li>• <strong>Authentication:</strong> None (internal)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Supported Data:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Meeting title and timestamps</li>
                  <li>• Full transcript with speaker names</li>
                  <li>• Chat messages from the meeting</li>
                  <li>• Both simple and advanced webhook formats</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The webhook processes transcripts in real-time and automatically creates tasks 
                in your task management system. No manual intervention required once configured.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Meetings</CardTitle>
            <CardDescription>
              Meetings processed through the TranscripTonic webhook
            </CardDescription>
          </CardHeader>
          <CardContent>
            {meetings.length === 0 ? (
              <div className="text-center py-12">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No meetings processed yet</p>
                <p className="text-sm text-gray-400">
                  Install the TranscripTonic extension and join a Google Meet to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div
                    key={meeting._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {meeting.meetingTitle || "Google Meet"}
                          </h3>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            <Video className="h-3 w-3 mr-1" />
                            Meeting
                          </Badge>
                          {meeting.tasksExtracted > 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Zap className="h-3 w-3 mr-1" />
                              {meeting.tasksExtracted} Task{meeting.tasksExtracted > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>Started:</strong> {formatTimestamp(meeting.meetingStartTimestamp)}
                          </p>
                          <p>
                            <strong>Ended:</strong> {formatTimestamp(meeting.meetingEndTimestamp)}
                          </p>
                          <p>
                            <strong>Processed:</strong> {formatTimestamp(meeting.processedAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {meeting.tasksExtracted > 0 ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-center">
                            ✅ {meeting.tasksExtracted} Tasks Created
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-center">
                            No Tasks Found
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How AI Task Extraction Works</CardTitle>
            <CardDescription>
              Understanding the automated task extraction process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-orange-600 mb-2">AI Automatically Extracts:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Action items assigned to specific people</li>
                  <li>• Decisions that require follow-up</li>
                  <li>• Deadlines and due dates mentioned</li>
                  <li>• Tasks that need to be completed</li>
                  <li>• Follow-up meetings to schedule</li>
                  <li>• Documents or deliverables to create</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">Process Flow:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 1. Extension records meeting transcript</li>
                  <li>• 2. Transcript sent to webhook when meeting ends</li>
                  <li>• 3. AI analyzes content for actionable items</li>
                  <li>• 4. Tasks categorized and prioritized</li>
                  <li>• 5. Tasks automatically added to your dashboard</li>
                  <li>• 6. Meeting record saved for reference</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Privacy:</strong> Transcripts are processed locally and only task summaries are stored. 
                Full transcripts are not permanently saved in the database.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function GMeetPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Google Meet Integration</h1>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return <GMeetPageContent />;
}