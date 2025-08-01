import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/signin`);
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Slack OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/slack?error=${error}`);
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/slack?error=no_code`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/slack/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      console.error('Slack token exchange error:', tokenData.error);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/slack?error=${tokenData.error}`);
    }

    // Use bot token for API calls (has more permissions)
    const botToken = tokenData.access_token; // This is the bot token in OAuth v2
    const teamName = tokenData.team?.name || 'Unknown Team';

    // Store the Slack token in session storage or database
    // For now, we'll redirect with success and store in localStorage on client side
    const redirectUrl = new URL(`${process.env.NEXTAUTH_URL}/dashboard/slack`);
    redirectUrl.searchParams.set('success', 'true');
    redirectUrl.searchParams.set('team', teamName);
    redirectUrl.searchParams.set('token', botToken);

    return NextResponse.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('Slack callback error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/slack?error=callback_failed`);
  }
}