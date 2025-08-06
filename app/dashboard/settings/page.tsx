"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Mail,
  Shield,
  Bell,
  Palette,
  Trash2,
  LogOut,
  Settings,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import Image from "next/image";
import { LoaderOne } from "@/components/ui/loader";
import { useSyncDialog } from "@/hooks/use-sync-dialog";
import { SyncDialog } from "@/components/ui/sync-dialog";

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: string;
  granted: boolean;
  required: boolean;
}

function SettingsPageContent() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const { dialogState, showSuccess, showError, closeDialog } = useSyncDialog();
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: "gmail",
      name: "Gmail Access",
      description: "Read and manage your Gmail messages to extract tasks and insights",
      icon: "/gmail.svg",
      granted: true,
      required: true
    },
    {
      id: "calendar",
      name: "Google Calendar",
      description: "Access your calendar to optimize scheduling and create events",
      icon: "/calendar.svg",
      granted: true,
      required: true
    },
    {
      id: "gmeet",
      name: "Google Meet",
      description: "Process meeting recordings and extract action items",
      icon: "/gmeet.svg",
      granted: false,
      required: false
    },
    {
      id: "slack",
      name: "Slack Integration",
      description: "Connect to Slack workspaces to monitor messages and extract tasks",
      icon: "/slack.svg",
      granted: false,
      required: false
    },
    {
      id: "notion",
      name: "Notion Workspace",
      description: "Access Notion pages and databases for content analysis",
      icon: "/notion.svg",
      granted: false,
      required: false
    },
    {
      id: "gemini",
      name: "Google Gemini AI",
      description: "Use Gemini AI for advanced task analysis and suggestions",
      icon: "/gemini.svg",
      granted: true,
      required: true
    },
    {
      id: "files",
      name: "File Access",
      description: "Read and organize files for document management",
      icon: "/file.svg",
      granted: false,
      required: false
    },
    {
      id: "web",
      name: "Web Browsing",
      description: "Access web content for research and link analysis",
      icon: "/globe.svg",
      granted: false,
      required: false
    }
  ]);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskReminders: true,
    weeklyDigest: true,
    integrationAlerts: false
  });

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [imageError, setImageError] = useState(false);

  // Custom image loader for Google profile images
  const googleImageLoader = ({ src }: { src: string }) => {
    // Remove any existing size parameters and add our own
    const baseUrl = src.split('=')[0];
    return `${baseUrl}=s80-c`;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePermissionToggle = async (permissionId: string) => {
    const permission = permissions.find(p => p.id === permissionId);
    if (!permission || permission.required) return;

    try {
      const response = await fetch('/api/user/permissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permissionId,
          granted: !permission.granted,
        }),
      });

      if (response.ok) {
        setPermissions(prev =>
          prev.map(p =>
            p.id === permissionId && !p.required
              ? { ...p, granted: !p.granted }
              : p
          )
        );

        showSuccess(
          'Permission Updated',
          `${permission.name} has been ${!permission.granted ? 'granted' : 'revoked'}.`,
          `You can change this setting anytime in your account preferences.`
        );
      } else {
        showError(
          'Permission Update Failed',
          `Failed to ${!permission.granted ? 'grant' : 'revoke'} ${permission.name}.`,
          'Please try again or contact support if the issue persists.'
        );
      }
    } catch (error) {
      console.error('Permission toggle error:', error);
      showError(
        'Permission Error',
        'An error occurred while updating permissions.',
        'Please check your connection and try again.'
      );
    }
  };

  const handleNotificationToggle = async (key: keyof typeof notifications) => {
    const newValue = !notifications[key];

    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [key]: newValue,
        }),
      });

      if (response.ok) {
        setNotifications(prev => ({
          ...prev,
          [key]: newValue
        }));

        showSuccess(
          'Notification Updated',
          `${key.replace(/([A-Z])/g, ' $1').trim()} notifications have been ${newValue ? 'enabled' : 'disabled'}.`,
          'Your notification preferences have been saved.'
        );
      } else {
        showError(
          'Update Failed',
          'Failed to update notification preferences.',
          'Please try again or contact support if the issue persists.'
        );
      }
    } catch (error) {
      console.error('Notification toggle error:', error);
      showError(
        'Notification Error',
        'An error occurred while updating notifications.',
        'Please check your connection and try again.'
      );
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // Handle account deletion
        const response = await fetch('/api/user/delete', {
          method: 'DELETE',
        });

        if (response.ok) {
          showSuccess(
            'Account Deleted',
            'Your account has been successfully deleted. You will be redirected to the homepage.',
            'All your data has been permanently removed from our servers.'
          );
          setTimeout(() => {
            signOut({ callbackUrl: '/' });
          }, 2000);
        } else {
          showError(
            'Deletion Failed',
            'Failed to delete your account. Please try again.',
            'If the problem persists, please contact support.'
          );
        }
      } catch (error) {
        console.error('Account deletion error:', error);
        showError(
          'Deletion Error',
          'An error occurred while deleting your account.',
          'Please check your connection and try again.'
        );
      }
    }
  };

  const handleRefreshPermissions = async () => {
    try {
      // Refresh permissions from server
      const response = await fetch('/api/user/permissions');
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions || permissions);
        showSuccess(
          'Permissions Refreshed',
          'Your app permissions have been successfully updated.',
          `Refreshed ${permissions.length} permission settings from server.`
        );
      } else {
        showError(
          'Refresh Failed',
          'Failed to refresh permissions from server.',
          'Please check your connection and try again.'
        );
      }
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
      showError(
        'Refresh Error',
        'An error occurred while refreshing permissions.',
        'Please check your connection and try again.'
      );
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/user/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'zenchron-data-export.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showSuccess(
          'Data Exported',
          'Your data has been successfully exported and downloaded.',
          'The export file contains all your account data in JSON format.'
        );
      } else {
        showError(
          'Export Failed',
          'Failed to export your data.',
          'Please check your connection and try again.'
        );
      }
    } catch (error) {
      console.error('Data export error:', error);
      showError(
        'Export Error',
        'An error occurred while exporting your data.',
        'Please check your connection and try again.'
      );
    }
  };

  // Debug session data and reset image error when session changes
  useEffect(() => {
    if (session) {
      console.log('Session data:', session);
      console.log('User image URL:', session.user?.image);
      setImageError(false); // Reset image error when session changes
    }
  }, [session]);

  if (!mounted || status === 'loading') {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoaderOne />
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <LoaderOne />
            <p className="mt-4 text-gray-600">Please sign in to access settings</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
        </div>

        {/* Debug Section - Remove this in production */}


        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details and profile settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                {session.user?.image && !imageError ? (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'Profile'}
                      width={80}
                      height={80}
                      className="object-cover"
                      loader={googleImageLoader}
                      unoptimized
                      onError={() => {
                        console.log('Next.js Image failed to load, falling back to default avatar');
                        setImageError(true);
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {session.user?.name || 'Unknown User'}
                </h3>
                <p className="text-gray-600 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {session.user?.email || 'No email'}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">
                    Google Account
                  </Badge>
                  <Badge variant="outline" className="text-green-600">
                    Verified
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">

                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              App Permissions
            </CardTitle>
            <CardDescription>
              Manage which services Zenchron can access
            </CardDescription>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshPermissions}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                      <img
                        src={permission.icon}
                        alt={permission.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{permission.name}</h4>
                        {permission.required && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{permission.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {permission.granted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <Button
                      variant={permission.granted ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handlePermissionToggle(permission.id)}
                      disabled={permission.required}
                    >
                      {permission.granted ? "Revoke" : "Grant"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {key === 'email' && 'Receive notifications via email'}
                      {key === 'push' && 'Browser push notifications'}
                      {key === 'taskReminders' && 'Reminders for upcoming tasks'}
                      {key === 'weeklyDigest' && 'Weekly productivity summary'}
                      {key === 'integrationAlerts' && 'Alerts for integration issues'}
                    </p>
                  </div>
                  <Button
                    variant={value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationToggle(key as keyof typeof notifications)}
                  >
                    {value ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Theme Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how Zenchron looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {(['light', 'dark', 'system'] as const).map((themeOption) => (
                <Button
                  key={themeOption}
                  variant={theme === themeOption ? "default" : "outline"}
                  onClick={() => setTheme(themeOption)}
                  className="capitalize"
                >
                  {themeOption}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Actions
            </CardTitle>
            <CardDescription>
              Manage your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={handleExportData}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Export Data
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Dialog */}
      <SyncDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        success={dialogState.success}
        title={dialogState.title}
        message={dialogState.message}
        details={dialogState.details}
      />
    </DashboardLayout>
  );
}

export default function SettingsPage() {
  return <SettingsPageContent />;
}