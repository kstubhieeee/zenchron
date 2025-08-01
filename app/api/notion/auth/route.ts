import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.NOTION_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/notion/callback`;

  if (!clientId) {
    return NextResponse.json({ error: "Notion client ID not configured" }, { status: 500 });
  }

  // Notion OAuth URL with required parameters
  const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(notionAuthUrl);
}