"use client";

import { useState } from "react";
import { TaskInputNoAuth } from "@/components/tasks/TaskInputNoAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Calendar, Clock, Tag } from "lucide-react";

export default function TestTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks-noauth');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTasksCreated = (newTasks: any[]) => {
    console.log('Tasks created:', newTasks);
    fetchTasks(); // Refresh the task list
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'bg-red-100 text-red-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 1: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'high_priority': return 'bg-red-100 text-red-800';
      case 'quick_win': return 'bg-green-100 text-green-800';
      case 'deep_work': return 'bg-purple-100 text-purple-800';
      case 'deadline_based': return 'bg-orange-100 text-orange-800';
      case 'scheduled_event': return 'bg-blue-100 text-blue-800';
      case 'follow_up': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Task Manager - Test Mode</h1>
            <p className="text-gray-600">Testing AI-powered task categorization and MongoDB integration</p>
          </div>
          <Button onClick={fetchTasks} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Tasks
          </Button>
        </div>

        <TaskInputNoAuth onTasksCreated={handleTasksCreated} />

        <Card>
          <CardHeader>
            <CardTitle>Generated Tasks ({tasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No tasks yet. Add some tasks above to see them here!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <div className="flex gap-2">
                        <Badge className={getTypeColor(task.type)}>
                          {task.type.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          Priority {task.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {formatDate(task.dueDate)}</span>
                        </div>
                      )}
                      
                      {task.scheduledTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Scheduled: {formatDate(task.scheduledTime)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{task.estimatedDuration} min</span>
                      </div>
                      
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          <span>{task.tags.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}