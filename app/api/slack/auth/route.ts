import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.SLACK_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/slack/callback`;

  // Slack OAuth scopes for reading messages and user info
  const scopes = [
    'channels:read',
    'groups:read',
    'im:read',
    'mpim:read',
    'channels:history',
    'groups:history',
    'im:history',
    'mpim:history',
    'users:read',
    'team:read'
  ].join(',');

  const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(slackAuthUrl);
}