"use client";

import React, { useState } from 'react';
import { Task, TaskStatus, TaskType, TaskPriority, TaskTypeConfig } from '@/lib/models/Task';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Tag, MoreVertical, Play, Pause, Check, Trash2, AlertCircle, CalendarPlus, Brain, Repeat, Flame, Lightbulb, Timer, RefreshCw, CalendarDays, Paperclip, Clock3, Zap } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onCreateCalendarEvent?: (taskId: string) => void;
}

const getTaskTypeStyles = (type: TaskType) => {
  switch (type) {
    case TaskType.DEEP_WORK:
      return {
        backgroundColor: '#f3e8ff', // purple-50
        borderColor: '#c4b5fd', // purple-300
        icon: <Brain className="h-4 w-4 text-purple-700" />,
        badgeStyle: { backgroundColor: '#ddd6fe', color: '#6d28d9', border: '1px solid #c4b5fd' }
      };
    case TaskType.FOLLOW_UP:
      return {
        backgroundColor: '#dbeafe', // blue-50
        borderColor: '#93c5fd', // blue-300
        icon: <Repeat className="h-4 w-4 text-blue-700" />,
        badgeStyle: { backgroundColor: '#bfdbfe', color: '#1d4ed8', border: '1px solid #93c5fd' }
      };
    case TaskType.HIGH_PRIORITY:
      return {
        backgroundColor: '#fee2e2', // red-50
        borderColor: '#fca5a5', // red-300
        icon: <Flame className="h-4 w-4 text-red-700" />,
        badgeStyle: { backgroundColor: '#fecaca', color: '#dc2626', border: '1px solid #fca5a5' }
      };
    case TaskType.QUICK_WIN:
      return {
        backgroundColor: '#dcfce7', // green-50
        borderColor: '#86efac', // green-300
        icon: <Lightbulb className="h-4 w-4 text-green-700" />,
        badgeStyle: { backgroundColor: '#bbf7d0', color: '#15803d', border: '1px solid #86efac' }
      };
    case TaskType.DEADLINE_BASED:
      return {
        backgroundColor: '#fed7aa', // orange-50
        borderColor: '#fdba74', // orange-300
        icon: <Timer className="h-4 w-4 text-orange-700" />,
        badgeStyle: { backgroundColor: '#fde68a', color: '#c2410c', border: '1px solid #fdba74' }
      };
    case TaskType.RECURRING:
      return {
        backgroundColor: '#e0e7ff', // indigo-50
        borderColor: '#a5b4fc', // indigo-300
        icon: <RefreshCw className="h-4 w-4 text-indigo-700" />,
        badgeStyle: { backgroundColor: '#c7d2fe', color: '#4338ca', border: '1px solid #a5b4fc' }
      };
    case TaskType.SCHEDULED_EVENT:
      return {
        backgroundColor: '#ecfdf5', // emerald-50
        borderColor: '#6ee7b7', // emerald-300
        icon: <CalendarDays className="h-4 w-4 text-emerald-700" />,
        badgeStyle: { backgroundColor: '#d1fae5', color: '#047857', border: '1px solid #6ee7b7' }
      };
    case TaskType.REFERENCE_INFO:
      return {
        backgroundColor: '#f1f5f9', // slate-50
        borderColor: '#cbd5e1', // slate-300
        icon: <Paperclip className="h-4 w-4 text-slate-700" />,
        badgeStyle: { backgroundColor: '#e2e8f0', color: '#475569', border: '1px solid #cbd5e1' }
      };
    case TaskType.WAITING_BLOCKED:
      return {
        backgroundColor: '#fef3c7', // yellow-50
        borderColor: '#fcd34d', // yellow-300
        icon: <Clock3 className="h-4 w-4 text-yellow-700" />,
        badgeStyle: { backgroundColor: '#fde047', color: '#a16207', border: '1px solid #fcd34d' }
      };
    case TaskType.CUSTOM:
      return {
        backgroundColor: '#fce7f3', // pink-50
        borderColor: '#f9a8d4', // pink-300
        icon: <Zap className="h-4 w-4 text-pink-700" />,
        badgeStyle: { backgroundColor: '#fbcfe8', color: '#be185d', border: '1px solid #f9a8d4' }
      };
    default:
      return {
        backgroundColor: '#f9fafb', // gray-50
        borderColor: '#d1d5db', // gray-300
        icon: <Tag className="h-4 w-4 text-gray-700" />,
        badgeStyle: { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }
      };
  }
};

