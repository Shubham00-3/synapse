import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { itemDb } from '@/lib/db';
import { processContent, detectInputType } from '@/lib/processor';

// GET all items for the current user OR a specific item by ID
export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (itemId) {
      // Get specific item
      const item = itemDb.findById(parseInt(itemId));
      
      if (!item || item.user_id !== session.userId) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      return NextResponse.json({
        item: {
          ...item,
          metadata: item.metadata_json ? JSON.parse(item.metadata_json) : {},
        },
      });
    }

    // Get all items
    const items = itemDb.findByUserId(session.userId);

    // Parse metadata and embeddings
    const parsedItems = items.map(item => ({
      ...item,
      metadata: item.metadata_json ? JSON.parse(item.metadata_json) : {},
      embedding: item.embedding_vector ? JSON.parse(item.embedding_vector) : null,
    }));

    return NextResponse.json({ items: parsedItems });
  } catch (error: any) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST - Create a new item
export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { input } = await request.json();

    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    // Detect input type
    const inputType = detectInputType(input);

    // Process the content
    const processed = await processContent({
      type: inputType,
      data: input,
    });

    // Save to database
    const itemId = itemDb.create({
      user_id: session.userId,
      type: processed.type,
      title: processed.title,
      content: processed.content,
      metadata: processed.metadata,
      embedding: processed.embedding,
    });

    // Fetch and return the created item
    const item = itemDb.findById(itemId as number);

    if (!item) {
      throw new Error('Failed to retrieve created item');
    }

    const parsedItem = {
      ...item,
      metadata: item.metadata_json ? JSON.parse(item.metadata_json) : {},
      embedding: item.embedding_vector ? JSON.parse(item.embedding_vector) : null,
    };

    return NextResponse.json({ 
      success: true,
      item: parsedItem 
    });
  } catch (error: any) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create item' },
      { status: 500 }
    );
  }
}

// DELETE an item
export async function DELETE(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Verify the item belongs to the user
    const item = itemDb.findById(parseInt(itemId));
    if (!item || item.user_id !== session.userId) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    itemDb.delete(parseInt(itemId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
