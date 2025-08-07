"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TaskInput } from "@/components/tasks/TaskInput";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { CheckSquare, Clock, Target, Plus, Filter, Calendar, Zap, BarChart3, Users, Timer } from 'lucide-react';

// Example Button Component
interface ExampleButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  example: string;
  gradient: string;
}

function ExampleButton({ icon, title, description, example, gradient, onExampleClick }: ExampleButtonProps & { onExampleClick: (example: string) => void }) {
  const handleClick = () => {
    onExampleClick(example);
    // Scroll to the textarea
    setTimeout(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <Button
      variant="outline"
      className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-lg transition-all duration-200 border-2 hover:border-transparent group"
      onClick={handleClick}
    >
      <div className={`w-full flex items-center justify-between mb-2`}>
        <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} text-white group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Click to use
          </div>
        </div>
      </div>
      <div className="text-left w-full">
        <h5 className="font-semibold text-gray-900 text-sm mb-1">{title}</h5>
        <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
      </div>
    </Button>
  );
}

export default function TasksPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [taskInput, setTaskInput] = useState('');
  const [quickStats, setQuickStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });

  const handleTasksCreated = (tasks: any[]) => {
    setRefreshKey(prev => prev + 1);
  };



  return (
    <DashboardLayout>
      <div className="space-y-8">


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
        <Card className="border-0 bg-gradient-to-r from-white to-gray-50">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Plus className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="font-bodoni text-xl">Create New Tasks</CardTitle>
                <CardDescription>Use voice input, type manually, or try our quick examples</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <TaskInput
              onTasksCreated={handleTasksCreated}
              externalInput={taskInput}
              onInputChange={setTaskInput}
            />

            {/* Quick Example Buttons */}

          </CardContent>
        </Card>

        {/* Enhanced Kanban Board */}
        <div className="space-y-4">


          <KanbanBoard refreshTrigger={refreshKey} />
        </div>

        {/* Quick Actions */}

      </div>
    </DashboardLayout>
  );
}
