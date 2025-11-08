import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { itemDb } from '@/lib/db';
import { findRelatedItems } from '@/lib/ai-connections';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const itemId = parseInt(params.id);
    
    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    // Get the current item
    const currentItem = itemDb.findById(itemId);
    
    if (!currentItem || currentItem.user_id !== session.userId) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Get all user's items for comparison
    const allItems = itemDb.findByUserId(session.userId);

    // Find related items
    const related = findRelatedItems(currentItem, allItems, 5, 0.5);

    return NextResponse.json({
      related,
      count: related.length,
    });
  } catch (error: any) {
    console.error('Related items error:', error);
    return NextResponse.json(
      { error: 'Failed to find related items' },
      { status: 500 }
    );
  }
}

