"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AIPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-600">Get intelligent task prioritization and suggestions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gemini AI Integration</CardTitle>
            <CardDescription>
              AI-powered task analysis and prioritization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-gray-500">AI assistant will be implemented in the next step</p>
              <p className="text-sm text-gray-400 mt-2">
                This will provide intelligent task prioritization and scheduling suggestions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}