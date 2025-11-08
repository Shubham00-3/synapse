import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { itemDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = itemDb.findByUserId(session.userId, 100);
    const suggestions: Array<{
      type: string;
      title: string;
      description: string;
      itemId?: number;
    }> = [];

    // Analyze items and generate suggestions
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Suggestion 1: Review old items
    const oldItems = items.filter(item => {
      const created = new Date(item.created_at);
      return created < oneWeekAgo;
    });

    if (oldItems.length > 0) {
      const randomOld = oldItems[Math.floor(Math.random() * oldItems.length)];
      suggestions.push({
        type: 'review',
        title: 'Time to Review',
        description: `You saved "${randomOld.title.slice(0, 50)}..." a while ago. Want to refresh your memory?`,
        itemId: randomOld.id,
      });
    }

    // Suggestion 2: Complete todos
    const todos = items.filter(item => item.type === 'todo');
    if (todos.length > 0) {
      suggestions.push({
        type: 'complete',
        title: 'Finish Your Tasks',
        description: `You have ${todos.length} todo list${todos.length > 1 ? 's' : ''} waiting. Time to check them off!`,
      });
    }

    // Suggestion 3: Explore topics
    const types = new Set(items.map(i => i.type));
    const topicsHint: Record<string, string> = {
      article: 'articles',
      youtube: 'videos',
      quote: 'quotes',
      product: 'products',
    };

    for (const [type, name] of Object.entries(topicsHint)) {
      if (types.has(type)) {
        const count = items.filter(i => i.type === type).length;
        if (count >= 3) {
          suggestions.push({
            type: 'explore',
            title: `Dive Deeper`,
            description: `You've saved ${count} ${name}. Ask Synapse AI to find connections between them!`,
          });
          break; // Only show one explore suggestion
        }
      }
    }

    // Suggestion 4: Recent activity
    const recentItems = items.slice(0, 5);
    if (recentItems.length >= 3) {
      const recentTypes = [...new Set(recentItems.map(i => i.type))];
      if (recentTypes.length === 1) {
        suggestions.push({
          type: 'explore',
          title: 'Focused Learning',
          description: `You're on a ${recentTypes[0]} streak! Keep the momentum going.`,
        });
      }
    }

    // If no suggestions, provide default ones
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'explore',
        title: 'Start Saving Content',
        description: 'Save some articles, videos, or notes to get personalized suggestions!',
      });
    }

    return NextResponse.json({
      suggestions: suggestions.slice(0, 4), // Return max 4 suggestions
    });
  } catch (error: any) {
    console.error('Smart suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

