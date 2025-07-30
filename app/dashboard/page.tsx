"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {session?.user?.name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Connected</CardTitle>
              <CardDescription>Google account successfully linked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <img 
                  src={session?.user?.image || ""} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{session?.user?.name}</p>
                  <p className="text-sm text-gray-500">{session?.user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gmail Access</CardTitle>
              <CardDescription>Ready to sync emails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Can read emails to extract tasks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calendar Access</CardTitle>
              <CardDescription>Ready to sync events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Can read and create calendar events
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              Your Google account is connected with the following permissions:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Gmail read access - to extract tasks from emails</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Google Calendar read/write access - to sync and create events</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Profile information - for personalization</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                🎉 Great! Your account is ready. In the next step, we'll implement the AI-powered task extraction and kanban board.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your task management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium">📧 Sync Gmail Tasks</h3>
                <p className="text-sm text-gray-600 mt-1">Extract tasks from your recent emails</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium">📅 View Calendar</h3>
                <p className="text-sm text-gray-600 mt-1">See your upcoming events and schedule</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium">🤖 AI Assistant</h3>
                <p className="text-sm text-gray-600 mt-1">Get AI-powered task prioritization</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium">📋 Kanban Board</h3>
                <p className="text-sm text-gray-600 mt-1">Organize tasks visually</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}