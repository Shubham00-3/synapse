import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { collectionDb, itemDb } from '@/lib/db';

// GET all collections
export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collections = collectionDb.findByUserId(session.userId);

    // Add item counts to each collection
    const collectionsWithCounts = collections.map(collection => ({
      ...collection,
      itemCount: collectionDb.getItemCount(collection.id),
    }));

    return NextResponse.json({ collections: collectionsWithCounts });
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST - Create a new collection
export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, color, icon } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    const collectionId = collectionDb.create(
      session.userId,
      name,
      description,
      color,
      icon,
      false
    );

    const collection = collectionDb.findById(collectionId as number);

    return NextResponse.json({
      success: true,
      collection: {
        ...collection,
        itemCount: 0,
      },
    });
  } catch (error: any) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}

