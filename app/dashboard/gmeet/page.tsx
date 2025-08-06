"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Download, Video, FileText, Zap, Copy, CheckCircle, AlertCircle, ExternalLink, Settings, Webhook, User } from "lucide-react";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
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

  const gmeetLoadingStates = [
    { text: "Connecting to Google Meet..." },
    { text: "Fetching meeting recordings..." },
    { text: "Processing meeting transcripts..." },
    { text: "Analyzing conversation content..." },
    { text: "Extracting action items..." },
    { text: "Identifying key decisions..." },
    { text: "Creating follow-up tasks..." },
    { text: "Meeting analysis complete!" },
  ];

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
        

        {/* Webhook Configuration Details */}
        

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
        {/* Multi-Step Loader */}
        <MultiStepLoader 
          loadingStates={gmeetLoadingStates} 
          loading={isLoading} 
          duration={1500}
          loop={false}
        />
        
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