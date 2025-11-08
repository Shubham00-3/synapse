import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { collectionDb, itemDb } from '@/lib/db';

// POST - Auto-generate collections based on topics
export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = itemDb.findByUserId(session.userId);

    if (items.length < 5) {
      return NextResponse.json(
        { error: 'Need at least 5 items to generate collections' },
        { status: 400 }
      );
    }

    // Group items by type
    const byType: Record<string, number[]> = {};
    items.forEach(item => {
      if (!byType[item.type]) byType[item.type] = [];
      byType[item.type].push(item.id);
    });

    const created: any[] = [];

    // Create collections for types with 3+ items
    const typeNames: Record<string, { name: string; icon: string; color: string }> = {
      article: { name: 'Articles & Reading', icon: '📚', color: '#3B82F6' },
      youtube: { name: 'Videos & Tutorials', icon: '🎥', color: '#EF4444' },
      todo: { name: 'Tasks & To-Dos', icon: '✅', color: '#10B981' },
      quote: { name: 'Quotes & Inspiration', icon: '💬', color: '#8B5CF6' },
      product: { name: 'Products & Wishlist', icon: '🛍️', color: '#F59E0B' },
      note: { name: 'Notes & Ideas', icon: '📝', color: '#6366F1' },
    };

    for (const [type, itemIds] of Object.entries(byType)) {
      if (itemIds.length >= 3 && typeNames[type]) {
        const { name, icon, color } = typeNames[type];
        
        const collectionId = collectionDb.create(
          session.userId,
          name,
          `Automatically organized ${type} content`,
          color,
          icon,
          true
        );

        // Add items to collection
        itemIds.forEach(itemId => {
          collectionDb.addItem(collectionId as number, itemId);
        });

        created.push({
          id: collectionId,
          name,
          itemCount: itemIds.length,
        });
      }
    }

    return NextResponse.json({
      success: true,
      collections: created,
      count: created.length,
    });
  } catch (error: any) {
    console.error('Error generating collections:', error);
    return NextResponse.json(
      { error: 'Failed to generate collections' },
      { status: 500 }
    );
  }
}

