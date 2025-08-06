"use client";

import React, { useState, useEffect } from 'react';
import { Task, TaskType, TaskStatus, TaskTypeConfig } from '@/lib/models/Task';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Filter, Brain, Repeat, Flame, Lightbulb, Timer, RepeatIcon as RecurringIcon, CalendarDays, Paperclip, Clock3, Zap } from 'lucide-react';

interface KanbanBoardProps {
  onAddTask?: () => void;
  refreshTrigger?: number;
}

const getTypeIcon = (type: TaskType) => {
  switch (type) {
    case TaskType.DEEP_WORK: return <Brain className="h-4 w-4 text-purple-600" />;
    case TaskType.FOLLOW_UP: return <Repeat className="h-4 w-4 text-blue-600" />;
    case TaskType.HIGH_PRIORITY: return <Flame className="h-4 w-4 text-red-600" />;
    case TaskType.QUICK_WIN: return <Lightbulb className="h-4 w-4 text-green-600" />;
    case TaskType.DEADLINE_BASED: return <Timer className="h-4 w-4 text-orange-600" />;
    case TaskType.RECURRING: return <RecurringIcon className="h-4 w-4 text-indigo-600" />;
    case TaskType.SCHEDULED_EVENT: return <CalendarDays className="h-4 w-4 text-emerald-600" />;
    case TaskType.REFERENCE_INFO: return <Paperclip className="h-4 w-4 text-slate-600" />;
    case TaskType.WAITING_BLOCKED: return <Clock3 className="h-4 w-4 text-yellow-600" />;
    case TaskType.CUSTOM: return <Zap className="h-4 w-4 text-pink-600" />;
    default: return <Paperclip className="h-4 w-4 text-gray-600" />;
  }
};

export function KanbanBoard({ onAddTask, refreshTrigger }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<TaskType | 'all'>('all');

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks');
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

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: taskId, status: newStatus })
      });

      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        ));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTasks(prev => prev.filter(task => task._id !== taskId));
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const createCalendarEvent = async (taskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) {
      alert('Task not found!');
      return;
    }

    try {
      console.log(`Creating calendar event for task: ${task.title}`);
      
      const suggestedStartTime = task.scheduledTime || task.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const suggestedDuration = task.estimatedDuration || 60;
      
      let eventTitle = task.title;
      if (!eventTitle.toLowerCase().includes('meeting') && 
          !eventTitle.toLowerCase().includes('call') && 
          !eventTitle.toLowerCase().includes('presentation') &&
          !eventTitle.toLowerCase().includes('interview') &&
          !eventTitle.toLowerCase().includes('demo')) {
        eventTitle = `Work on: ${task.title}`;
      }

      const createResponse = await fetch('/api/calendar/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: taskId,
          title: eventTitle,
          description: task.description || `Dedicated time to work on: ${task.title}\n\nTask Type: ${task.type}\nPriority: ${task.priority}/5\nEstimated Duration: ${task.estimatedDuration || 60} minutes`,
          startTime: suggestedStartTime,
          endTime: new Date(new Date(suggestedStartTime).getTime() + suggestedDuration * 60 * 1000).toISOString(),
          attendees: []
        })
      });

      if (createResponse.ok) {
        const eventData = await createResponse.json();
        const eventTime = new Date(suggestedStartTime).toLocaleString();
        
        alert(`✅ Calendar event created successfully!\n\n📅 Event: ${eventTitle}\n🕐 Time: ${eventTime}\n⏱️ Duration: ${suggestedDuration} minutes\n\n🔗 You can view it in Google Calendar.\n\nEvent ID: ${eventData.eventId}`);
        
        setTasks(prev => prev.map(t => 
          t._id === taskId 
            ? { 
                ...t, 
                metadata: { 
                  ...t.metadata, 
                  hasCalendarEvent: true, 
                  googleEventId: eventData.eventId,
                  eventTitle: eventTitle,
                  eventStartTime: suggestedStartTime
                } 
              }
            : t
        ));
        
        console.log(`Successfully created calendar event for task: ${task.title}`);
      } else {
        const errorData = await createResponse.json();
        if (errorData.error === "Event already exists for this task") {
          alert('📅 A calendar event already exists for this task!\n\nCheck your Google Calendar to view the existing event.');
        } else {
          console.error('Calendar event creation failed:', errorData);
          alert(`❌ Failed to create calendar event: ${errorData.error}\n\nPlease try again or check your Google Calendar permissions.`);
        }
      }
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      alert('❌ Failed to create calendar event due to a network or system error.\n\nPlease check your internet connection and try again.');
    }
  };

  const groupedTasks = React.useMemo(() => {
    const filtered = filter === 'all' ? tasks : tasks.filter(task => task.type === filter);
    
    return filtered.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = {};
      }
      if (!acc[task.status][task.type]) {
        acc[task.status][task.type] = [];
      }
      acc[task.status][task.type].push(task);
      return acc;
    }, {} as Record<TaskStatus, Record<TaskType, Task[]>>);
  }, [tasks, filter]);

  const sortTasks = (tasks: Task[]) => {
    return tasks.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      if (a.scheduledTime && b.scheduledTime) {
        return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
      }
      if (a.scheduledTime) return -1;
      if (b.scheduledTime) return 1;
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const columns = [
    { id: TaskStatus.TODO, title: 'To Do', color: 'bg-slate-100' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-blue-100' },
    { id: TaskStatus.WAITING, title: 'Waiting', color: 'bg-amber-100' },
    { id: TaskStatus.DONE, title: 'Done', color: 'bg-emerald-100' }
  ];

  const taskTypes = Object.values(TaskType);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc', padding: '24px' }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Task Board</h2>
            <p className="text-gray-600 mt-1">Organize and track your tasks by category</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as TaskType | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {taskTypes.map(type => (
                  <option key={type} value={type}>
                    {TaskTypeConfig[type].label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={fetchTasks}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="h-10"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            {onAddTask && (
              <Button onClick={onAddTask} size="sm" className="h-10">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {columns.map(column => {
            const columnTasks = Object.values(groupedTasks[column.id] || {}).flat();
            return (
              <div 
                key={column.id} 
                className="rounded-lg shadow-sm p-6"
                style={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
              >
                <div className="text-2xl font-bold text-gray-900">
                  {columnTasks.length}
                </div>
                <div className="text-sm font-medium text-gray-600 mt-1">{column.title}</div>
              </div>
            );
          })}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              title={column.title}
              color={column.color}
              status={column.id}
            >
              {Object.entries(groupedTasks[column.id] || {}).map(([type, typeTasks]) => (
                <div key={type} className="space-y-3">
                  {/* Type Header */}
                  <div 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-sm"
                    style={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                  >
                    {getTypeIcon(type as TaskType)}
                    <span className="text-sm font-medium text-gray-700">
                      {TaskTypeConfig[type as TaskType].label}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {typeTasks.length}
                    </span>
                  </div>
                  
                  {/* Tasks */}
                  {sortTasks(typeTasks).map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onStatusChange={updateTaskStatus}
                      onDelete={deleteTask}
                      onCreateCalendarEvent={createCalendarEvent}
                    />
                  ))}
                </div>
              ))}
            </KanbanColumn>
          ))}
        </div>

        {tasks.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-xl font-medium mb-2">No tasks yet</div>
            <p className="text-gray-500">
              Add your first task to get started with AI-powered organization
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
