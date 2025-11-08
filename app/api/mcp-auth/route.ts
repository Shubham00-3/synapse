import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { apiKeyDb } from '@/lib/db';
import { randomBytes } from 'crypto';

// GET all API keys for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeys = apiKeyDb.findByUserId(session.userId);

    // Hide the actual keys for security (show only first/last chars)
    const maskedKeys = apiKeys.map(key => ({
      ...key,
      key: `${key.key.slice(0, 8)}...${key.key.slice(-4)}`,
    }));

    return NextResponse.json({ apiKeys: maskedKeys });
  } catch (error: any) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    // Generate a secure random API key
    const apiKey = `sk-synapse-${randomBytes(32).toString('hex')}`;

    const keyId = apiKeyDb.create(session.userId, apiKey, name);

    return NextResponse.json({
      success: true,
      apiKey: apiKey, // Return full key only on creation
      keyId,
      message: 'Save this API key securely. You won\'t be able to see it again.',
    });
  } catch (error: any) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an API key
export async function DELETE(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { error: 'Key ID is required' },
        { status: 400 }
      );
    }

    apiKeyDb.delete(parseInt(keyId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}

