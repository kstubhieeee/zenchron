import { NextRequest, NextResponse } from "next/server";
import { Client } from '@notionhq/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    const notion = new Client({ auth: token });

    console.log("Testing Notion API with token...");

    // Test 1: Get user info
    let userInfo;
    try {
      userInfo = await notion.users.me();
      console.log("User info:", userInfo);
    } catch (error) {
      console.log("Could not get user info:", error);
      userInfo = { error: "Could not fetch user info" };
    }

    // Test 2: Search with empty query (should return all accessible content)
    let searchResults;
    try {
      searchResults = await notion.search({
        query: '',
        page_size: 100,
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time',
        },
      });
      console.log(`Search found ${searchResults.results.length} items`);
    } catch (error) {
      console.log("Search error:", error);
      searchResults = { error: "Search failed", details: error };
    }

    // Test 3: Try to list databases specifically
    let databaseResults;
    try {
      databaseResults = await notion.search({
        query: '',
        filter: {
          value: 'database',
          property: 'object'
        },
        page_size: 100,
      });
      console.log(`Database search found ${databaseResults.results.length} databases`);
    } catch (error) {
      console.log("Database search error:", error);
      databaseResults = { error: "Database search failed", details: error };
    }

    // Test 4: Try to list pages specifically
    let pageResults;
    try {
      pageResults = await notion.search({
        query: '',
        filter: {
          value: 'page',
          property: 'object'
        },
        page_size: 100,
      });
      console.log(`Page search found ${pageResults.results.length} pages`);
    } catch (error) {
      console.log("Page search error:", error);
      pageResults = { error: "Page search failed", details: error };
    }

    return NextResponse.json({
      userInfo,
      searchResults: {
        total: searchResults?.results?.length || 0,
        items: searchResults?.results?.map((item: any) => ({
          id: item.id,
          object: item.object,
          title: getPageTitle(item),
          url: item.url,
          parent: item.parent,
          last_edited_time: item.last_edited_time
        })) || []
      },
      databaseResults: {
        total: databaseResults?.results?.length || 0,
        items: databaseResults?.results?.map((item: any) => ({
          id: item.id,
          title: getPageTitle(item),
          url: item.url
        })) || []
      },
      pageResults: {
        total: pageResults?.results?.length || 0,
        items: pageResults?.results?.map((item: any) => ({
          id: item.id,
          title: getPageTitle(item),
          url: item.url,
          parent: item.parent
        })) || []
      }
    });

  } catch (error) {
    console.error("Notion test error:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to extract page title
function getPageTitle(item: any): string {
  if (item.object === 'database') {
    if (item.title && item.title.length > 0) {
      return item.title[0].plain_text || 'Untitled Database';
    }
    return 'Untitled Database';
  } else if (item.object === 'page') {
    if (item.properties && item.properties.title) {
      const titleProp = item.properties.title;
      if (titleProp.title && titleProp.title.length > 0) {
        return titleProp.title[0].plain_text || 'Untitled Page';
      }
    }
    
    for (const [key, value] of Object.entries(item.properties || {})) {
      if ((value as any).type === 'title' && (value as any).title && (value as any).title.length > 0) {
        return (value as any).title[0].plain_text || 'Untitled Page';
      }
    }
    
    return 'Untitled Page';
  }
  
  return 'Unknown Item';
}