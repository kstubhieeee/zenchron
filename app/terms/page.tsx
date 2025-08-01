"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Shield, Users, Database, AlertTriangle } from "lucide-react";

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Use</h1>
          <p className="text-gray-600">Last updated: February 8, 2025</p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                By accessing and using this productivity dashboard application ("Service"), you agree to be bound by these Terms of Use ("Terms"). 
                If you do not agree to these Terms, please do not use our Service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>Service Description</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>Our Service provides:</p>
              <ul>
                <li>Integration with third-party services (Gmail, Slack, Notion, Google Calendar)</li>
                <li>AI-powered productivity features</li>
                <li>Task management and organization tools</li>
                <li>Dashboard for managing connected services</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>You agree to:</h4>
              <ul>
                <li>Provide accurate and complete information when creating an account</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the Service in compliance with all applicable laws and regulations</li>
                <li>Not attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Not use the Service for any illegal, harmful, or abusive purposes</li>
                <li>Respect the terms of service of integrated third-party platforms</li>
              </ul>

              <h4>You are responsible for:</h4>
              <ul>
                <li>All activities that occur under your account</li>
                <li>Maintaining appropriate permissions for connected services</li>
                <li>Backing up any important data</li>
                <li>Monitoring your usage and associated costs</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data and Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data and Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>Data Collection:</h4>
              <ul>
                <li>We collect data necessary to provide our services</li>
                <li>Third-party integrations may require access to your data on those platforms</li>
                <li>We use authentication tokens to access connected services on your behalf</li>
              </ul>

              <h4>Data Usage:</h4>
              <ul>
                <li>Your data is used solely to provide the requested services</li>
                <li>We do not sell or share your personal data with third parties for marketing</li>
                <li>AI features may process your data to provide intelligent insights</li>
              </ul>

              <h4>Data Security:</h4>
              <ul>
                <li>We implement reasonable security measures to protect your data</li>
                <li>You can revoke access to connected services at any time</li>
                <li>We recommend regularly reviewing your connected integrations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Integrations</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>Our Service integrates with third-party platforms including:</p>
              <ul>
                <li><strong>Google Services:</strong> Gmail, Google Calendar</li>
                <li><strong>Slack:</strong> Workspace communication</li>
                <li><strong>Notion:</strong> Note-taking and database management</li>
                <li><strong>AI Services:</strong> For intelligent features</li>
              </ul>

              <p>
                Your use of these integrations is subject to the respective terms of service of each platform. 
                We are not responsible for the availability, functionality, or policies of third-party services.
              </p>
            </CardContent>
          </Card>

          {/* Limitations and Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Limitations and Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>Service Availability:</h4>
              <ul>
                <li>We strive for high availability but cannot guarantee 100% uptime</li>
                <li>Maintenance windows may temporarily interrupt service</li>
                <li>Third-party service outages may affect functionality</li>
              </ul>

              <h4>Disclaimer of Warranties:</h4>
              <p>
                The Service is provided "as is" without warranties of any kind. We disclaim all warranties, 
                express or implied, including but not limited to merchantability, fitness for a particular purpose, 
                and non-infringement.
              </p>

              <h4>Limitation of Liability:</h4>
              <p>
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including but not limited to loss of profits, 
                data, or business interruption.
              </p>
            </CardContent>
          </Card>

          {/* Account Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Account Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>Your Rights:</h4>
              <ul>
                <li>You may terminate your account at any time</li>
                <li>You can disconnect individual integrations without closing your account</li>
                <li>You may request data deletion upon account closure</li>
              </ul>

              <h4>Our Rights:</h4>
              <ul>
                <li>We may suspend or terminate accounts that violate these Terms</li>
                <li>We may discontinue the Service with reasonable notice</li>
                <li>We reserve the right to refuse service to anyone</li>
              </ul>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of significant 
                changes via email or through the Service. Continued use of the Service after changes constitutes 
                acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                If you have questions about these Terms of Use, please contact us at:
              </p>
              <ul>
                <li>Email: [email]</li>
                <li>Address: [address]</li>
              </ul>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center pt-8">
            <p className="text-gray-500 text-sm">
              These Terms of Use are effective as of February 8, 2025
            </p>
            <div className="mt-4">
              <Link href="/">
                <Button>Return to Application</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}