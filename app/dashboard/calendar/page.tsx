"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Sync and manage your Google Calendar events</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Google Calendar Integration</CardTitle>
            <CardDescription>
              View and create calendar events for your tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-gray-500">Calendar integration will be implemented in the next step</p>
              <p className="text-sm text-gray-400 mt-2">
                This will show your calendar and allow automatic event creation for tasks
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}