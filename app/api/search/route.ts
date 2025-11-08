import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { itemDb } from '@/lib/db';
import { enhancedSearch } from '@/lib/ai';
import { parseQuery, formatDateRange } from '@/lib/query-parser';

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, filters } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Parse the natural language query
    const parsed = parseQuery(query);
    console.log('Parsed query:', {
      keywords: parsed.keywords,
      contentTypes: parsed.contentTypes,
      dateRange: parsed.dateRange?.label,
    });

    // Get all items with embeddings for the user
    let items = itemDb.getAllWithEmbeddings(session.userId);

    // Apply content type filters from parsed query or explicit filters
    const typesToFilter = parsed.contentTypes.length > 0 
      ? parsed.contentTypes 
      : (filters?.type ? [filters.type] : []);
    
    if (typesToFilter.length > 0) {
      items = items.filter(item => typesToFilter.includes(item.type));
    }

    // Apply date range filters from parsed query or explicit filters
    if (parsed.dateRange) {
      items = items.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= parsed.dateRange!.start && itemDate < parsed.dateRange!.end;
      });
    } else {
      if (filters?.dateFrom) {
        items = items.filter(item => new Date(item.created_at) >= new Date(filters.dateFrom));
      }
      if (filters?.dateTo) {
        items = items.filter(item => new Date(item.created_at) <= new Date(filters.dateTo));
      }
    }

    // Parse items for search
    const parsedItems = items.map(item => ({
      ...item,
      metadata: item.metadata_json ? JSON.parse(item.metadata_json) : {},
      embedding_vector: item.embedding_vector,
    }));

    // Use keywords from parsed query for better semantic search
    const searchQuery = parsed.keywords.length > 0 
      ? parsed.keywords.join(' ')
      : query;

    // Perform semantic search
    const results = await enhancedSearch(searchQuery, parsedItems as any, 20);

    // Format results
    const formattedResults = results.map(result => ({
      ...result.item,
      metadata: result.item.metadata,
      score: result.score,
    }));

    return NextResponse.json({ 
      results: formattedResults,
      count: formattedResults.length,
      appliedFilters: {
        contentTypes: typesToFilter,
        dateRange: parsed.dateRange ? formatDateRange(parsed.dateRange) : null,
        keywords: parsed.keywords,
      },
    });
  } catch (error: any) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

