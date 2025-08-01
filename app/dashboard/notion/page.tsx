"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { RefreshCw, FileText, Database, Clock, Link as LinkIcon, CheckCircle, AlertCircle } from "lucide-react";

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
  object: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, databases: 0, pages: 0 });
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    setMounted(true);
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = () => {
    // Check URL params for OAuth success/error
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const token = urlParams.get('token');
    const workspace = urlParams.get('workspace');

    if (success === 'true' && token) {
      setIsConnected(true);
      setConnectionStatus('connected');
      // Store token securely (you might want to send this to your backend)
      localStorage.setItem('notion_token', token);
      if (workspace) {
        localStorage.setItem('notion_workspace', workspace);
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      setConnectionStatus('disconnected');
      console.error('Notion connection error:', error);
    } else {
      // Check if we have a stored token
      const storedToken = localStorage.getItem('notion_token');
      if (storedToken) {
        setIsConnected(true);
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    }
  };

  const connectToNotion = () => {
    window.location.href = '/api/notion/auth';
  };

  const disconnectNotion = () => {
    localStorage.removeItem('notion_token');
    localStorage.removeItem('notion_workspace');
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setPages([]);
    setStats({ total: 0, databases: 0, pages: 0 });
  };

  const fetchPages = async () => {
    if (!isConnected) {
      alert("Please connect to Notion first");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('notion_token');
      const response = await fetch("/api/notion/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token: token // Pass OAuth token if available, otherwise use internal
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pages");
      }

      const data: NotionResponse = await response.json();
      setPages(data.pages);
      setDebugInfo(data.debug);
      
      // Calculate stats
      const databases = data.pages.filter(page => page.object === 'database').length;
      const regularPages = data.pages.filter(page => page.object === 'page').length;
      
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

  const getPageIcon = (item: NotionPage) => {
    return item.object === 'database' ? <Database className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  };

  const getPageBadgeColor = (item: NotionPage) => {
    return item.object === 'database' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notion Integration</h1>
            <p className="text-gray-600">Connect your Notion workspace to access pages and databases</p>
          </div>
          <div className="flex gap-2">
            {isConnected ? (
              <>
                <Button 
                  onClick={fetchPages} 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  {isLoading ? "Fetching..." : "Fetch Pages"}
                </Button>
                <Button 
                  onClick={disconnectNotion}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button 
                onClick={connectToNotion}
                className="flex items-center gap-2"
              >
                <LinkIcon className="h-4 w-4" />
                Connect to Notion
              </Button>
            )}
          </div>
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
            {connectionStatus === 'checking' ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-yellow-600 font-medium">Checking connection...</span>
              </div>
            ) : isConnected ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">
                  Connected to {localStorage.getItem('notion_workspace') || 'Notion'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600 font-medium">Not connected</span>
                <Button onClick={connectToNotion} size="sm" className="ml-2">
                  Connect Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

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
              <p className="text-sm text-gray-500">Database items</p>
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
            <CardTitle>Accessible Content</CardTitle>
            <CardDescription>
              Pages and databases from your connected Notion workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pages.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No pages found</p>
                <p className="text-sm text-gray-400">
                  {isConnected 
                    ? "Click 'Fetch Pages' to load your Notion content" 
                    : "Connect to Notion to access your pages and databases"
                  }
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
                            className={`text-xs ${getPageBadgeColor(page)}`}
                          >
                            {getPageIcon(page)}
                            <span className="ml-1">
                              {page.object === 'database' ? 'Database' : 'Page'}
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
                <p className="text-sm"><strong>Bot ID:</strong> {debugInfo.botId}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Integration Info */}
        <Card>
          <CardHeader>
            <CardTitle>How OAuth Integration Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">What We Access:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Pages you select during authorization</li>
                  <li>• Databases you grant access to</li>
                  <li>• Page titles and basic metadata</li>
                  <li>• Last edited timestamps</li>
                  <li>• Direct links to open in Notion</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-600 mb-2">How to Connect:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click "Connect to Notion" above</li>
                  <li>• Select pages/databases to share</li>
                  <li>• Authorize the connection</li>
                  <li>• Return here to access your content</li>
                  <li>• You can disconnect anytime</li>
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