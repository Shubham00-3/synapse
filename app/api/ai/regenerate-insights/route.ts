import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { itemDb } from '@/lib/db';
import { generateSummaryAndInsights } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { itemId } = await req.json();
    
    // Get all items for this user
    const items = itemDb.findByUserId(session.userId, 1000);
    
    // Filter items to process
    const itemsToProcess = itemId 
      ? items.filter(item => item.id === itemId)
      : items;

    let processedCount = 0;
    let errorCount = 0;

    for (const item of itemsToProcess) {
      try {
        console.log(`\n[Item ${item.id}] Checking: ${item.title}`);
        console.log(`  Type: ${item.type}`);
        console.log(`  Content length: ${item.content?.length || 0}`);
        
        // Only process articles and notes with sufficient content
        if ((item.type === 'article' || item.type === 'note') && item.content && item.content.length > 50) {
          console.log(`  ✓ Processing item ${item.id}...`);
          
          // Generate AI insights
          const insights = await generateSummaryAndInsights(
            item.title,
            item.content,
            item.type
          );

          console.log(`  Generated insights:`, {
            summary: insights.summary.slice(0, 50) + '...',
            keyPointsCount: insights.keyPoints.length,
            topicsCount: insights.topics.length
          });

          // Update metadata with new insights
          const metadata = typeof item.metadata_json === 'string' 
            ? JSON.parse(item.metadata_json) 
            : item.metadata_json || {};

          metadata.aiSummary = insights.summary;
          metadata.keyPoints = insights.keyPoints;
          metadata.topics = insights.topics;

          console.log(`  Updating database with metadata:`, JSON.stringify(metadata).slice(0, 100));

          // Update the item in the database
          itemDb.update(item.id, {
            metadata: metadata
          });

          processedCount++;
          console.log(`  ✅ Successfully generated insights for item ${item.id}`);
        } else {
          console.log(`  ⏭️  Skipped (wrong type or insufficient content)`);
        }
      } catch (error) {
        console.error(`  ❌ Error processing item ${item.id}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Regenerated insights for ${processedCount} items${errorCount > 0 ? ` (${errorCount} errors)` : ''}`,
      processedCount,
      errorCount
    });
  } catch (error) {
    console.error('Error regenerating insights:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate insights' },
      { status: 500 }
    );
  }
}

