"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { RefreshCw, Calendar, Clock, Zap, Plus, ExternalLink, CheckCircle, AlertCircle, CalendarDays, Timer, Target, Sparkles, ArrowRight, Users } from 'lucide-react';
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { LoaderOne } from "@/components/ui/loader";
import { useSyncDialog } from "@/hooks/use-sync-dialog";
import { SyncDialog } from "@/components/ui/sync-dialog";

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
  const { dialogState, showSuccess, showError, closeDialog } = useSyncDialog();

  const calendarLoadingStates = [
    { text: "Connecting to Google Calendar..." },
    { text: "Fetching calendar events..." },
    { text: "Analyzing your schedule..." },
    { text: "Finding optimal time slots..." },
    { text: "Generating smart suggestions..." },
    { text: "Optimizing for productivity..." },
    { text: "Creating calendar events..." },
    { text: "Calendar optimization complete!" },
  ];

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
        showSuccess(
          'Calendar Sync Complete!',
          `Successfully synced ${data.eventsProcessed} calendar events and created ${data.tasksCreated} tasks.`,
          'Check the Tasks page to see your new action items from calendar events.'
        );
      } else {
        const errorData = await response.json();
        showError(
          'Calendar Sync Failed',
          `Sync failed: ${errorData.error}`,
          'Please check your Google Calendar connection and try again.'
        );
      }
    } catch (error) {
      console.error("Calendar sync failed:", error);
      showError(
        'Calendar Sync Error',
        'Calendar sync failed due to network error.',
        'Please check your connection and try again.'
      );
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
        showSuccess(
          'Calendar Event Created!',
          `Successfully created "${suggestion.title}" in your Google Calendar.`,
          `Event ID: ${data.eventId}. The event is now scheduled and you'll receive notifications.`
        );
        setSuggestions(prev => prev.filter(s => s.taskId !== suggestion.taskId));
      } else {
        const errorData = await response.json();
        showError(
          'Event Creation Failed',
          `Failed to create event: ${errorData.error}`,
          'Please check your Google Calendar permissions and try again.'
        );
      }
    } catch (error) {
      console.error("Create event failed:", error);
      showError(
        'Event Creation Error',
        'Failed to create calendar event due to network error.',
        'Please check your connection and try again.'
      );
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
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'call': return 'bg-green-100 text-green-800 border-green-200';
      case 'presentation': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'appointment': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'work_session': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
                  <Calendar className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Calendar Intelligence</h1>
                  <p className="text-blue-100 text-lg">AI-powered scheduling and event optimization</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={syncCalendarEvents} 
                  disabled={isSyncing}
                  className="bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-sm"
                  variant="outline"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Syncing..." : "Sync Calendar"}
                </Button>
                <Button 
                  onClick={analyzeTasks} 
                  disabled={isAnalyzing}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <Sparkles className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
                  {isAnalyzing ? "Analyzing..." : "AI Analysis"}
                </Button>
              </div>
            </div>
          </div>
         
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0  bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-700">{stats.eventsProcessed}</div>
                  <div className="text-blue-600 font-medium">Events Processed</div>
                  <div className="text-blue-500 text-sm">Calendar events analyzed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0  bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-700">{stats.tasksCreated}</div>
                  <div className="text-green-600 font-medium">Tasks Created</div>
                  <div className="text-green-500 text-sm">From calendar events</div>
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
                  <div className="text-3xl font-bold text-orange-700">{stats.suggestionsFound}</div>
                  <div className="text-orange-600 font-medium">AI Suggestions</div>
                  <div className="text-orange-500 text-sm">Smart event recommendations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Calendar Event Suggestions */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Smart Event Suggestions</CardTitle>
                  <CardDescription>AI-recommended calendar events for your tasks</CardDescription>
                </div>
              </div>
              {suggestions.length > 0 && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-3 py-1">
                  {suggestions.length} suggestions
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 bg-purple-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <CalendarDays className="h-10 w-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No suggestions found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Click "AI Analysis" to analyze your tasks and find opportunities for calendar events
                </p>
                <Button onClick={analyzeTasks} disabled={isAnalyzing} className="bg-purple-600 hover:bg-purple-700">
                  <Sparkles className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
                  Analyze Tasks Now
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.taskId}
                    className="group border border-gray-200 rounded-xl p-6 hover: hover:border-gray-300 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">{getEventTypeIcon(suggestion.eventType)}</span>
                          <h3 className="font-semibold text-gray-900 text-lg truncate">
                            {suggestion.title}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={`${getEventTypeBadgeColor(suggestion.eventType)} border`}
                          >
                            {suggestion.eventType.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-gray-700">Task:</span>
                              <span className="text-gray-600 ml-2">{suggestion.taskTitle}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-gray-700">Suggested Time:</span>
                              <span className="text-gray-600 ml-2">{formatDateTime(suggestion.suggestedStartTime)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <Timer className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-gray-700">Duration:</span>
                              <span className="text-gray-600 ml-2">{suggestion.suggestedDuration} minutes</span>
                            </div>
                          </div>
                          
                          {suggestion.attendees.length > 0 && (
                            <div className="flex items-start gap-2">
                              <Users className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-gray-700">Attendees:</span>
                                <span className="text-gray-600 ml-2">{suggestion.attendees.join(', ')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-blue-800">AI Reasoning:</span>
                              <p className="text-blue-700 mt-1">{suggestion.reasoning}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <Button
                          onClick={() => createCalendarEvent(suggestion)}
                          disabled={creatingEvents.has(suggestion.taskId)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {creatingEvents.has(suggestion.taskId) ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Create Event
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => window.open('https://calendar.google.com', '_blank')}
                          variant="outline"
                          className="hover:bg-gray-50"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
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

        {/* Multi-Step Loader */}
        <MultiStepLoader 
          loadingStates={calendarLoadingStates} 
          loading={isLoading || isSyncing || isAnalyzing} 
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

export default function CalendarPage() {
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

  return <CalendarPageContent />;
}
