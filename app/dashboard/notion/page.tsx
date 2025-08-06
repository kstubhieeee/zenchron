"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { RefreshCw, FileText, Database, Clock, Link as LinkIcon, CheckCircle, AlertCircle, Eye, X, ChevronRight, ChevronDown, Zap, CheckSquare } from "lucide-react";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

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

interface NotionBlock {
  id: string;
  type: string;
  content: string;
  level?: number;
  checked?: boolean;
  language?: string;
  icon?: any;
  url?: string;
  children?: NotionBlock[];
  created_time: string;
  last_edited_time: string;
}

interface PageContent {
  page: {
    id: string;
    title: string;
    url: string;
    last_edited_time: string;
    created_time: string;
    properties: any;
  };
  content: NotionBlock[];
  totalBlocks: number;
}

function NotionPageContent() {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, databases: 0, pages: 0 });
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [selectedPage, setSelectedPage] = useState<NotionPage | null>(null);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [extractingTasks, setExtractingTasks] = useState<string | null>(null);
  const [processedPages, setProcessedPages] = useState<Set<string>>(new Set());

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
      
      // Check which pages have been processed for task extraction
      await checkProcessedPages(data.pages);
      
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
        alert(`This page was already processed on ${new Date(data.processedAt).toLocaleDateString()}. Found ${data.tasksCount} existing tasks.`);
      } else {
        alert(`Successfully extracted ${data.tasksExtracted} tasks from "${data.pageTitle}"!`);
        // Mark this page as processed
        setProcessedPages(prev => new Set([...prev, page.id]));
      }
    } catch (error) {
      console.error("Failed to extract tasks:", error);
      alert(`Failed to extract tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    return item.object === 'database' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const fetchPageContent = async (page: NotionPage) => {
    setSelectedPage(page);
    setIsLoadingContent(true);
    setShowContentModal(true);
    
    try {
      const token = localStorage.getItem('notion_token');
      const response = await fetch("/api/notion/page-content", {
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
        throw new Error("Failed to fetch page content");
      }

      const data: PageContent = await response.json();
      setPageContent(data);
    } catch (error) {
      console.error("Failed to fetch page content:", error);
      alert("Failed to fetch page content. Please try again.");
    } finally {
      setIsLoadingContent(false);
    }
  };

  const closeContentModal = () => {
    setShowContentModal(false);
    setSelectedPage(null);
    setPageContent(null);
  };

  // Component to render individual blocks
  const BlockRenderer = ({ block }: { block: NotionBlock }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const renderBlockContent = () => {
      switch (block.type) {
        case 'heading_1':
          return <h1 className="text-2xl font-bold text-gray-900 mb-2">{block.content}</h1>;
        
        case 'heading_2':
          return <h2 className="text-xl font-semibold text-gray-800 mb-2">{block.content}</h2>;
        
        case 'heading_3':
          return <h3 className="text-lg font-medium text-gray-700 mb-2">{block.content}</h3>;
        
        case 'paragraph':
          return <p className="text-gray-700 leading-relaxed mb-2">{block.content || '\u00A0'}</p>;
        
        case 'bulleted_list_item':
          return (
            <div className="flex items-start gap-2 mb-1">
              <span className="text-gray-400 mt-2">•</span>
              <span className="text-gray-700">{block.content}</span>
            </div>
          );
        
        case 'numbered_list_item':
          return (
            <div className="flex items-start gap-2 mb-1">
              <span className="text-gray-400 mt-2">1.</span>
              <span className="text-gray-700">{block.content}</span>
            </div>
          );
        
        case 'to_do':
          return (
            <div className="flex items-start gap-2 mb-1">
              <input 
                type="checkbox" 
                checked={block.checked} 
                readOnly 
                className="mt-1"
              />
              <span className={`text-gray-700 ${block.checked ? 'line-through text-gray-500' : ''}`}>
                {block.content}
              </span>
            </div>
          );
        
        case 'quote':
          return (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-2">
              {block.content}
            </blockquote>
          );
        
        case 'code':
          return (
            <pre className="bg-gray-100 rounded p-3 text-sm font-mono overflow-x-auto mb-2">
              <code>{block.content}</code>
            </pre>
          );
        
        case 'callout':
          return (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
              <div className="flex items-start gap-2">
                {block.icon && <span className="text-lg">{block.icon}</span>}
                <span className="text-gray-700">{block.content}</span>
              </div>
            </div>
          );
        
        case 'divider':
          return <hr className="border-gray-300 my-4" />;
        
        case 'image':
          return (
            <div className="mb-4">
              {block.url && (
                <img 
                  src={block.url} 
                  alt={block.content} 
                  className="max-w-full h-auto rounded"
                />
              )}
              {block.content && block.content !== 'Image' && (
                <p className="text-sm text-gray-500 mt-1">{block.content}</p>
              )}
            </div>
          );
        
        case 'bookmark':
        case 'embed':
          return (
            <div className="border border-gray-200 rounded p-3 mb-2">
              <a 
                href={block.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                {block.content || block.url}
              </a>
            </div>
          );
        
        case 'toggle':
          return (
            <div className="mb-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {block.content}
              </button>
            </div>
          );
        
        default:
          return (
            <div className="text-gray-500 text-sm mb-2 italic">
              {block.content}
            </div>
          );
      }
    };

    return (
      <div className="block-item">
        {renderBlockContent()}
        
        {/* Render children if they exist and toggle is expanded */}
        {block.children && block.children.length > 0 && (
          <div className={`ml-4 ${block.type === 'toggle' && !isExpanded ? 'hidden' : ''}`}>
            {block.children.map((childBlock) => (
              <BlockRenderer key={childBlock.id} block={childBlock} />
            ))}
          </div>
        )}
      </div>
    );
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Tasks Extracted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {processedPages.size}
              </div>
              <p className="text-sm text-gray-500">Pages processed</p>
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            onClick={() => fetchPageContent(page)}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View Content
                          </Button>
                          
                          {processedPages.has(page.id) ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
                              <CheckSquare className="h-3 w-3" />
                              Tasks Extracted
                            </Badge>
                          ) : (
                            <Button
                              onClick={() => extractTasks(page)}
                              size="sm"
                              disabled={extractingTasks === page.id}
                              className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700"
                            >
                              <Zap className={`h-3 w-3 ${extractingTasks === page.id ? "animate-spin" : ""}`} />
                              {extractingTasks === page.id ? "Extracting..." : "Extract Tasks"}
                            </Button>
                          )}
                          
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

        {/* Task Extraction Info */}
        

        {/* Content Modal */}
        {showContentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedPage?.title || 'Untitled'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedPage?.object === 'database' ? 'Database' : 'Page'} • 
                    Last edited {selectedPage ? formatTimestamp(selectedPage.last_edited_time) : ''}
                  </p>
                </div>
                <Button
                  onClick={closeContentModal}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                {isLoadingContent ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading content...</span>
                  </div>
                ) : pageContent ? (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-500 mb-4">
                      {pageContent.totalBlocks} blocks found
                    </div>
                    {pageContent.content.map((block) => (
                      <BlockRenderer key={block.id} block={block} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No content available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Multi-Step Loader */}
        <MultiStepLoader 
          loadingStates={notionLoadingStates} 
          loading={isLoading || !!extractingTasks} 
          duration={1500}
          loop={false}
        />
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