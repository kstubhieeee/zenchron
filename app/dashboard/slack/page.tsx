"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { RefreshCw, MessageSquare, Users, Hash, User, Clock, Zap } from "lucide-react";

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
  const [extractingTasks, setExtractingTasks] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const team = urlParams.get('team');
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (success && token && team) {
      setIsConnected(true);
      setSlackToken(token);
      setTeamName(team);
      // Store in localStorage for persistence
      localStorage.setItem('slack_token', token);
      localStorage.setItem('slack_team', team);
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard/slack');
      // Load sync state after connection
      loadSyncState();
    } else if (error) {
      console.error('Slack OAuth error:', error);
      alert(`Slack connection failed: ${error}`);
    } else {
      // Check localStorage for existing connection
      const storedToken = localStorage.getItem('slack_token');
      const storedTeam = localStorage.getItem('slack_team');
      if (storedToken && storedTeam) {
        setIsConnected(true);
        setSlackToken(storedToken);
        setTeamName(storedTeam);
        // Load sync state for existing connection
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
        alert(`Successfully extracted ${data.tasksExtracted} tasks from ${data.messagesProcessed} Slack messages!`);
      } else {
        alert(`No new tasks found. Processed ${data.messagesProcessed} messages.`);
      }
      
      console.log("Task extraction results:", data);
    } catch (error) {
      console.error("Failed to extract tasks:", error);
      alert(`Failed to extract tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExtractingTasks(false);
    }
  };

  const testSlackConnection = async () => {
    if (!slackToken) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/slack/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: slackToken }),
      });

      const data = await response.json();
      console.log("Test results:", data);
      alert(`Test completed! Check console for details. Found ${data.channels?.length || 0} channels.`);
    } catch (error) {
      console.error("Test failed:", error);
      alert("Test failed. Check console for details.");
    } finally {
      setIsLoading(false);
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
      console.log("Received data:", data); // Debug log
      setMessages(data.messages);
      setDebugInfo(data.debug);
      
      // Calculate stats
      const mentions = data.messages.filter(msg => msg.text.includes('<@')).length;
      const dms = data.messages.filter(msg => msg.channel_type === 'dm' || msg.channel_type === 'group_dm').length;
      
      setStats({
        total: data.totalFetched,
        mentions,
        dms,
        tasksExtracted: stats.tasksExtracted // Keep existing count
      });

      console.log("Debug info:", data.debug);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      alert("Failed to fetch Slack messages. Please try again.");
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
      case 'dm': return 'bg-blue-100 text-blue-800';
      case 'group_dm': return 'bg-purple-100 text-purple-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Slack Integration</h1>
            <p className="text-gray-600">View messages that mention you or require your attention</p>
          </div>
          {isConnected ? (
            <div className="flex gap-2">
              <Button 
                onClick={fetchMessages} 
                disabled={isLoading || extractingTasks}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Fetching..." : "Fetch Messages"}
              </Button>
              <Button 
                onClick={extractTasks} 
                disabled={isLoading || extractingTasks}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
              >
                <Zap className={`h-4 w-4 ${extractingTasks ? "animate-spin" : ""}`} />
                {extractingTasks ? "Extracting..." : "Extract Tasks"}
              </Button>
              <Button 
                onClick={testSlackConnection} 
                disabled={isLoading || extractingTasks}
                variant="outline"
                className="flex items-center gap-2"
              >
                Test Connection
              </Button>
              <Button variant="outline" onClick={disconnectSlack}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={connectSlack} className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Connect to Slack
            </Button>
          )}
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">Connected to {teamName}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Total Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.total}
                  </div>
                  <p className="text-sm text-gray-500">Relevant to you</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Mentions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.mentions}
                  </div>
                  <p className="text-sm text-gray-500">Messages mentioning you</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    Direct Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.dms}
                  </div>
                  <p className="text-sm text-gray-500">DMs and group messages</p>
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
                    {stats.tasksExtracted}
                  </div>
                  <p className="text-sm text-gray-500">
                    {lastSync ? `Last sync: ${lastSync.toLocaleTimeString()}` : 'Never synced'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Messages List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>
                  Messages that mention you or require your attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No messages found</p>
                    <p className="text-sm text-gray-400">
                      Click "Fetch Messages" to load your recent Slack messages
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={`${message.channel_id}-${message.ts}`}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={message.user_info?.profile?.image_48 || '/default-avatar.png'}
                            alt={message.user_info?.real_name || 'User'}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900">
                                {message.user_info?.real_name || message.user_info?.name || 'Unknown User'}
                              </span>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getChannelBadgeColor(message.channel_type)}`}
                              >
                                {getChannelIcon(message.channel_type)}
                                <span className="ml-1">{message.channel_name}</span>
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {formatTimestamp(message.ts)}
                              </div>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {message.text}
                            </p>
                            {message.thread_ts && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                Thread Reply
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
          </>
        )}

        {/* Debug Info */}
        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <CardDescription>
                Technical details about the Slack API response
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm"><strong>Total Channels:</strong> {debugInfo.totalChannels}</p>
                  <p className="text-sm"><strong>Channels Checked:</strong> {debugInfo.channelsChecked}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Channel Details:</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {debugInfo.channelDetails?.map((channel: any, index: number) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 mb-1 rounded">
                        <strong>{channel.channel}</strong> ({channel.type}) - 
                        {channel.messageCount} messages - 
                        {channel.isMember ? 'Member' : 'Not Member'}
                        {channel.error && <span className="text-red-600"> - Error: {channel.error}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Extraction Info */}
        
      </div>
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
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Slack Integration</h1>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return <SlackPageContent />;
}