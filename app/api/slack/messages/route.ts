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
    const botUserId = authTest.user_id;

    // For bot tokens, we need to find the human user who installed the bot
    // This is a common pattern - look for the team owner or use a configured user ID
    // For now, we'll use the team owner or fallback to a hardcoded user
    let humanUserId = 'U09923DMKCZ'; // Your human user ID from the curl test

    console.log("Bot user ID:", botUserId);
    console.log("Looking for messages relevant to human user:", humanUserId);

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
              .filter((message: any) => message.user !== humanUserId && message.user !== botUserId) // Exclude your own messages and bot messages
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
              type: channel.is_mpim ? 'group_dm' : 'dm',
              isMember: true // DMs don't have membership concept
            });
          } else {
            debugInfo.push({
              channel: 'DM',
              messageCount: 0,
              type: channel.is_mpim ? 'group_dm' : 'dm',
              isMember: true,
              note: 'No messages found'
            });
          }
        } catch (error) {
          console.error(`Error fetching DM messages:`, error);
          debugInfo.push({
            channel: 'DM',
            messageCount: 0,
            type: channel.is_mpim ? 'group_dm' : 'dm',
            isMember: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    // Strategy 2: Get channels where user is mentioned
    const allChannels = await slack.conversations.list({
      types: 'public_channel,private_channel',
      limit: 50
    });

    if (allChannels.channels) {
      for (const channel of allChannels.channels) {
        try {
          // If not a member of a public channel, try to join it
          if (!channel.is_member && !channel.is_private) {
            console.log(`Trying to join channel: ${channel.name}`);
            try {
              await slack.conversations.join({ channel: channel.id! });
              console.log(`Successfully joined channel: ${channel.name}`);
              channel.is_member = true; // Update the local flag
            } catch (joinError) {
              console.log(`Failed to join channel ${channel.name}:`, joinError);
              debugInfo.push({
                channel: channel.name || channel.id,
                messageCount: 0,
                type: 'channel',
                isMember: false,
                error: 'Failed to join channel'
              });
              continue; // Skip this channel
            }
          }

          // Only proceed if we're a member or it's a private channel we have access to
          if (channel.is_member) {
            const messagesResponse = await slack.conversations.history({
              channel: channel.id!,
              limit: 30 // Reduced limit for channels
            });

            if (messagesResponse.messages) {
              // Only get messages that mention the human user and are not from the user or bot
              const mentionMessages = messagesResponse.messages
                .filter((message: any) => {
                  const mentionsUser = message.text?.includes(`<@${humanUserId}>`);
                  const isFromUser = message.user === humanUserId || message.user === botUserId;
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

              relevantMessages.push(...mentionMessages);
              debugInfo.push({
                channel: channel.name || channel.id,
                messageCount: mentionMessages.length,
                type: 'channel_mentions',
                isMember: true
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching mentions from channel ${channel.name}:`, error);
          debugInfo.push({
            channel: channel.name || channel.id,
            messageCount: 0,
            type: 'channel',
            isMember: channel.is_member || false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
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
      botUserId,
      humanUserId,
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