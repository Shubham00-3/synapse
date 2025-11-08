import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { collectionDb } from '@/lib/db';

// GET collection by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collectionId = parseInt(params.id);
    const collection = collectionDb.findById(collectionId);

    if (!collection || collection.user_id !== session.userId) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    const items = collectionDb.getItems(collectionId);

    // Parse metadata for items
    const parsedItems = items.map(item => ({
      ...item,
      metadata: item.metadata_json ? JSON.parse(item.metadata_json) : {},
    }));

    return NextResponse.json({
      collection,
      items: parsedItems,
    });
  } catch (error: any) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

// PUT - Update collection
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collectionId = parseInt(params.id);
    const collection = collectionDb.findById(collectionId);

    if (!collection || collection.user_id !== session.userId) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    const updates = await request.json();
    collectionDb.update(collectionId, updates);

    const updated = collectionDb.findById(collectionId);

    return NextResponse.json({
      success: true,
      collection: updated,
    });
  } catch (error: any) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

// DELETE collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collectionId = parseInt(params.id);
    const collection = collectionDb.findById(collectionId);

    if (!collection || collection.user_id !== session.userId) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    collectionDb.delete(collectionId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}

