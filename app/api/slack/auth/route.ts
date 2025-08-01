import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.SLACK_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/slack/callback`;

  // Bot token scopes for reading messages and user info
  const botScopes = [
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

  // User token scopes (minimal, mainly for user identification)
  const userScopes = [
    'identity.basic'
  ].join(',');

  const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${botScopes}&user_scope=${userScopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(slackAuthUrl);
}