import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Notion OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/notion?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/notion?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/notion/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/notion?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful:', { 
      workspace_name: tokenData.workspace_name,
      bot_id: tokenData.bot_id 
    });

    // Redirect back to dashboard with success parameters
    const redirectUrl = new URL(`${process.env.NEXTAUTH_URL}/dashboard/notion`);
    redirectUrl.searchParams.set('success', 'true');
    redirectUrl.searchParams.set('workspace', tokenData.workspace_name || 'Unknown');
    redirectUrl.searchParams.set('token', tokenData.access_token);

    return NextResponse.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('Notion callback error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/notion?error=callback_failed`);
  }
}