"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TaskInput } from "@/components/tasks/TaskInput";
import { useState } from "react";

export default function TasksPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTasksCreated = (tasks: any[]) => {
    // Refresh the kanban board
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Task Manager</h1>
          <p className="text-gray-600">AI-powered task organization with voice input and smart categorization</p>
        </div>

        <TaskInput onTasksCreated={handleTasksCreated} />
        
        <KanbanBoard refreshTrigger={refreshKey} />
      </div>
    </DashboardLayout>
  );
}