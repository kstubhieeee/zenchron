import { NextRequest, NextResponse } from "next/server";
import { Client } from '@notionhq/client';

// Simple in-memory cache to prevent rate limiting
const cache = new Map();
const CACHE_DURATION = 300000; // 5 minutes cache for Notion

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    
    // Use OAuth token if provided, otherwise fall back to internal integration
    let authToken = token;
    let cacheKey = `notion_pages_oauth_${token?.substring(0, 10)}`;
    
    if (!authToken) {
      authToken = process.env.NOTION_INTERNAL_SECRET;
      cacheKey = `notion_pages_internal`;
      
      if (!authToken) {
        return NextResponse.json({ error: "No Notion token provided and internal secret not configured" }, { status: 500 });
      }
    }

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("Returning cached Notion data");
      return NextResponse.json(cached.data);
    }

    const notion = new Client({ auth: authToken });

    console.log("Fetching Notion pages...");

    const allPages: any[] = [];
    let hasMore = true;
    let nextCursor: string | undefined = undefined;

    // Search for pages and databases
    while (hasMore && allPages.length < 50) { // Limit to prevent long requests
      try {
        const response = await notion.search({
          query: '',
          sort: {
            direction: 'descending',
            timestamp: 'last_edited_time',
          },
          page_size: 20,
          start_cursor: nextCursor,
        });

        if (response.results) {
          const formattedPages = response.results.map((item: any) => ({
            id: item.id,
            title: getPageTitle(item),
            url: item.url,
            last_edited_time: item.last_edited_time,
            created_time: item.created_time,
            parent: item.parent,
            object: item.object, // 'page' or 'database'
            properties: item.properties
          }));

          allPages.push(...formattedPages);
        }

        hasMore = response.has_more;
        nextCursor = response.next_cursor || undefined;

      } catch (searchError) {
        console.error('Error in search iteration:', searchError);
        break;
      }
    }

    console.log(`Found ${allPages.length} Notion items`);

    // Get workspace info
    let debugInfo = {
      workspaceName: 'Unknown',
      botId: 'Unknown'
    };

    try {
      // Try to get bot info (this might not work with all tokens)
      const botInfo = await notion.users.me();
      debugInfo.botId = botInfo.id;
    } catch (error) {
      console.log('Could not fetch bot info:', error);
    }

    const responseData = {
      pages: allPages,
      totalFetched: allPages.length,
      debug: debugInfo
    };

    // Cache the response
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Notion pages error:", error);
    
    // Check if it's a rate limit error
    if (error instanceof Error && error.message.includes('rate limit')) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          details: "Please wait a few minutes before trying again",
          retryAfter: 300
        },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      {
        error: "Failed to fetch Notion pages",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to extract page title from different Notion objects
function getPageTitle(item: any): string {
  if (item.object === 'database') {
    // For databases, get title from title property
    if (item.title && item.title.length > 0) {
      return item.title[0].plain_text || 'Untitled Database';
    }
    return 'Untitled Database';
  } else if (item.object === 'page') {
    // For pages, get title from properties
    if (item.properties && item.properties.title) {
      const titleProp = item.properties.title;
      if (titleProp.title && titleProp.title.length > 0) {
        return titleProp.title[0].plain_text || 'Untitled Page';
      }
    }
    
    // Fallback: try to get title from other properties
    for (const [key, value] of Object.entries(item.properties || {})) {
      if ((value as any).type === 'title' && (value as any).title && (value as any).title.length > 0) {
        return (value as any).title[0].plain_text || 'Untitled Page';
      }
    }
    
    return 'Untitled Page';
  }
  
  return 'Unknown Item';
}