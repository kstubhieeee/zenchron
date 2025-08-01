"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Shield, Eye, Lock, Cookie } from "lucide-react";

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: February 8, 2025</p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Our Commitment to Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                This Privacy Policy describes how we collect, use, and protect your information when you use 
                our productivity dashboard application. We are committed to protecting your privacy and being 
                transparent about our data practices.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>Account Information:</h4>
              <ul>
                <li>Email address and name from your Google account</li>
                <li>Profile information from connected services</li>
                <li>Authentication tokens for integrated services</li>
              </ul>

              <h4>Service Data:</h4>
              <ul>
                <li><strong>Gmail:</strong> Email metadata, content for processing features</li>
                <li><strong>Google Calendar:</strong> Event details, scheduling information</li>
                <li><strong>Slack:</strong> Message content, workspace information</li>
                <li><strong>Notion:</strong> Page content, database information</li>
              </ul>

              <h4>Usage Information:</h4>
              <ul>
                <li>Application usage patterns and preferences</li>
                <li>Feature interactions and settings</li>
                <li>Error logs and performance data</li>
              </ul>

              <h4>Technical Information:</h4>
              <ul>
                <li>IP address and browser information</li>
                <li>Device type and operating system</li>
                <li>Session data and cookies</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>Service Provision:</h4>
              <ul>
                <li>Authenticate and authorize access to your accounts</li>
                <li>Sync and display data from connected services</li>
                <li>Provide AI-powered insights and recommendations</li>
                <li>Enable task management and productivity features</li>
              </ul>

              <h4>Service Improvement:</h4>
              <ul>
                <li>Analyze usage patterns to improve functionality</li>
                <li>Debug issues and optimize performance</li>
                <li>Develop new features based on user needs</li>
              </ul>

              <h4>Communication:</h4>
              <ul>
                <li>Send important service updates and notifications</li>
                <li>Respond to support requests and inquiries</li>
                <li>Notify about changes to terms or policies</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing and Disclosure */}
          <Card>
            <CardHeader>
              <CardTitle>Data Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>We DO NOT sell your personal data.</h4>
              
              <h4>We may share information in these limited circumstances:</h4>
              <ul>
                <li><strong>Service Providers:</strong> Third-party services that help us operate (hosting, analytics)</li>
                <li><strong>AI Processing:</strong> Anonymous data for AI model improvements</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
              </ul>

              <h4>Third-Party Integrations:</h4>
              <p>
                When you connect third-party services, we access only the data necessary to provide our features. 
                Your data remains subject to the privacy policies of those services as well.
              </p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>Security Measures:</h4>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication using OAuth 2.0</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and monitoring</li>
              </ul>

              <h4>Token Management:</h4>
              <ul>
                <li>Authentication tokens are securely stored</li>
                <li>Tokens are encrypted and access-controlled</li>
                <li>You can revoke access at any time</li>
                <li>Tokens expire and are refreshed automatically</li>
              </ul>

              <h4>Data Retention:</h4>
              <ul>
                <li>We retain data only as long as necessary for service provision</li>
                <li>You can request data deletion at any time</li>
                <li>Inactive accounts may have data automatically purged</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights and Choices */}
          <Card>
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>Access and Control:</h4>
              <ul>
                <li>View and manage connected integrations</li>
                <li>Disconnect services at any time</li>
                <li>Export your data in standard formats</li>
                <li>Delete your account and associated data</li>
              </ul>

              <h4>Data Rights (where applicable):</h4>
              <ul>
                <li><strong>Access:</strong> Request copies of your personal data</li>
                <li><strong>Correction:</strong> Update inaccurate information</li>
                <li><strong>Deletion:</strong> Request removal of your data</li>
                <li><strong>Portability:</strong> Receive data in a machine-readable format</li>
                <li><strong>Objection:</strong> Object to certain data processing activities</li>
              </ul>

              <h4>Communication Preferences:</h4>
              <ul>
                <li>Opt out of non-essential communications</li>
                <li>Choose notification preferences</li>
                <li>Update contact information</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                Cookies and Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4>We use cookies for:</h4>
              <ul>
                <li>Authentication and session management</li>
                <li>Remembering your preferences and settings</li>
                <li>Analytics to improve our service</li>
                <li>Security and fraud prevention</li>
              </ul>

              <h4>Cookie Types:</h4>
              <ul>
                <li><strong>Essential:</strong> Required for basic functionality</li>
                <li><strong>Functional:</strong> Remember your preferences</li>
                <li><strong>Analytics:</strong> Help us understand usage patterns</li>
              </ul>

              <p>
                You can control cookies through your browser settings, though disabling essential cookies 
                may affect functionality.
              </p>
            </CardContent>
          </Card>

          {/* International Data Transfers */}
          <Card>
            <CardHeader>
              <CardTitle>International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Your data may be processed and stored in countries other than your own. We ensure appropriate 
                safeguards are in place for international transfers, including:
              </p>
              <ul>
                <li>Adequacy decisions by relevant authorities</li>
                <li>Standard contractual clauses</li>
                <li>Certification schemes and codes of conduct</li>
              </ul>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Our Service is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If you become aware that a child has provided 
                us with personal information, please contact us so we can delete such information.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                We encourage you to review this Privacy Policy periodically.
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
                If you have questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <ul>
                <li>Email: [email]</li>
                <li>Address: [address]</li>
              </ul>
              <p>
                For data protection inquiries in the EU, you may also contact your local data protection authority.
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center pt-8">
            <p className="text-gray-500 text-sm">
              This Privacy Policy is effective as of February 8, 2025
            </p>
            <div className="mt-4 space-x-4">
              <Link href="/terms">
                <Button variant="outline">Terms of Use</Button>
              </Link>
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