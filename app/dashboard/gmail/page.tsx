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
}

interface SyncResponse {
  workEmails: WorkEmail[];
  totalFetched: number;
  workEmailsCount: number;
}

export default function GmailPage() {
  const [emails, setEmails] = useState<WorkEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [stats, setStats] = useState({ total: 0, work: 0 });

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
      setEmails(data.workEmails);
      setStats({
        total: data.totalFetched,
        work: data.workEmailsCount,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Email List */}
        <Card>
          <CardHeader>
            <CardTitle>Work-Related Emails</CardTitle>
            <CardDescription>
              Emails classified by Gemini AI as work-related and potentially containing tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emails.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No work emails found</p>
                <p className="text-sm text-gray-400">
                  Click "Sync Emails" to fetch and classify your recent emails
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {email.subject || "No Subject"}
                          </h3>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Work
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <User className="h-4 w-4" />
                          <span className="truncate">
                            {extractSenderName(email.from)}
                          </span>
                          <Clock className="h-4 w-4 ml-2" />
                          <span>{formatDate(email.date)}</span>
                        </div>
                        
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {email.snippet}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">
                          Extract Tasks
                        </Button>
                        <Button variant="ghost" size="sm">
                          View Email
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Classification Info */}
        <Card>
          <CardHeader>
            <CardTitle>How AI Classification Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Work-Related Emails Include:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Business communications</li>
                  <li>• Meeting requests and invitations</li>
                  <li>• Project updates and deadlines</li>
                  <li>• Client communications</li>
                  <li>• Professional networking</li>
                  <li>• Company announcements</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-600 mb-2">Personal Emails (Filtered Out):</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Social media notifications</li>
                  <li>• Shopping and promotional emails</li>
                  <li>• Personal conversations</li>
                  <li>• Entertainment subscriptions</li>
                  <li>• Personal finance notifications</li>
                  <li>• Social events (non-work)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}