import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 max-w-2xl mx-auto px-4">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            Smart Auto-Prioritizer
          </h1>
          <p className="text-xl text-gray-600">
            AI-powered task management that learns from your emails, calendar, and habits to automatically prioritize your work
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-gray-500">
            Get started by connecting your Google account to sync tasks from Gmail and Google Calendar
          </p>

          <Link href="/auth/signin">
            <Button size="lg" className="px-8 py-3 text-lg">
              Get Started with Google
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-semibold">AI-Powered</h3>
            <p className="text-sm text-gray-600">Intelligent prioritization using Gemini AI</p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-2xl">📧</span>
            </div>
            <h3 className="font-semibold">Email Integration</h3>
            <p className="text-sm text-gray-600">Auto-extract tasks from Gmail</p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="font-semibold">Calendar Sync</h3>
            <p className="text-sm text-gray-600">Seamless Google Calendar integration</p>
          </div>
        </div>
      </div>
    </div>
  );
}
