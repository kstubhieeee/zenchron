"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/ui/kibo-ui/kanban";
import { useState } from "react";
import { Plus } from "lucide-react";

// Sample task data
const columns = [
  { id: "pending", name: "Pending", color: "#F59E0B" },
  { id: "done", name: "Done", color: "#10B981" },
];

const sampleTasks = [
  {
    id: "1",
    name: "Review client presentation slides",
    description: "Go through the Q3 presentation and make necessary updates",
    priority: "High",
    dueDate: new Date("2025-02-05"),
    column: "pending",
    source: "Gmail",
  },
  {
    id: "2", 
    name: "Schedule team meeting",
    description: "Coordinate with team for weekly sync",
    priority: "Medium",
    dueDate: new Date("2025-02-03"),
    column: "pending",
    source: "Manual",
  },
  {
    id: "3",
    name: "Update project documentation",
    description: "Add new features to the project README",
    priority: "Low",
    dueDate: new Date("2025-02-10"),
    column: "done",
    source: "AI Generated",
  },
  {
    id: "4",
    name: "Prepare monthly report",
    description: "Compile data and insights for January",
    priority: "High",
    dueDate: new Date("2025-02-01"),
    column: "done",
    source: "Gmail",
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High": return "bg-red-100 text-red-800";
    case "Medium": return "bg-yellow-100 text-yellow-800";
    case "Low": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getSourceColor = (source: string) => {
  switch (source) {
    case "Gmail": return "bg-blue-100 text-blue-800";
    case "AI Generated": return "bg-purple-100 text-purple-800";
    case "Manual": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export default function TasksPage() {
  const [tasks, setTasks] = useState(sampleTasks);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600">Manage your AI-prioritized tasks</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Add Task
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Task Board</CardTitle>
            <CardDescription>
              Drag and drop tasks between columns to update their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[600px]">
              <KanbanProvider
                columns={columns}
                data={tasks}
                onDataChange={setTasks}
              >
                {(column) => (
                  <KanbanBoard id={column.id} key={column.id}>
                    <KanbanHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: column.color }}
                          />
                          <span className="font-semibold">{column.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {tasks.filter(task => task.column === column.id).length}
                        </Badge>
                      </div>
                    </KanbanHeader>
                    <KanbanCards id={column.id}>
                      {(task: typeof tasks[number]) => (
                        <KanbanCard
                          column={column.id}
                          id={task.id}
                          key={task.id}
                          name={task.name}
                        >
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-medium text-sm text-gray-900 mb-1">
                                {task.name}
                              </h3>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {task.description}
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getPriorityColor(task.priority)}`}
                              >
                                {task.priority}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getSourceColor(task.source)}`}
                              >
                                {task.source}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Due: {formatDate(task.dueDate)}</span>
                              {task.dueDate < new Date() && task.column === "pending" && (
                                <Badge variant="destructive" className="text-xs">
                                  Overdue
                                </Badge>
                              )}
                            </div>
                          </div>
                        </KanbanCard>
                      )}
                    </KanbanCards>
                  </KanbanBoard>
                )}
              </KanbanProvider>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {tasks.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {tasks.filter(task => task.column === "pending").length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(task => task.column === "done").length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}