import { NextRequest, NextResponse } from "next/server";
import { WebClient } from '@slack/web-api';

// Simple in-memory cache to prevent rate limiting
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute cache

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "No Slack token provided" }, { status: 401 });
    }

    // Check cache first
    const cacheKey = `slack_messages_${token}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("Returning cached data");
      return NextResponse.json(cached.data);
    }

    const slack = new WebClient(token);

    // Get user info to find the current user's ID
    const authTest = await slack.auth.test();
    const botUserId = authTest.user_id;
    const humanUserId = 'U09923DMKCZ'; // Your human user ID

    console.log("Fast fetch for user:", humanUserId);

    const relevantMessages: any[] = [];
    const debugInfo: any[] = [];

    // OPTIMIZED: Only check the main channel we know has messages
    const knownChannelId = 'C09923E7LC9'; // all-kstubhie channel

    try {
      const messagesResponse = await slack.conversations.history({
        channel: knownChannelId,
        limit: 10 // Even smaller limit to avoid rate limits
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
            channel_id: knownChannelId,
            channel_name: 'all-kstubhie',
            channel_type: 'channel',
            mentions_user: true,
            is_from_user: false,
            is_dm: false,
            priority: 'high'
          }));

        relevantMessages.push(...mentionMessages);
        debugInfo.push({
          channel: 'all-kstubhie',
          messageCount: mentionMessages.length,
          type: 'channel_mentions',
          isMember: true
        });
      }
    } catch (error) {
      console.error(`Error fetching from main channel:`, error);
      debugInfo.push({
        channel: 'all-kstubhie',
        messageCount: 0,
        type: 'channel',
        isMember: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    console.log("Total relevant messages found:", relevantMessages.length);

    // Sort messages by timestamp (newest first)
    relevantMessages.sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts));

    // Get user info for message authors (minimal)
    const userIds = [...new Set(relevantMessages.map(msg => msg.user))].filter(Boolean);
    const usersInfo: any = {};

    // Only get user info for the first few users to keep it fast
    for (const uid of userIds.slice(0, 5)) {
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

    const responseData = {
      messages: enrichedMessages,
      totalFetched: enrichedMessages.length,
      botUserId,
      humanUserId,
      debug: {
        strategiesUsed: ['Known channel only'],
        channelsChecked: debugInfo.length,
        channelDetails: debugInfo
      }
    };

    // Cache the response
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Slack messages error:", error);

    // Check if it's a rate limit error
    if (error instanceof Error && error.message.includes('rate limit')) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          details: "Please wait 60 seconds before trying again",
          retryAfter: 60
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch Slack messages",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}