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

    console.log("Fetching relevant Slack messages for user:", userId);

    const relevantMessages: any[] = [];
    const debugInfo: any[] = [];

    // Strategy 1: Get DMs and Group DMs (these are always relevant)
    const dmChannels = await slack.conversations.list({
      types: 'im,mpim',
      limit: 50
    });

    if (dmChannels.channels) {
      for (const channel of dmChannels.channels) {
        try {
          const messagesResponse = await slack.conversations.history({
            channel: channel.id!,
            limit: 20 // Reduced limit for DMs
          });

          if (messagesResponse.messages) {
            const dmMessages = messagesResponse.messages
              .filter((message: any) => message.user !== userId) // Exclude your own messages
              .map((message: any) => ({
                ...message,
                channel_id: channel.id,
                channel_name: 'Direct Message',
                channel_type: channel.is_mpim ? 'group_dm' : 'dm',
                mentions_user: false,
                is_from_user: false,
                is_dm: true,
                priority: 'high' // DMs are high priority
              }));

            relevantMessages.push(...dmMessages);
            debugInfo.push({
              channel: 'DM',
              messageCount: dmMessages.length,
              type: channel.is_mpim ? 'group_dm' : 'dm'
            });
          }
        } catch (error) {
          console.error(`Error fetching DM messages:`, error);
        }
      }
    }

    // Strategy 2: Get channels where user is mentioned
    // Only check channels user is a member of to avoid permission issues
    const memberChannels = await slack.conversations.list({
      types: 'public_channel,private_channel',
      limit: 50
    });

    if (memberChannels.channels) {
      for (const channel of memberChannels.channels.filter(c => c.is_member)) {
        try {
          const messagesResponse = await slack.conversations.history({
            channel: channel.id!,
            limit: 30 // Reduced limit for channels
          });

          if (messagesResponse.messages) {
            // Only get messages that mention the user and are not from the user
            const mentionMessages = messagesResponse.messages
              .filter((message: any) => {
                const mentionsUser = message.text?.includes(`<@${userId}>`);
                const isFromUser = message.user === userId;
                return mentionsUser && !isFromUser;
              })
              .map((message: any) => ({
                ...message,
                channel_id: channel.id,
                channel_name: channel.name || 'Unknown Channel',
                channel_type: 'channel',
                mentions_user: true,
                is_from_user: false,
                is_dm: false,
                priority: 'high' // Mentions are high priority
              }));

            if (mentionMessages.length > 0) {
              relevantMessages.push(...mentionMessages);
              debugInfo.push({
                channel: channel.name,
                messageCount: mentionMessages.length,
                type: 'channel_mentions'
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching mentions from channel ${channel.name}:`, error);
        }
      }
    }

    // Strategy 3: Get threads where user has replied
    // This is more complex and would require tracking thread_ts, skipping for now
    // but can be added if needed

    console.log("Total relevant messages found:", relevantMessages.length);

    // Sort messages by timestamp (newest first)
    relevantMessages.sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts));

    // Get user info for message authors (batch request for efficiency)
    const userIds = [...new Set(relevantMessages.map(msg => msg.user))].filter(Boolean);
    const usersInfo: any = {};

    // Batch user info requests
    for (const uid of userIds.slice(0, 30)) { // Limit to prevent rate limiting
      try {
        const userInfo = await slack.users.info({ user: uid });
        if (userInfo.user) {
          usersInfo[uid] = userInfo.user;
        }
      } catch (error) {
        console.error(`Error fetching user info for ${uid}:`, error);
      }
    }

    // Add user info to messages
    const enrichedMessages = relevantMessages.map(message => ({
      ...message,
      user_info: usersInfo[message.user] || null
    }));

    return NextResponse.json({
      messages: enrichedMessages.slice(0, 50), // Limit final results
      totalFetched: enrichedMessages.length,
      userId,
      debug: {
        strategiesUsed: ['DMs', 'Mentions in channels'],
        channelsChecked: debugInfo.length,
        channelDetails: debugInfo
      }
    });

  } catch (error) {
    console.error("Slack messages error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Slack messages",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}