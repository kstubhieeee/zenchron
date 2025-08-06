"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TasksIcon,
  AIIcon,
  GmailIcon,
  CalendarIcon,
  SettingsIcon,
  LogoutIcon,
  RobotIcon,
  SlackIcon,
  NotionIcon,
  GMeetIcon,
} from "@/components/icons/glass-icons";
import { MenuIcon, ChevronLeftIcon } from "@/components/icons/menu-icons";
import { LoaderOne } from "@/components/ui/loader";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed

  // Redirect to sign-in if not authenticated, or to tasks if accessing old dashboard route
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && typeof window !== 'undefined') {
      // Redirect from old dashboard route to tasks
      if (window.location.pathname === "/dashboard") {
        router.push("/dashboard/tasks");
      }
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoaderOne />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const menuItems = [
    { title: "Tasks", url: "/dashboard/tasks", icon: TasksIcon },
    { title: "AI Assistant", url: "/dashboard/ai", icon: AIIcon },
    { title: "Gmail Sync", url: "/dashboard/gmail", icon: GmailIcon },
    { title: "Slack", url: "/dashboard/slack", icon: SlackIcon },
    { title: "Notion", url: "/dashboard/notion", icon: NotionIcon },
    { title: "Google Meet", url: "/dashboard/gmeet", icon: GMeetIcon },
    { title: "Calendar", url: "/dashboard/calendar", icon: CalendarIcon },
    { title: "Settings", url: "/dashboard/settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex">
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white/80 backdrop-blur-sm shadow-xl border-r border-gray-200/50 flex flex-col transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <div className={`p-4 border-b ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg">
              <img 
                src="/zenn.png" 
                alt="Zenchron Logo" 
                className="h-7 w-7 object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">Zenchron</span>
                <span className="text-xs text-gray-500">AI Task Manager</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`flex items-center gap-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900 transition-all duration-200 group ${isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'}`}
                  title={isCollapsed ? item.title : undefined}
                >
                  <IconComponent
                    size={isCollapsed ? 24 : 20}
                    className="text-gray-500 group-hover:text-blue-600 transition-colors flex-shrink-0"
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50/50">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                  {session.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Sign Out"
              >
                <LogoutIcon size={18} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                  {session.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate text-gray-900">
                  {session.user?.name}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {session.user?.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Sign Out"
              >
                <LogoutIcon size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <MenuIcon size={18} className="text-gray-600" />
              ) : (
                <ChevronLeftIcon size={18} className="text-gray-600" />
              )}
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Zenchron</h1>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}