import { NextRequest, NextResponse } from "next/server";
import { WebClient } from '@slack/web-api';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "No Slack token provided" }, { status: 401 });
    }

    const slack = new WebClient(token);

    // Get user info to find the current user's ID
    const authTest = await slack.auth.test();
    const userId = authTest.user_id;

    console.log("Fetching Slack messages for user:", userId);

    // Get list of channels
    const channelsResponse = await slack.conversations.list({
      types: 'public_channel,private_channel,mpim,im',
      limit: 50
    });

    if (!channelsResponse.channels) {
      return NextResponse.json({ messages: [], totalFetched: 0 });
    }

    const allMessages: any[] = [];

    // Fetch messages from each channel
    for (const channel of channelsResponse.channels.slice(0, 10)) { // Limit to 10 channels for performance
      try {
        const messagesResponse = await slack.conversations.history({
          channel: channel.id!,
          limit: 20, // Limit messages per channel
        });

        if (messagesResponse.messages) {
          // Filter messages that mention the user or are replies to their messages
          const relevantMessages = messagesResponse.messages.filter((message: any) => {
            // Check if message mentions the user
            const mentionsUser = message.text?.includes(`<@${userId}>`);
            
            // Check if it's a reply to user's message (simplified check)
            const isReplyToUser = message.thread_ts && message.user !== userId;
            
            // Check if user is in a DM or group DM
            const isDM = channel.is_im || channel.is_mpim;
            
            return mentionsUser || isReplyToUser || isDM;
          });

          // Add channel context to messages
          const messagesWithContext = relevantMessages.map((message: any) => ({
            ...message,
            channel_id: channel.id,
            channel_name: channel.name || 'Direct Message',
            channel_type: channel.is_im ? 'dm' : channel.is_mpim ? 'group_dm' : 'channel'
          }));

          allMessages.push(...messagesWithContext);
        }
      } catch (error) {
        console.error(`Error fetching messages from channel ${channel.id}:`, error);
      }
    }

    // Sort messages by timestamp (newest first)
    allMessages.sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts));

    // Get user info for message authors
    const userIds = [...new Set(allMessages.map(msg => msg.user))];
    const usersInfo: any = {};

    for (const uid of userIds) {
      if (uid) {
        try {
          const userInfo = await slack.users.info({ user: uid });
          if (userInfo.user) {
            usersInfo[uid] = userInfo.user;
          }
        } catch (error) {
          console.error(`Error fetching user info for ${uid}:`, error);
        }
      }
    }

    // Add user info to messages
    const enrichedMessages = allMessages.map(message => ({
      ...message,
      user_info: usersInfo[message.user] || null
    }));

    return NextResponse.json({
      messages: enrichedMessages.slice(0, 50), // Limit to 50 most recent relevant messages
      totalFetched: enrichedMessages.length,
      userId
    });

  } catch (error) {
    console.error("Slack messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Slack messages" },
      { status: 500 }
    );
  }
}