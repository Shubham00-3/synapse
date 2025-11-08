import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { collectionDb, itemDb } from '@/lib/db';

// POST - Add item to collection
export async function POST(
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

    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Verify item belongs to user
    const item = itemDb.findById(itemId);
    if (!item || item.user_id !== session.userId) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    collectionDb.addItem(collectionId, itemId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error adding item to collection:', error);
    return NextResponse.json(
      { error: 'Failed to add item to collection' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from collection
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

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    collectionDb.removeItem(collectionId, parseInt(itemId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing item from collection:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from collection' },
      { status: 500 }
    );
  }
}

