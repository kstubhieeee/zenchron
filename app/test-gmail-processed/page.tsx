"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Mail, CheckCircle, Clock, User } from "lucide-react";

export default function TestGmailProcessedPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'processed'>('new');

  const testGmailSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gmail/test-processed', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const error = await response.json();
        setResult({ error: error.error || 'Failed to sync' });
      }
    } catch (error) {
      console.error('Test failed:', error);
      setResult({ error: 'Network error' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const extractSenderName = (from: string) => {
    const match = from.match(/^([^<]+)/);
    return match ? match[1].trim().replace(/"/g, "") : from;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gmail Processed Emails Test</h1>
            <p className="text-gray-600">Test the new/processed email separation functionality</p>
          </div>
          <Button onClick={testGmailSync} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Processing...' : 'Test Gmail Sync'}
          </Button>
        </div>

        {result && (
          <>
            {result.error ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-red-600">
                    <h3 className="font-semibold mb-2">Error</h3>
                    <p>{result.error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-600" />
                        New Emails
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {result.workEmailsCount}
                      </div>
                      <p className="text-sm text-gray-500">Newly processed</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Processed Emails
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {result.processedEmailsCount}
                      </div>
                      <p className="text-sm text-gray-500">Previously processed</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-600" />
                        New Tasks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {result.tasksCreated}
                      </div>
                      <p className="text-sm text-gray-500">Created from new emails</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-purple-600" />
                        Total Fetched
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {result.totalFetched}
                      </div>
                      <p className="text-sm text-gray-500">New emails analyzed</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Email Tabs */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Work Emails with Tasks</CardTitle>
                        <p className="text-sm text-gray-600">Separated by processing status</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={activeTab === 'new' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setActiveTab('new')}
                        >
                          New ({result.workEmails?.length || 0})
                        </Button>
                        <Button
                          variant={activeTab === 'processed' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setActiveTab('processed')}
                        >
                          Processed ({result.processedWorkEmails?.length || 0})
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activeTab === 'new' ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded-md mb-4">
                          <p className="text-sm text-blue-800">
                            <strong>New Emails:</strong> These emails were just processed and had tasks extracted. 
                            They will be labeled "ZenchronProcessed" to prevent duplicate processing.
                          </p>
                        </div>
                        {result.workEmails?.map((email: any) => (
                          <EmailCard key={email.id} email={email} isNew={true} formatDate={formatDate} extractSenderName={extractSenderName} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-md mb-4">
                          <p className="text-sm text-gray-700">
                            <strong>Processed Emails:</strong> These emails were previously processed and already have 
                            the "ZenchronProcessed" label. Tasks were already created from these emails.
                          </p>
                        </div>
                        {result.processedWorkEmails?.map((email: any) => (
                          <EmailCard key={email.id} email={email} isNew={false} formatDate={formatDate} extractSenderName={extractSenderName} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

        {!result && (
          <Card>
            <CardContent className="p-12 text-center">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Click "Test Gmail Sync" to see the new/processed email separation</p>
              <p className="text-sm text-gray-400">
                This demonstrates how the system handles both new emails (for processing) and previously processed emails (for display only)
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Email Card Component
function EmailCard({ 
  email, 
  isNew, 
  formatDate, 
  extractSenderName 
}: { 
  email: any; 
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
            {isNew ? (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                New
              </Badge>
            ) : (
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
            <div className="mt-2 p-2 bg-blue-50 rounded-md">
              <p className="text-xs font-medium text-blue-800 mb-1">
                {isNew ? 'Generated Tasks:' : 'Previously Generated Tasks:'}
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                {email.extractedTasks.slice(0, 3).map((task: any, index: number) => (
                  <li key={index} className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                    {task.title}
                  </li>
                ))}
                {email.extractedTasks.length > 3 && (
                  <li className="text-blue-600">
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
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-center">
              ✓ Tasks {isNew ? 'Added' : 'Previously Added'}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}