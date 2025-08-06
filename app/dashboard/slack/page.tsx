"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { RefreshCw, MessageSquare, Users, Hash, User, Clock, Zap, CheckCircle, AlertCircle, Sparkles, ArrowRight, Activity } from 'lucide-react';
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { LoaderOne } from "@/components/ui/loader";
import { useSyncDialog } from "@/hooks/use-sync-dialog";
import { SyncDialog } from "@/components/ui/sync-dialog";

interface SlackMessage {
  ts: string;
  text: string;
  user: string;
  user_info?: {
    name: string;
    real_name: string;
    profile: {
      image_48: string;
      display_name: string;
    };
  };
  channel_id: string;
  channel_name: string;
  channel_type: 'channel' | 'dm' | 'group_dm';
  thread_ts?: string;
}

interface SlackResponse {
  messages: SlackMessage[];
  totalFetched: number;
  botUserId: string;
  humanUserId: string;
  debug?: {
    channelsChecked: number;
    channelDetails: any[];
    strategiesUsed: string[];
  };
}

function SlackPageContent() {
  const [messages, setMessages] = useState<SlackMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [slackToken, setSlackToken] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [stats, setStats] = useState({ total: 0, mentions: 0, dms: 0, tasksExtracted: 0 });
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const { dialogState, showSuccess, showError, closeDialog } = useSyncDialog();
  const [extractingTasks, setExtractingTasks] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const slackLoadingStates = [
    { text: "Connecting to Slack workspace..." },
    { text: "Fetching channel list..." },
    { text: "Scanning for relevant messages..." },
    { text: "Analyzing message content..." },
    { text: "Extracting actionable tasks..." },
    { text: "Organizing tasks by priority..." },
    { text: "Syncing with task manager..." },
    { text: "Tasks successfully extracted!" },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const team = urlParams.get('team');
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (success && token && team) {
      setIsConnected(true);
      setSlackToken(token);
      setTeamName(team);
      localStorage.setItem('slack_token', token);
      localStorage.setItem('slack_team', team);
      window.history.replaceState({}, '', '/dashboard/slack');
      loadSyncState();
    } else if (error) {
      console.error('Slack OAuth error:', error);
      alert(`Slack connection failed: ${error}`);
    } else {
      const storedToken = localStorage.getItem('slack_token');
      const storedTeam = localStorage.getItem('slack_team');
      if (storedToken && storedTeam) {
        setIsConnected(true);
        setSlackToken(storedToken);
        setTeamName(storedTeam);
        loadSyncState();
      }
    }
  }, [mounted]);

  const loadSyncState = async () => {
    try {
      const response = await fetch("/api/slack/sync-state");
      if (response.ok) {
        const data = await response.json();
        if (data.hasSynced) {
          setStats(prev => ({
            ...prev,
            tasksExtracted: data.tasksExtracted
          }));
          setLastSync(data.lastSync ? new Date(data.lastSync) : null);
        }
      }
    } catch (error) {
      console.error("Failed to load sync state:", error);
    }
  };

  const connectSlack = () => {
    window.location.href = '/api/slack/auth';
  };

  const disconnectSlack = () => {
    setIsConnected(false);
    setSlackToken(null);
    setTeamName("");
    setMessages([]);
    setStats({ total: 0, mentions: 0, dms: 0, tasksExtracted: 0 });
    setLastSync(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('slack_token');
      localStorage.removeItem('slack_team');
    }
  };

  const extractTasks = async () => {
    if (!slackToken) return;

    setExtractingTasks(true);
    try {
      const response = await fetch("/api/slack/extract-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: slackToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract tasks");
      }

      const data = await response.json();
      
      setStats(prev => ({
        ...prev,
        tasksExtracted: prev.tasksExtracted + data.tasksExtracted
      }));
      
      setLastSync(new Date());
      
      if (data.tasksExtracted > 0) {
        showSuccess(
          'Tasks Extracted Successfully!',
          `Successfully extracted ${data.tasksExtracted} tasks from ${data.messagesProcessed} Slack messages.`,
          'Check the Tasks page to see your new action items from Slack conversations.'
        );
      } else {
        showSuccess(
          'Slack Sync Complete',
          `No new tasks found. Processed ${data.messagesProcessed} messages.`,
          'All your Slack messages have been analyzed. Try again later for new content.'
        );
      }
      
    } catch (error) {
      console.error("Failed to extract tasks:", error);
      showError(
        'Task Extraction Failed',
        `Failed to extract tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Please check your Slack connection and try again.'
      );
    } finally {
      setExtractingTasks(false);
    }
  };

  const fetchMessages = async () => {
    if (!slackToken) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/slack/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: slackToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data: SlackResponse = await response.json();
      setMessages(data.messages);
      setDebugInfo(data.debug);
      
      const mentions = data.messages.filter(msg => msg.text.includes('<@')).length;
      const dms = data.messages.filter(msg => msg.channel_type === 'dm' || msg.channel_type === 'group_dm').length;
      
      setStats(prev => ({
        ...prev,
        total: data.totalFetched,
        mentions,
        dms,
        tasksExtracted: prev.tasksExtracted
      }));

    } catch (error) {
      console.error("Failed to fetch messages:", error);
      showError(
        'Message Fetch Failed',
        'Failed to fetch Slack messages.',
        'Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (ts: string) => {
    const date = new Date(parseFloat(ts) * 1000);
    return date.toLocaleString();
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'dm': return <User className="h-4 w-4" />;
      case 'group_dm': return <Users className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  const getChannelBadgeColor = (type: string) => {
    switch (type) {
      case 'dm': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'group_dm': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const extractSenderName = (from: string) => {
    return from || 'Unknown User';
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
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Slack Intelligence</h1>
                  <p className="text-purple-100 text-lg">Transform conversations into actionable tasks</p>
                </div>
              </div>
              {isConnected ? (
                <div className="flex gap-3">
                  <Button 
                    onClick={fetchMessages} 
                    disabled={isLoading || extractingTasks}
                    className="bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-sm"
                    variant="outline"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    {isLoading ? "Fetching..." : "Fetch Messages"}
                  </Button>
                  <Button 
                    onClick={extractTasks} 
                    disabled={isLoading || extractingTasks}
                    className="bg-white text-purple-600 hover:bg-gray-100"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Extract Tasks
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={disconnectSlack}
                    className="border-red-300/50 text-red-200 hover:bg-red-500/20"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={connectSlack} 
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Connect to Slack
                </Button>
              )}
            </div>
          </div>  
        </div>

        {/* Enhanced Connection Status */}
        <Card className="border ">
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
                    {isConnected ? `Connected to ${teamName}` : 'Not connected to Slack'}
                  </h3>
                  <p className="text-gray-600">
                    {isConnected ? 'Ready to analyze messages and extract tasks' : 'Connect your workspace to get started'}
                  </p>
                </div>
              </div>
              {!isConnected && (
                <Button onClick={connectSlack} className="bg-blue-600 text-white hover:bg-purple-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Connect Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {isConnected && (
          <>
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0  bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-700">{stats.total}</div>
                      <div className="text-blue-600 font-medium">Total Messages</div>
                      <div className="text-blue-500 text-sm">Relevant to you</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0  bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-700">{stats.mentions}</div>
                      <div className="text-green-600 font-medium">Mentions</div>
                      <div className="text-green-500 text-sm">Messages mentioning you</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0  bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <User className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-purple-700">{stats.dms}</div>
                      <div className="text-purple-600 font-medium">Direct Messages</div>
                      <div className="text-purple-500 text-sm">DMs and group messages</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0  bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Zap className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-orange-700">{stats.tasksExtracted}</div>
                      <div className="text-orange-600 font-medium">Tasks Extracted</div>
                      <div className="text-orange-500 text-sm">
                        {lastSync ? `Last sync: ${lastSync.toLocaleTimeString()}` : 'Never synced'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Messages List */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Activity className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Recent Messages</CardTitle>
                      <CardDescription>Messages that mention you or require your attention</CardDescription>
                    </div>
                  </div>
                  {messages.length > 0 && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-3 py-1">
                      {messages.length} messages
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="p-4 bg-purple-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <MessageSquare className="h-10 w-10 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Click "Fetch Messages" to load your recent Slack messages and start extracting tasks
                    </p>
                    <Button onClick={fetchMessages} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                      Fetch Messages Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={`${message.channel_id}-${message.ts}`}
                        className="group border border-gray-200 rounded-xl p-6 hover: hover:border-gray-300 transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={message.user_info?.profile?.image_48 || '/placeholder.svg?height=48&width=48&query=user+avatar'}
                            alt={message.user_info?.real_name || 'User'}
                            className="w-12 h-12 rounded-full border-2 border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="font-semibold text-gray-900 text-lg">
                                {message.user_info?.real_name || message.user_info?.name || 'Unknown User'}
                              </span>
                              <Badge 
                                variant="secondary" 
                                className={`${getChannelBadgeColor(message.channel_type)} border`}
                              >
                                {getChannelIcon(message.channel_type)}
                                <span className="ml-1">{message.channel_name}</span>
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                {formatTimestamp(message.ts)}
                              </div>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-3">
                              {message.text}
                            </p>
                            <div className="flex items-center gap-2">
                              {message.thread_ts && (
                                <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                                  Thread Reply
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 ml-auto"
                              >
                                View in Slack
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
          </>
        )}

        {/* Multi-Step Loader */}
        <MultiStepLoader 
          loadingStates={slackLoadingStates} 
          loading={extractingTasks} 
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

export default function SlackPage() {
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

  return <SlackPageContent />;
}
