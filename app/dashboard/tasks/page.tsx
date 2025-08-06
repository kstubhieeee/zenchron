"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TaskInput } from "@/components/tasks/TaskInput";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { CheckSquare, Clock, Target, TrendingUp, Plus, Filter, Calendar, Zap, BarChart3, Users, Timer } from 'lucide-react';

export default function TasksPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [quickStats, setQuickStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });

  const handleTasksCreated = (tasks: any[]) => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    // Fetch quick stats
    fetchQuickStats();
  }, [refreshKey]);

  const fetchQuickStats = async () => {
    try {
      const response = await fetch('/api/tasks/stats');
      if (response.ok) {
        const data = await response.json();
        setQuickStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-8 text-white">
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Smart Task Manager</h1>
                <p className="text-blue-100 text-lg">AI-powered task organization with voice input and smart categorization</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{quickStats.total}</div>
                  <div className="text-blue-200 text-sm">Total Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-300">{quickStats.completed}</div>
                  <div className="text-blue-200 text-sm">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">{quickStats.inProgress}</div>
                  <div className="text-blue-200 text-sm">In Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards - Mobile */}
        <div className="grid grid-cols-2 md:hidden gap-4">
          <Card className="border-0  bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">{quickStats.completed}</div>
                  <div className="text-green-600 text-sm">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0  bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">{quickStats.inProgress}</div>
                  <div className="text-blue-600 text-sm">In Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Task Input */}
        <Card className="border-0  bg-gradient-to-r from-white to-gray-50">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Plus className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Create New Tasks</CardTitle>
                <CardDescription>Use voice input or type to create AI-categorized tasks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TaskInput onTasksCreated={handleTasksCreated} />
          </CardContent>
        </Card>

        {/* Enhanced Kanban Board */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Task Board</h2>
                <p className="text-gray-600">Organize and track your tasks by category and status</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Calendar View</span>
              </Button>
            </div>
          </div>
          
          <KanbanBoard refreshTrigger={refreshKey} />
        </div>

        {/* Quick Actions */}
        <Card className="border-0 ">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-16 flex-col space-y-2 hover:bg-blue-50 hover:border-blue-200">
                <Timer className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Start Focus Session</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col space-y-2 hover:bg-green-50 hover:border-green-200">
                <Target className="h-5 w-5 text-green-600" />
                <span className="text-sm">Set Daily Goals</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col space-y-2 hover:bg-purple-50 hover:border-purple-200">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-sm">Team Collaboration</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
