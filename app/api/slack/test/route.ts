import { NextRequest, NextResponse } from "next/server";
import { WebClient } from '@slack/web-api';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "No Slack token provided" }, { status: 401 });
    }

    const slack = new WebClient(token);

    // Test 1: Auth test
    console.log("Testing auth...");
    const authTest = await slack.auth.test();
    console.log("Auth test result:", authTest);

    // Test 2: Get user info
    console.log("Getting user info...");
    const userInfo = await slack.users.info({ user: authTest.user_id! });
    console.log("User info:", userInfo.user?.name);

    // Test 3: List conversations (channels)
    console.log("Listing conversations...");
    const conversations = await slack.conversations.list({
      types: 'public_channel,private_channel,mpim,im',
      limit: 20
    });
    console.log("Found conversations:", conversations.channels?.length);

    // Test 4: Try to join the main channel
    const mainChannel = conversations.channels?.find(c => c.name === 'all-kstubhie');
    if (mainChannel) {
      console.log("Found main channel, trying to join...");
      try {
        await slack.conversations.join({ channel: mainChannel.id! });
        console.log("Successfully joined channel");
      } catch (joinError) {
        console.log("Join error:", joinError);
      }
    }

    // Test 5: Get messages from a public channel (without joining)
    if (mainChannel) {
      console.log("Trying to get messages from main channel...");
      try {
        const messages = await slack.conversations.history({
          channel: mainChannel.id!,
          limit: 5
        });
        console.log("Messages found:", messages.messages?.length);
      } catch (msgError) {
        console.log("Message fetch error:", msgError);
      }
    }

    return NextResponse.json({
      success: true,
      auth: {
        user_id: authTest.user_id,
        team: authTest.team,
        user: authTest.user
      },
      channels: conversations.channels?.map(c => ({
        id: c.id,
        name: c.name,
        is_member: c.is_member,
        is_private: c.is_private,
        is_im: c.is_im,
        is_mpim: c.is_mpim
      })),
      mainChannelFound: !!mainChannel,
      mainChannelId: mainChannel?.id
    });

  } catch (error) {
    console.error("Slack test error:", error);
    return NextResponse.json(
      { 
        error: "Test failed",
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}