export function TaskCard({ task, onStatusChange, onDelete, onCreateCalendarEvent }: TaskCardProps) {
  const [showActions, setShowActions] = useState(false);
  
  const typeConfig = TaskTypeConfig[task.type];
  const typeStyles = getTaskTypeStyles(task.type);
  
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.CRITICAL: return '#ef4444'; // red-500
      case TaskPriority.URGENT: return '#f97316'; // orange-500
      case TaskPriority.HIGH: return '#eab308'; // yellow-500
      case TaskPriority.MEDIUM: return '#3b82f6'; // blue-500
      case TaskPriority.LOW: return '#9ca3af'; // gray-400
      default: return '#9ca3af';
    }
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.CRITICAL: return 'Critical';
      case TaskPriority.URGENT: return 'Urgent';
      case TaskPriority.HIGH: return 'High';
      case TaskPriority.MEDIUM: return 'Medium';
      case TaskPriority.LOW: return 'Low';
      default: return 'Medium';
    }
  };

  const getNextStatus = () => {
    switch (task.status) {
      case TaskStatus.TODO:
        return TaskStatus.IN_PROGRESS;
      case TaskStatus.IN_PROGRESS:
        return TaskStatus.DONE;
      case TaskStatus.WAITING:
        return TaskStatus.IN_PROGRESS;
      default:
        return TaskStatus.TODO;
    }
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case TaskStatus.TODO:
        return <Play className="h-3 w-3" />;
      case TaskStatus.IN_PROGRESS:
        return <Check className="h-3 w-3" />;
      case TaskStatus.WAITING:
        return <Play className="h-3 w-3" />;
      default:
        return <Play className="h-3 w-3" />;
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;
  const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

  return (
    <div 
      className={`relative rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group ${
        task.status === TaskStatus.DONE ? 'opacity-75' : ''
      }`}
      style={{
        backgroundColor: typeStyles.backgroundColor,
        border: `1px solid ${typeStyles.borderColor}`
      }}
    >
      
      
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            {typeStyles.icon}
            <span 
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
              style={typeStyles.badgeStyle}
            >
              {typeConfig.label}
            </span>
            {task.status === TaskStatus.IN_PROGRESS && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
                In Progress
              </span>
            )}
            {task.status === TaskStatus.DONE && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                <Check className="w-3 h-3 mr-1" />
                Done
              </span>
            )}
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/50"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
            {showActions && (
              <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[140px]">
                {task.status !== TaskStatus.DONE && (
                  <>
                    <button
                      onClick={() => {
                        onStatusChange(task._id!, getNextStatus());
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      {getStatusIcon()}
                      {task.status === TaskStatus.IN_PROGRESS ? 'Complete' : 'Start'}
                    </button>
                    {task.status !== TaskStatus.WAITING && (
                      <button
                        onClick={() => {
                          onStatusChange(task._id!, TaskStatus.WAITING);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Pause className="h-3 w-3" />
                        Set Waiting
                      </button>
                    )}
                  </>
                )}
                {task.status === TaskStatus.DONE && (
                  <button
                    onClick={() => {
                      onStatusChange(task._id!, TaskStatus.TODO);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reopen Task
                  </button>
                )}
                {onCreateCalendarEvent && !task.metadata?.hasCalendarEvent && task.status !== TaskStatus.DONE && (
                  <button
                    onClick={() => {
                      onCreateCalendarEvent(task._id!);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <CalendarPlus className="h-3 w-3" />
                    Create Event
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete(task._id!);
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className={`font-semibold text-gray-900 text-sm mb-2 line-clamp-2 leading-5 ${
          task.status === TaskStatus.DONE ? 'line-through text-gray-500' : ''
        }`}>
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-4">
            {task.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2">
          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center gap-2 text-xs ${
              isOverdue ? 'text-red-600' : isDueToday ? 'text-orange-600' : 'text-gray-500'
            }`}>
              {isOverdue && <AlertCircle className="h-3 w-3" />}
              <Calendar className="h-3 w-3" />
              <span>Due: {formatDate(task.dueDate)}</span>
            </div>
          )}

          {/* Scheduled Time */}
          {task.scheduledTime && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Scheduled: {formatDate(task.scheduledTime)}</span>
            </div>
          )}

          {/* Duration and Priority */}
          <div className="flex items-center justify-between">
            {task.estimatedDuration && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{task.estimatedDuration}min</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getPriorityColor(task.priority) }}
              />
              <span>{getPriorityLabel(task.priority)}</span>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Tag className="h-3 w-3" />
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 2).map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(0, 0, 0, 0.1)' }}
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs text-gray-400">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Action */}
        {task.status !== TaskStatus.DONE && task.status !== TaskStatus.CANCELLED && (
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
            {task.status === TaskStatus.WAITING ? (
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs font-medium bg-white/70 hover:bg-white/90"
                onClick={() => onStatusChange(task._id!, TaskStatus.IN_PROGRESS)}
              >
                <Play className="h-3 w-3" />
                <span className="ml-1">Resume Task</span>
              </Button>
            ) : task.status === TaskStatus.IN_PROGRESS ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs font-medium bg-white/70 hover:bg-white/90"
                  onClick={() => onStatusChange(task._id!, TaskStatus.DONE)}
                >
                  <Check className="h-3 w-3" />
                  <span className="ml-1">Complete</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs font-medium bg-white/70 hover:bg-white/90"
                  onClick={() => onStatusChange(task._id!, TaskStatus.WAITING)}
                >
                  <Pause className="h-3 w-3" />
                  <span className="ml-1">Pause</span>
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs font-medium bg-white/70 hover:bg-white/90"
                onClick={() => onStatusChange(task._id!, TaskStatus.IN_PROGRESS)}
              >
                <Play className="h-3 w-3" />
                <span className="ml-1">Start Task</span>
              </Button>
            )}
          </div>
        )}

        {/* Completed Task Indicator */}
        {task.status === TaskStatus.DONE && (
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
              <Check className="h-4 w-4" />
              <span>Completed</span>
              {task.completedAt && (
                <span className="text-xs text-gray-500">
                  {new Date(task.completedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
