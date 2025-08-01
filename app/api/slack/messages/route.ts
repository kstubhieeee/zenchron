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
      limit: 100
    });

    console.log("Found channels:", channelsResponse.channels?.length || 0);

    if (!channelsResponse.channels) {
      return NextResponse.json({ 
        messages: [], 
        totalFetched: 0,
        debug: "No channels found"
      });
    }

    const allMessages: any[] = [];
    const debugInfo: any[] = [];

    // Fetch messages from each channel
    for (const channel of channelsResponse.channels.slice(0, 20)) { // Increased limit
      try {
        console.log(`Fetching from channel: ${channel.name || channel.id} (${channel.is_member ? 'member' : 'not member'})`);
        
        // If not a member of a public channel, try to join it
        if (!channel.is_member && !channel.is_private && !channel.is_im && !channel.is_mpim) {
          console.log(`Trying to join channel: ${channel.name}`);
          try {
            await slack.conversations.join({ channel: channel.id! });
            console.log(`Successfully joined channel: ${channel.name}`);
            channel.is_member = true; // Update the local flag
          } catch (joinError) {
            console.log(`Failed to join channel ${channel.name}:`, joinError);
          }
        }
        
        const messagesResponse = await slack.conversations.history({
          channel: channel.id!,
          limit: 50, // Increased limit
        });

        const channelMessageCount = messagesResponse.messages?.length || 0;
        console.log(`Channel ${channel.name}: ${channelMessageCount} messages`);

        debugInfo.push({
          channel: channel.name || channel.id,
          messageCount: channelMessageCount,
          isMember: channel.is_member,
          type: channel.is_im ? 'dm' : channel.is_mpim ? 'group_dm' : 'channel'
        });

        if (messagesResponse.messages) {
          // For debugging, let's include ALL messages first, then filter
          const allChannelMessages = messagesResponse.messages.map((message: any) => ({
            ...message,
            channel_id: channel.id,
            channel_name: channel.name || 'Direct Message',
            channel_type: channel.is_im ? 'dm' : channel.is_mpim ? 'group_dm' : 'channel',
            mentions_user: message.text?.includes(`<@${userId}>`),
            is_from_user: message.user === userId,
            is_dm: channel.is_im || channel.is_mpim
          }));

          // For now, let's include more messages to see what we're getting
          const relevantMessages = allChannelMessages.filter((message: any) => {
            // Include messages that:
            // 1. Mention the user
            // 2. Are in DMs
            // 3. Are from recent activity (last 7 days)
            // 4. Are in channels the user is a member of
            
            const mentionsUser = message.text?.includes(`<@${userId}>`);
            const isDM = channel.is_im || channel.is_mpim;
            const isRecentActivity = channel.is_member; // User is a member of this channel
            const isFromOthers = message.user !== userId; // Not from the user themselves
            
            return mentionsUser || isDM || (isRecentActivity && isFromOthers);
          });

          console.log(`Relevant messages in ${channel.name}: ${relevantMessages.length}`);
          allMessages.push(...relevantMessages);
        }
      } catch (error) {
        console.error(`Error fetching messages from channel ${channel.id}:`, error);
        debugInfo.push({
          channel: channel.name || channel.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log("Total relevant messages found:", allMessages.length);

    // Sort messages by timestamp (newest first)
    allMessages.sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts));

    // Get user info for message authors
    const userIds = [...new Set(allMessages.map(msg => msg.user))];
    const usersInfo: any = {};

    for (const uid of userIds.slice(0, 20)) { // Limit user info requests
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
      messages: enrichedMessages.slice(0, 100), // Increased limit for debugging
      totalFetched: enrichedMessages.length,
      userId,
      debug: {
        channelsChecked: debugInfo.length,
        channelDetails: debugInfo,
        totalChannels: channelsResponse.channels.length
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