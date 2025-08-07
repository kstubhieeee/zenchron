"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { RefreshCw, FileText, Database, Clock, LinkIcon, CheckCircle, AlertCircle, Eye, X, ChevronRight, ChevronDown, Zap, CheckSquare, Sparkles, ArrowRight, Download, Settings } from 'lucide-react';
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { LoaderOne } from "@/components/ui/loader";
import { useSyncDialog } from "@/hooks/use-sync-dialog";
import { SyncDialog } from "@/components/ui/sync-dialog";

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
  isProcessed?: boolean;
  tasksExtracted?: number;
  processedAt?: string;
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
  const [extractingTasks, setExtractingTasks] = useState<string | null>(null);
  const [processedPages, setProcessedPages] = useState<Set<string>>(new Set());
  const { dialogState, showSuccess, showError, closeDialog } = useSyncDialog();

  const notionLoadingStates = [
    { text: "Connecting to Notion workspace..." },
    { text: "Fetching pages and databases..." },
    { text: "Analyzing page content..." },
    { text: "Scanning for actionable items..." },
    { text: "Extracting tasks and todos..." },
    { text: "Processing page relationships..." },
    { text: "Organizing extracted data..." },
    { text: "Notion sync completed!" },
  ];

  useEffect(() => {
    setMounted(true);
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const token = urlParams.get('token');
    const workspace = urlParams.get('workspace');

    if (success === 'true' && token) {
      setIsConnected(true);
      setConnectionStatus('connected');
      localStorage.setItem('notion_token', token);
      if (workspace) {
        localStorage.setItem('notion_workspace', workspace);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      setConnectionStatus('disconnected');
      console.error('Notion connection error:', error);
    } else {
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
      showError(
        'Connection Required',
        'Please connect to Notion first before fetching pages.',
        'Click the "Connect to Notion" button to authenticate your workspace.'
      );
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
          token: token
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pages");
      }

      const data: NotionResponse = await response.json();
      
      await checkProcessedPages(data.pages);
      
      setPages(data.pages);
      setDebugInfo(data.debug);
      
      const databases = data.pages.filter(page => page.object === 'database').length;
      const regularPages = data.pages.filter(page => page.object === 'page').length;
      
      setStats({
        total: data.totalFetched,
        databases,
        pages: regularPages
      });

      showSuccess(
        'Notion Pages Fetched!',
        `Successfully loaded ${data.totalFetched} items from your Notion workspace.`,
        `Found ${databases} databases and ${regularPages} pages ready for task extraction.`
      );

    } catch (error) {
      console.error("Failed to fetch pages:", error);
      showError(
        'Fetch Failed',
        'Failed to fetch Notion pages.',
        'Please check your connection and try again. If the problem persists, try reconnecting to Notion.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const checkProcessedPages = async (pages: NotionPage[]) => {
    try {
      const response = await fetch("/api/notion/processed-pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          pageIds: pages.map(p => p.id)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProcessedPages(new Set(data.processedPageIds));
      }
    } catch (error) {
      console.error("Failed to check processed pages:", error);
    }
  };

  const extractTasks = async (page: NotionPage) => {
    setExtractingTasks(page.id);
    try {
      const token = localStorage.getItem('notion_token');
      const response = await fetch("/api/notion/extract-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          pageId: page.id,
          token: token
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract tasks");
      }

      const data = await response.json();
      
      if (data.alreadyProcessed) {
        showSuccess(
          'Page Already Processed',
          `This page was already processed on ${new Date(data.processedAt).toLocaleDateString()}.`,
          `Found ${data.tasksCount} existing tasks from "${data.pageTitle}". No new tasks were created.`
        );
      } else {
        showSuccess(
          'Tasks Extracted Successfully!',
          `Successfully extracted ${data.tasksExtracted} tasks from "${data.pageTitle}".`,
          'Check the Tasks page to see your new action items from this Notion page.'
        );
        setProcessedPages(prev => new Set([...prev, page.id]));
      }
    } catch (error) {
      console.error("Failed to extract tasks:", error);
      showError(
        'Task Extraction Failed',
        `Failed to extract tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Please check your Notion connection and try again.'
      );
    } finally {
      setExtractingTasks(null);
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
    return item.object === 'database' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-8 text-white">
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <FileText className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="font-bodoni text-4xl font-bold mb-2">Notion Integration</h1>
                  <p className="text-gray-300 text-lg">Transform your Notion pages into actionable tasks</p>
                </div>
              </div>
              <div className="flex gap-3">
                {isConnected ? (
                  <>
                    <Button 
                      onClick={fetchPages} 
                      disabled={isLoading}
                      className="bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-sm"
                      variant="outline"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                      {isLoading ? "Fetching..." : "Sync Pages"}
                    </Button>
                    <Button 
                      onClick={disconnectNotion}
                      variant="outline"
                      className="border-red-300/50 text-red-200 hover:bg-red-500/20"
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={connectToNotion}
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Connect to Notion
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Connection Status */}
        <Card className="border-0 ">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
                  {isConnected ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {connectionStatus === 'checking' ? 'Checking connection...' : 
                     isConnected ? `Connected to ${localStorage.getItem('notion_workspace') || 'Notion'}` : 
                     'Not connected to Notion'}
                  </h3>
                  <p className="text-gray-600">
                    {isConnected ? 'Ready to sync pages and extract tasks' : 'Connect your workspace to get started'}
                  </p>
                </div>
              </div>
              {!isConnected && (
                <Button onClick={connectToNotion} className="bg-black text-white hover:bg-gray-800">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Connect Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0  bg-gradient-to-br from-blue-50 to-indigo-50 hover: transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-700">{stats.total}</div>
                  <div className="text-blue-600 font-medium">Total Items</div>
                  <div className="text-blue-500 text-sm">Pages and databases</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0  bg-gradient-to-br from-green-50 to-emerald-50 hover: transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-700">{stats.databases}</div>
                  <div className="text-green-600 font-medium">Databases</div>
                  <div className="text-green-500 text-sm">Structured data</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0  bg-gradient-to-br from-purple-50 to-violet-50 hover: transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-700">{stats.pages}</div>
                  <div className="text-purple-600 font-medium">Pages</div>
                  <div className="text-purple-500 text-sm">Regular pages</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0  bg-gradient-to-br from-orange-50 to-amber-50 hover: transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-700">{processedPages.size}</div>
                  <div className="text-orange-600 font-medium">Processed</div>
                  <div className="text-orange-500 text-sm">Tasks extracted</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Pages List */}
        <Card className="border-0 ">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Your Notion Content</CardTitle>
                  <CardDescription>Pages and databases from your connected workspace</CardDescription>
                </div>
              </div>
              {pages.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                  {pages.length} items found
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {pages.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No pages found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {isConnected 
                    ? "Click 'Sync Pages' to load your Notion content and start extracting tasks" 
                    : "Connect to Notion to access your pages and databases"
                  }
                </p>
                {isConnected && (
                  <Button onClick={fetchPages} disabled={isLoading} className="bg-black text-white hover:bg-gray-800">
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Sync Pages Now
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className="group border border-gray-200 rounded-xl p-6 hover: hover:border-gray-300 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-gray-900 text-lg truncate">
                            {page.title || 'Untitled'}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={`${getPageBadgeColor(page)} border`}
                          >
                            {getPageIcon(page)}
                            <span className="ml-1">
                              {page.object === 'database' ? 'Database' : 'Page'}
                            </span>
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {formatTimestamp(page.last_edited_time)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-wrap">
                          {processedPages.has(page.id) ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-2">
                              <CheckSquare className="h-4 w-4" />
                              Tasks Extracted
                            </Badge>
                          ) : (
                            <Button
                              onClick={() => extractTasks(page)}
                              disabled={extractingTasks === page.id}
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                              size="sm"
                            >
                              <Zap className={`h-4 w-4 mr-2 ${extractingTasks === page.id ? "animate-spin" : ""}`} />
                              {extractingTasks === page.id ? "Extracting..." : "Extract Tasks"}
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            onClick={() => window.open(page.url, '_blank')}
                          >
                            Open in Notion
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Multi-Step Loader */}
        <MultiStepLoader 
          loadingStates={notionLoadingStates} 
          loading={isLoading || !!extractingTasks} 
          duration={1500}
          loop={false}
        />
      </div>

      {/* Sync Dialog */}
      <SyncDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        success={dialogState.success}
        title={dialogState.title}
        message={dialogState.message}
        details={dialogState.details}
      />
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
        <div className="min-h-screen flex items-center justify-center">
          <LoaderOne />
        </div>
      </DashboardLayout>
    );
  }

  return <NotionPageContent />;
}
