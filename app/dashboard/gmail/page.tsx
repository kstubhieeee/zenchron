"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { RefreshCw, Mail, Clock, User } from "lucide-react";



interface WorkEmail {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  body: string;
  extractedTasks?: any[];
}

interface SyncResponse {
  workEmails: WorkEmail[];
  processedWorkEmails: WorkEmail[];
  totalFetched: number;
  workEmailsCount: number;
  tasksCreated: number;
  processedEmailsCount: number;
  totalProcessedEmails: number;
}

export default function GmailPage() {
  const [newEmails, setNewEmails] = useState<WorkEmail[]>([]);
  const [processedEmails, setProcessedEmails] = useState<WorkEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [stats, setStats] = useState({ total: 0, work: 0, tasks: 0, processed: 0 });
  const [activeTab, setActiveTab] = useState<'new' | 'processed'>('new');

  const syncEmails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/gmail/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to sync emails");
      }

      const data: SyncResponse = await response.json();
      setNewEmails(data.workEmails || []);
      setProcessedEmails(data.processedWorkEmails || []);
      setStats({
        total: data.totalFetched,
        work: data.workEmailsCount,
        tasks: data.tasksCreated,
        processed: data.processedEmailsCount
      });
      setLastSync(new Date());
    } catch (error) {
      console.error("Sync failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to sync emails: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const extractSenderName = (from: string) => {
    const match = from.match(/^([^<]+)/);
    return match ? match[1].trim().replace(/"/g, "") : from;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gmail Sync</h1>
            <p className="text-gray-600">AI-powered work email classification and task extraction</p>
          </div>
          <Button 
            onClick={syncEmails} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Syncing..." : "Sync Emails"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Total Emails
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <p className="text-sm text-gray-500">Last 7 days + unread</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-600" />
                Work Emails
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.work}
              </div>
              <p className="text-sm text-gray-500">AI classified as work-related</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Tasks Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.tasks}
              </div>
              <p className="text-sm text-gray-500">Auto-generated from emails</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Last Sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-purple-600">
                {lastSync ? lastSync.toLocaleTimeString() : "Never"}
              </div>
              <p className="text-sm text-gray-500">
                {lastSync ? lastSync.toLocaleDateString() : "Click sync to start"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Email Tabs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gmail Integration</CardTitle>
                <CardDescription>
                  {activeTab === 'new' 
                    ? "New emails that will be processed and converted to tasks" 
                    : "Previously processed emails with ZenchronProcessed label (reference only)"
                  }
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('new')}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  New Emails ({newEmails.length})
                </Button>
                <Button
                  variant={activeTab === 'processed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('processed')}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Already Processed ({processedEmails.length})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === 'new' ? (
              <div>
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>New Emails:</strong> These emails don't have the "ZenchronProcessed" label yet. 
                    When you sync, AI will analyze them and create tasks automatically.
                  </p>
                </div>
                {newEmails.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No new work emails with tasks found</p>
                    <p className="text-sm text-gray-400">
                      Click "Sync Emails" to fetch and analyze your recent emails for actionable tasks
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {newEmails.map((email) => (
                      <EmailCard key={email.id} email={email} isNew={true} formatDate={formatDate} extractSenderName={extractSenderName} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>Processed Emails:</strong> These emails have the "ZenchronProcessed" label. 
                    Tasks have already been extracted and won't be processed again. This is for reference only.
                  </p>
                </div>
                {processedEmails.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No previously processed emails found</p>
                    <p className="text-sm text-gray-400">
                      Emails that have been processed and had tasks extracted will appear here for reference
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {processedEmails.map((email) => (
                      <EmailCard key={email.id} email={email} isNew={false} formatDate={formatDate} extractSenderName={extractSenderName} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Processing Info */}
        <Card>
          <CardHeader>
            <CardTitle>How AI Email Processing Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">AI Automatically:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Identifies work-related emails</li>
                  <li>• Extracts actionable tasks from content</li>
                  <li>• Categorizes tasks by type and priority</li>
                  <li>• Sets due dates from email context</li>
                  <li>• Adds tasks to your task management system</li>
                  <li>• Labels processed emails to avoid duplicates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">Task Types Detected:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 🔁 Follow-up tasks and responses needed</li>
                  <li>• 💡 Quick wins and simple actions</li>
                  <li>• 🔥 High priority and urgent items</li>
                  <li>• 🧠 Deep work and complex projects</li>
                  <li>• ⏳ Deadline-based tasks with due dates</li>
                  <li>• 📅 Scheduled events and meetings</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Once an email is processed, it gets the "ZenchronProcessed" label 
                and will NOT be processed again. This prevents duplicate tasks from being created. 
                Processed emails appear in the "Already Processed" tab for reference only.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Email Card Component
function EmailCard({ 
  email, 
  isNew, 
  formatDate, 
  extractSenderName 
}: { 
  email: WorkEmail; 
  isNew: boolean; 
  formatDate: (date: string) => string; 
  extractSenderName: (from: string) => string; 
}) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {email.subject || "No Subject"}
            </h3>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Work
            </Badge>
            {isNew && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                New
              </Badge>
            )}
            {!isNew && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                Processed
              </Badge>
            )}
            {email.extractedTasks && email.extractedTasks.length > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {email.extractedTasks.length} Task{email.extractedTasks.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <User className="h-4 w-4" />
            <span className="truncate">
              {extractSenderName(email.from)}
            </span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{formatDate(email.date)}</span>
          </div>
          
          <p className="text-sm text-gray-700 line-clamp-2 mb-2">
            {email.snippet}
          </p>
          
          {email.extractedTasks && email.extractedTasks.length > 0 && (
            <div className={`mt-2 p-2 rounded-md ${isNew ? 'bg-green-50' : 'bg-gray-50'}`}>
              <p className={`text-xs font-medium mb-1 ${isNew ? 'text-green-800' : 'text-gray-700'}`}>
                {isNew ? '✅ Tasks will be created:' : '📋 Tasks already created (reference):'}
              </p>
              <ul className={`text-xs space-y-1 ${isNew ? 'text-green-700' : 'text-gray-600'}`}>
                {email.extractedTasks.slice(0, 3).map((task, index) => (
                  <li key={index} className="flex items-center gap-1">
                    <span className={`w-1 h-1 rounded-full ${isNew ? 'bg-green-600' : 'bg-gray-500'}`}></span>
                    {task.title}
                  </li>
                ))}
                {email.extractedTasks.length > 3 && (
                  <li className={isNew ? 'text-green-600' : 'text-gray-500'}>
                    +{email.extractedTasks.length - 3} more tasks
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(`https://mail.google.com/mail/u/0/#inbox/${email.id}`, '_blank')}
          >
            View in Gmail
          </Button>
          {email.extractedTasks && email.extractedTasks.length > 0 && (
            <Badge 
              variant="secondary" 
              className={`text-center ${
                isNew 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {isNew ? '✅ Will Add Tasks' : '📋 Already Added'}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}