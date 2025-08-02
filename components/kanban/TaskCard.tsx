"use client";

import React, { useState } from 'react';
import { Task, TaskStatus, TaskTypeConfig } from '@/lib/models/Task';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Calendar, 
  Tag, 
  MoreVertical, 
  Play, 
  Pause, 
  Check, 
  Trash2,
  AlertCircle
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const [showActions, setShowActions] = useState(false);
  
  const typeConfig = TaskTypeConfig[task.type];
  
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'bg-red-500';
      case 4: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 2: return 'bg-blue-500';
      case 1: return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 5: return 'Critical';
      case 4: return 'Urgent';
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
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
    <Card className="group hover:shadow-md transition-shadow duration-200 relative">
      <CardContent className="p-3">
        {/* Priority indicator */}
        <div className={`absolute top-0 left-0 w-1 h-full ${getPriorityColor(task.priority)} rounded-l-lg`} />
        
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm">{typeConfig.emoji}</span>
            <Badge variant="secondary" className={`text-xs ${typeConfig.color}`}>
              {typeConfig.label}
            </Badge>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
            {showActions && (
              <div className="absolute right-0 top-6 bg-white border rounded-md shadow-lg z-10 py-1 min-w-[120px]">
                <button
                  onClick={() => {
                    onStatusChange(task._id!, getNextStatus());
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
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
                    className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Pause className="h-3 w-3" />
                    Set Waiting
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete(task._id!);
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-1">
          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${
              isOverdue ? 'text-red-600' : isDueToday ? 'text-orange-600' : 'text-gray-500'
            }`}>
              {isOverdue && <AlertCircle className="h-3 w-3" />}
              <Calendar className="h-3 w-3" />
              <span>Due: {formatDate(task.dueDate)}</span>
            </div>
          )}

          {/* Scheduled Time */}
          {task.scheduledTime && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Scheduled: {formatDate(task.scheduledTime)}</span>
            </div>
          )}

          {/* Duration */}
          {task.estimatedDuration && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedDuration}min</span>
            </div>
          )}

          {/* Priority */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
            <span>{getPriorityLabel(task.priority)}</span>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Tag className="h-3 w-3" />
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="bg-gray-100 px-1 rounded text-xs">
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
        <div className="mt-3 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            className="w-full h-7 text-xs"
            onClick={() => onStatusChange(task._id!, getNextStatus())}
          >
            {getStatusIcon()}
            {task.status === TaskStatus.IN_PROGRESS ? 'Complete' : 'Start Task'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}