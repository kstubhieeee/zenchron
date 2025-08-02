"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Mail, CheckCircle, Clock, User } from "lucide-react";

export default function TestGmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testGmailSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gmail/test-sync', {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gmail Integration Test</h1>
            <p className="text-gray-600">Test AI-powered email processing and task extraction</p>
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
                        Total Emails
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {result.totalFetched}
                      </div>
                      <p className="text-sm text-gray-500">Mock emails processed</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Work Emails
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {result.workEmailsCount}
                      </div>
                      <p className="text-sm text-gray-500">With actionable tasks</p>
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
                        {result.tasksCreated}
                      </div>
                      <p className="text-sm text-gray-500">Added to database</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-purple-600" />
                        Processed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {result.processedEmails}
                      </div>
                      <p className="text-sm text-gray-500">Emails analyzed</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Work Emails with Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle>Work Emails with Extracted Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.workEmails.map((email: any) => (
                        <div key={email.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {email.subject}
                                </h3>
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Work
                                </Badge>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  {email.extractedTasks.length} Task{email.extractedTasks.length > 1 ? 's' : ''}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <User className="h-4 w-4" />
                                <span>{email.from}</span>
                                <Clock className="h-4 w-4 ml-2" />
                                <span>{formatDate(email.date)}</span>
                              </div>
                              
                              <p className="text-sm text-gray-700 mb-3">
                                {email.snippet}
                              </p>
                              
                              {/* Extracted Tasks */}
                              <div className="bg-blue-50 rounded-md p-3">
                                <h4 className="font-medium text-blue-800 mb-2">Extracted Tasks:</h4>
                                <div className="space-y-2">
                                  {email.extractedTasks.map((task: any, index: number) => (
                                    <div key={index} className="bg-white rounded p-2 border-l-4 border-blue-500">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-gray-900">{task.title}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {task.type.replace('_', ' ')}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          Priority {task.priority}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-1">{task.description}</p>
                                      <div className="flex gap-2 text-xs text-gray-500">
                                        <span>Duration: {task.estimatedDuration}min</span>
                                        {task.dueDate && (
                                          <span>Due: {formatDate(task.dueDate)}</span>
                                        )}
                                        <span>Tags: {task.tags.join(', ')}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Processing Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Processing Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.details.processedEmails.map((email: any) => (
                        <div key={email.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">{email.subject}</span>
                          <div className="flex gap-2">
                            <Badge variant={email.isWorkRelated ? "default" : "secondary"}>
                              {email.isWorkRelated ? "Work" : "Personal"}
                            </Badge>
                            <Badge variant={email.hasTasks ? "default" : "secondary"}>
                              {email.taskCount} Tasks
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
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
              <p className="text-gray-500 mb-4">Click "Test Gmail Sync" to see AI email processing in action</p>
              <p className="text-sm text-gray-400">
                This will process mock emails and extract actionable tasks automatically
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}