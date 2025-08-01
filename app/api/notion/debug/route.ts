import { NextRequest, NextResponse } from "next/server";
import { Client } from '@notionhq/client';

export async function GET() {
  try {
    // Use the internal token from environment for testing
    const internalToken = "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";
    
    if (!internalToken) {
      return NextResponse.json({ error: "No internal token found" }, { status: 500 });
    }

    const notion = new Client({ auth: internalToken });

    console.log("Testing Notion API with internal token...");

    // Test search with different parameters
    const tests = [];

    // Test 1: Basic search
    try {
      const basicSearch = await notion.search({
        query: '',
        page_size: 100,
      });
      tests.push({
        name: "Basic Search",
        count: basicSearch.results.length,
        items: basicSearch.results.map((item: any) => ({
          id: item.id,
          object: item.object,
          title: getPageTitle(item),
          url: item.url,
          parent: item.parent?.type || 'none'
        }))
      });
    } catch (error) {
      tests.push({
        name: "Basic Search",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Search for databases only
    try {
      const dbSearch = await notion.search({
        query: '',
        filter: {
          value: 'database',
          property: 'object'
        },
        page_size: 100,
      });
      tests.push({
        name: "Database Search",
        count: dbSearch.results.length,
        items: dbSearch.results.map((item: any) => ({
          id: item.id,
          title: getPageTitle(item),
          url: item.url
        }))
      });
    } catch (error) {
      tests.push({
        name: "Database Search",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Search for pages only
    try {
      const pageSearch = await notion.search({
        query: '',
        filter: {
          value: 'page',
          property: 'object'
        },
        page_size: 100,
      });
      tests.push({
        name: "Page Search",
        count: pageSearch.results.length,
        items: pageSearch.results.map((item: any) => ({
          id: item.id,
          title: getPageTitle(item),
          url: item.url,
          parent: item.parent?.type || 'none'
        }))
      });
    } catch (error) {
      tests.push({
        name: "Page Search",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 4: Search with specific query terms
    const searchTerms = ['todos', 'todo', 'task', 'meeting', 'doc'];
    for (const term of searchTerms) {
      try {
        const termSearch = await notion.search({
          query: term,
          page_size: 20,
        });
        tests.push({
          name: `Search for "${term}"`,
          count: termSearch.results.length,
          items: termSearch.results.map((item: any) => ({
            id: item.id,
            title: getPageTitle(item),
            url: item.url
          }))
        });
      } catch (error) {
        tests.push({
          name: `Search for "${term}"`,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: "Notion API Debug Results",
      tests
    });

  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

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