import { NextRequest, NextResponse } from "next/server";
import { Client } from '@notionhq/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId, token } = body;
    
    if (!pageId) {
      return NextResponse.json({ error: "Page ID is required" }, { status: 400 });
    }

    // Use OAuth token if provided, otherwise fall back to internal integration
    let authToken = token;
    if (!authToken) {
      authToken = process.env.NOTION_INTERNAL_SECRET;
      if (!authToken) {
        return NextResponse.json({ error: "No Notion token provided and internal secret not configured" }, { status: 500 });
      }
    }

    const notion = new Client({ auth: authToken });

    // Get page details
    const page = await notion.pages.retrieve({ page_id: pageId });
    
    // Get page content (blocks)
    const blocks = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });

    // Process blocks to extract readable content
    const content = await processBlocks(blocks.results, notion);

    return NextResponse.json({
      page: {
        id: page.id,
        title: getPageTitle(page),
        url: (page as any).url,
        last_edited_time: page.last_edited_time,
        created_time: page.created_time,
        properties: (page as any).properties
      },
      content,
      totalBlocks: blocks.results.length
    });

  } catch (error) {
    console.error("Notion page content error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch page content",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Process blocks to extract readable content
async function processBlocks(blocks: any[], notion: Client): Promise<any[]> {
  const processedBlocks = [];

  for (const block of blocks) {
    const processedBlock: any = {
      id: block.id,
      type: block.type,
      created_time: block.created_time,
      last_edited_time: block.last_edited_time
    };

    // Extract text content based on block type
    switch (block.type) {
      case 'paragraph':
        processedBlock.content = extractRichText(block.paragraph?.rich_text || []);
        break;
      
      case 'heading_1':
        processedBlock.content = extractRichText(block.heading_1?.rich_text || []);
        processedBlock.level = 1;
        break;
      
      case 'heading_2':
        processedBlock.content = extractRichText(block.heading_2?.rich_text || []);
        processedBlock.level = 2;
        break;
      
      case 'heading_3':
        processedBlock.content = extractRichText(block.heading_3?.rich_text || []);
        processedBlock.level = 3;
        break;
      
      case 'bulleted_list_item':
        processedBlock.content = extractRichText(block.bulleted_list_item?.rich_text || []);
        break;
      
      case 'numbered_list_item':
        processedBlock.content = extractRichText(block.numbered_list_item?.rich_text || []);
        break;
      
      case 'to_do':
        processedBlock.content = extractRichText(block.to_do?.rich_text || []);
        processedBlock.checked = block.to_do?.checked || false;
        break;
      
      case 'toggle':
        processedBlock.content = extractRichText(block.toggle?.rich_text || []);
        break;
      
      case 'quote':
        processedBlock.content = extractRichText(block.quote?.rich_text || []);
        break;
      
      case 'code':
        processedBlock.content = extractRichText(block.code?.rich_text || []);
        processedBlock.language = block.code?.language || 'plain text';
        break;
      
      case 'callout':
        processedBlock.content = extractRichText(block.callout?.rich_text || []);
        processedBlock.icon = block.callout?.icon;
        break;
      
      case 'divider':
        processedBlock.content = '---';
        break;
      
      case 'table':
        processedBlock.content = `Table with ${block.table?.table_width || 0} columns`;
        processedBlock.table_width = block.table?.table_width;
        break;
      
      case 'image':
        processedBlock.content = block.image?.caption ? extractRichText(block.image.caption) : 'Image';
        processedBlock.url = block.image?.file?.url || block.image?.external?.url;
        break;
      
      case 'video':
        processedBlock.content = block.video?.caption ? extractRichText(block.video.caption) : 'Video';
        processedBlock.url = block.video?.file?.url || block.video?.external?.url;
        break;
      
      case 'file':
        processedBlock.content = block.file?.caption ? extractRichText(block.file.caption) : 'File';
        processedBlock.url = block.file?.file?.url || block.file?.external?.url;
        break;
      
      case 'bookmark':
        processedBlock.content = block.bookmark?.caption ? extractRichText(block.bookmark.caption) : 'Bookmark';
        processedBlock.url = block.bookmark?.url;
        break;
      
      case 'embed':
        processedBlock.content = block.embed?.caption ? extractRichText(block.embed.caption) : 'Embed';
        processedBlock.url = block.embed?.url;
        break;
      
      default:
        processedBlock.content = `Unsupported block type: ${block.type}`;
    }

    // Handle child blocks if they exist
    if (block.has_children) {
      try {
        const childBlocks = await notion.blocks.children.list({
          block_id: block.id,
          page_size: 100,
        });
        processedBlock.children = await processBlocks(childBlocks.results, notion);
      } catch (error) {
        console.log(`Could not fetch children for block ${block.id}:`, error);
        processedBlock.children = [];
      }
    }

    processedBlocks.push(processedBlock);
  }

  return processedBlocks;
}

// Extract plain text from rich text array
function extractRichText(richText: any[]): string {
  return richText.map(text => text.plain_text || '').join('');
}

// Helper function to extract page title
function getPageTitle(page: any): string {
  if (page.properties && page.properties.title) {
    const titleProp = page.properties.title;
    if (titleProp.title && titleProp.title.length > 0) {
      return titleProp.title[0].plain_text || 'Untitled Page';
    }
  }
  
  // For database pages, try other title properties
  for (const [key, value] of Object.entries(page.properties || {})) {
    if ((value as any).type === 'title' && (value as any).title && (value as any).title.length > 0) {
      return (value as any).title[0].plain_text || 'Untitled Page';
    }
  }
  
  return 'Untitled Page';
}