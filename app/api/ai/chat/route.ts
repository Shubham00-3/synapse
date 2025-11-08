import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { itemDb, conversationDb } from '@/lib/db';
import { chatWithKnowledge } from '@/lib/ai-chat';

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user's saved items for context
    const items = itemDb.findByUserId(session.userId, 50);

    // Parse items for chat
    const parsedItems = items.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      content: item.content || '',
      metadata: item.metadata_json ? JSON.parse(item.metadata_json) : {},
    }));

    // Chat with knowledge base
    const { response, citedItems } = await chatWithKnowledge(message, {
      items: parsedItems,
      conversationHistory: history || [],
    });

    // Save conversation to database
    conversationDb.create(session.userId, message, 'user');
    conversationDb.create(session.userId, response, 'assistant', citedItems);

    return NextResponse.json({
      response,
      citedItems,
      success: true,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    );
  }
}

