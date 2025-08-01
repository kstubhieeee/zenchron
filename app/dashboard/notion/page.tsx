"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { RefreshCw, FileText, Database, Users, Calendar, Clock } from "lucide-react";

interface NotionPage {
  id: string;
  title: string;
  url: string;
  last_edited_time: string;
  created_time: string;
  parent: {
    type: string;
    database_id?: string;
    page_id?: string;
  };
  properties?: any;
}

interface NotionResponse {
  pages: NotionPage[];
  totalFetched: number;
  debug?: {
    workspaceName: string;
    botId: string;
  };
}

function NotionPageContent() {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notionToken, setNotionToken] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [stats, setStats] = useState({ total: 0, databases: 0, pages: 0 });
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const workspace = urlParams.get('workspace');
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (success && token && workspace) {
      setIsConnected(true);
      setNotionToken(token);
      setWorkspaceName(workspace);
      // Store in localStorage for persistence
      localStorage.setItem('notion_token', token);
      localStorage.setItem('notion_workspace', workspace);
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard/notion');
    } else if (error) {
      console.error('Notion OAuth error:', error);
      alert(`Notion connection failed: ${error}`);
    } else {
      // Check localStorage for existing connection
      const storedToken = localStorage.getItem('notion_token');
      const storedWorkspace = localStorage.getItem('notion_workspace');
      if (storedToken && storedWorkspace) {
        setIsConnected(true);
        setNotionToken(storedToken);
        setWorkspaceName(storedWorkspace);
      }
    }
  }, [mounted]);

  const connectNotion = () => {
    window.location.href = '/api/notion/auth';
  };

  const disconnectNotion = () => {
    setIsConnected(false);
    setNotionToken(null);
    setWorkspaceName("");
    setPages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('notion_token');
      localStorage.removeItem('notion_workspace');
    }
  };

  const fetchPages = async () => {
    if (!notionToken) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/notion/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: notionToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pages");
      }

      const data: NotionResponse = await response.json();
      setPages(data.pages);
      setDebugInfo(data.debug);
      
      // Calculate stats
      const databases = data.pages.filter(page => page.parent.type === 'database_id').length;
      const regularPages = data.pages.filter(page => page.parent.type !== 'database_id').length;
      
      setStats({
        total: data.totalFetched,
        databases,
        pages: regularPages
      });

      console.log("Debug info:", data.debug);
    } catch (error) {
      console.error("Failed to fetch pages:", error);
      alert("Failed to fetch Notion pages. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getPageIcon = (parent: any) => {
    switch (parent.type) {
      case 'database_id': return <Database className="h-4 w-4" />;
      case 'page_id': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPageBadgeColor = (parent: any) => {
    switch (parent.type) {
      case 'database_id': return 'bg-blue-100 text-blue-800';
      case 'page_id': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notion Integration</h1>
            <p className="text-gray-600">Access your Notion pages and databases</p>
          </div>
          {isConnected ? (
            <div className="flex gap-2">
              <Button 
                onClick={fetchPages} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Fetching..." : "Fetch Pages"}
              </Button>
              <Button variant="outline" onClick={disconnectNotion}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={connectNotion} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Connect to Notion
            </Button>
          )}
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">Connected to {workspaceName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">Not connected</span>
              </div>
            )}
          </CardContent>
        </Card>

        {isConnected && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Total Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.total}
                  </div>
                  <p className="text-sm text-gray-500">Pages and databases</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-600" />
                    Databases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.databases}
                  </div>
                  <p className="text-sm text-gray-500">Database entries</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Pages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.pages}
                  </div>
                  <p className="text-sm text-gray-500">Regular pages</p>
                </CardContent>
              </Card>
            </div>

            {/* Pages List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Pages</CardTitle>
                <CardDescription>
                  Your accessible Notion pages and database entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pages.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No pages found</p>
                    <p className="text-sm text-gray-400">
                      Click "Fetch Pages" to load your Notion content
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pages.map((page) => (
                      <div
                        key={page.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900">
                                {page.title || 'Untitled'}
                              </span>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getPageBadgeColor(page.parent)}`}
                              >
                                {getPageIcon(page.parent)}
                                <span className="ml-1">
                                  {page.parent.type === 'database_id' ? 'Database' : 'Page'}
                                </span>
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {formatTimestamp(page.last_edited_time)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a 
                                href={page.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Open in Notion →
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Debug Info */}
        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <CardDescription>
                Technical details about the Notion API response
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm"><strong>Workspace:</strong> {debugInfo.workspaceName}</p>
                <p className="text-sm"><strong>Bot ID:</strong> {debugInfo.botId}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Integration Info */}
        <Card>
          <CardHeader>
            <CardTitle>How Notion Integration Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">What We Access:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Pages you've shared with the integration</li>
                  <li>• Database entries you have access to</li>
                  <li>• Page titles and basic metadata</li>
                  <li>• Last edited timestamps</li>
                  <li>• Links to open pages in Notion</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-600 mb-2">Privacy & Security:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Only accesses explicitly shared content</li>
                  <li>• Respects Notion's permission system</li>
                  <li>• No content is stored permanently</li>
                  <li>• You can revoke access anytime</li>
                  <li>• Uses official Notion API</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function NotionPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">Notion Integration</h1>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return <NotionPageContent />;
}