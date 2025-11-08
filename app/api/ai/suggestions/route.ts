import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { itemDb } from '@/lib/db';
import { generateSuggestedQuestions } from '@/lib/ai-chat';

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's items
    const items = itemDb.findByUserId(session.userId, 50);

    // Generate suggested questions
    const questions = generateSuggestedQuestions(items);

    return NextResponse.json({
      questions,
      itemCount: items.length,
    });
  } catch (error: any) {
    console.error('Suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

