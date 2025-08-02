"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { RefreshCw, Calendar, Clock, Zap, Plus, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";

interface CalendarSuggestion {
  taskId: string;
  taskTitle: string;
  title: string;
  description: string;
  suggestedStartTime: string;
  suggestedDuration: number;
  eventType: string;
  attendees: string[];
  reasoning: string;
}

interface SyncStats {
  eventsProcessed: number;
  tasksCreated: number;
  suggestionsFound: number;
}

function CalendarPageContent() {
  const [suggestions, setSuggestions] = useState<CalendarSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stats, setStats] = useState<SyncStats>({ eventsProcessed: 0, tasksCreated: 0, suggestionsFound: 0 });
  const [mounted, setMounted] = useState(false);
  const [creatingEvents, setCreatingEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    analyzeTasks();
  }, []);

  const syncCalendarEvents = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/calendar/sync-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          eventsProcessed: data.eventsProcessed,
          tasksCreated: data.tasksCreated
        }));
        alert(`Successfully synced ${data.eventsProcessed} calendar events and created ${data.tasksCreated} tasks!`);
      } else {
        const errorData = await response.json();
        alert(`Sync failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Calendar sync failed:", error);
      alert("Calendar sync failed. Check console for details.");
    } finally {
      setIsSyncing(false);
    }
  };

  const analyzeTasks = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/calendar/analyze-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setStats(prev => ({
          ...prev,
          suggestionsFound: data.suggestions?.length || 0
        }));
      } else {
        const errorData = await response.json();
        console.error("Task analysis failed:", errorData.error);
      }
    } catch (error) {
      console.error("Task analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const testCalendarIntegration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/calendar/test-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Calendar integration test successful!\n\n📅 Created test event: "${data.eventTitle}"\n🕐 Start time: ${new Date(data.startTime).toLocaleString()}\n🔗 Event ID: ${data.eventId}\n\nYou can view it in Google Calendar!`);
      } else {
        const errorData = await response.json();
        alert(`❌ Calendar integration test failed!\n\nError: ${errorData.error}\n\nSuggestion: ${errorData.suggestion || 'Please check your Google Calendar permissions.'}`);
      }
    } catch (error) {
      console.error("Calendar test failed:", error);
      alert("❌ Calendar integration test failed due to network error.\n\nPlease check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const createCalendarEvent = async (suggestion: CalendarSuggestion) => {
    setCreatingEvents(prev => new Set([...prev, suggestion.taskId]));
    try {
      const response = await fetch("/api/calendar/create-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: suggestion.taskId,
          title: suggestion.title,
          description: suggestion.description,
          startTime: suggestion.suggestedStartTime,
          endTime: new Date(new Date(suggestion.suggestedStartTime).getTime() + suggestion.suggestedDuration * 60 * 1000).toISOString(),
          attendees: suggestion.attendees
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Calendar event created successfully! Event ID: ${data.eventId}`);
        // Remove this suggestion from the list
        setSuggestions(prev => prev.filter(s => s.taskId !== suggestion.taskId));
      } else {
        const errorData = await response.json();
        alert(`Failed to create event: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Create event failed:", error);
      alert("Failed to create calendar event. Check console for details.");
    } finally {
      setCreatingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(suggestion.taskId);
        return newSet;
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'meeting': return '👥';
      case 'call': return '📞';
      case 'presentation': return '📊';
      case 'appointment': return '📅';
      case 'work_session': return '💻';
      default: return '📋';
    }
  };

  const getEventTypeBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'call': return 'bg-green-100 text-green-800';
      case 'presentation': return 'bg-purple-100 text-purple-800';
      case 'appointment': return 'bg-orange-100 text-orange-800';
      case 'work_session': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Google Calendar Integration</h1>
            <p className="text-gray-600">Sync calendar events with tasks and create events from task suggestions</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={syncCalendarEvents} 
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync Calendar"}
            </Button>
            <Button 
              onClick={analyzeTasks} 
              disabled={isAnalyzing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
              {isAnalyzing ? "Analyzing..." : "Analyze Tasks"}
            </Button>
            <Button 
              onClick={testCalendarIntegration} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Test Integration
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Events Processed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.eventsProcessed}
              </div>
              <p className="text-sm text-gray-500">Calendar events analyzed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Tasks Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.tasksCreated}
              </div>
              <p className="text-sm text-gray-500">From calendar events</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Event Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.suggestionsFound}
              </div>
              <p className="text-sm text-gray-500">Tasks needing calendar events</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Event Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar Event Suggestions</CardTitle>
            <CardDescription>
              AI-suggested calendar events for your tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No calendar event suggestions found</p>
                <p className="text-sm text-gray-400">
                  Click "Analyze Tasks" to find tasks that could benefit from calendar events
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.taskId}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getEventTypeIcon(suggestion.eventType)}</span>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {suggestion.title}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getEventTypeBadgeColor(suggestion.eventType)}`}
                          >
                            {suggestion.eventType.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                          <p><strong>Task:</strong> {suggestion.taskTitle}</p>
                          <p><strong>Description:</strong> {suggestion.description}</p>
                          <p className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <strong>Suggested Time:</strong> {formatDateTime(suggestion.suggestedStartTime)}
                          </p>
                          <p><strong>Duration:</strong> {suggestion.suggestedDuration} minutes</p>
                          {suggestion.attendees.length > 0 && (
                            <p><strong>Attendees:</strong> {suggestion.attendees.join(', ')}</p>
                          )}
                        </div>
                        
                        <div className="p-2 bg-blue-50 rounded-md">
                          <p className="text-xs text-blue-800">
                            <strong>AI Reasoning:</strong> {suggestion.reasoning}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => createCalendarEvent(suggestion)}
                          disabled={creatingEvents.has(suggestion.taskId)}
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          {creatingEvents.has(suggestion.taskId) ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Create Event
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => window.open('https://calendar.google.com', '_blank')}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open Calendar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Calendar Integration Works</CardTitle>
            <CardDescription>
              Understanding the bidirectional sync between tasks and calendar events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">Tasks → Calendar Events:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• AI analyzes tasks for scheduling needs</li>
                  <li>• Suggests calendar events for meetings, calls, presentations</li>
                  <li>• Creates events with proper timing and attendees</li>
                  <li>• Links tasks to calendar events to prevent duplicates</li>
                  <li>• Uses task metadata for event details</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Calendar Events → Tasks:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Syncs existing calendar events (last 30 days + next 30 days)</li>
                  <li>• AI determines which events need action items</li>
                  <li>• Creates preparation or follow-up tasks</li>
                  <li>• Avoids duplicating personal/non-actionable events</li>
                  <li>• Maintains sync state to prevent duplicates</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Duplicate Prevention:</strong> The system uses unique identifiers and sync tracking 
                to ensure tasks and calendar events are never duplicated, even across multiple syncs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function CalendarPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">Google Calendar Integration</h1>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return <CalendarPageContent />;
}