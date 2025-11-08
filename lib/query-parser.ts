export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface ParsedQuery {
  keywords: string[];
  contentTypes: string[];
  dateRange: DateRange | null;
  rawQuery: string;
}

const CONTENT_TYPES = ['article', 'video', 'youtube', 'product', 'todo', 'quote', 'note', 'image'];

/**
 * Parse natural language query into structured filters
 */
export function parseQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase();
  
  return {
    keywords: extractKeywords(query, lowerQuery),
    contentTypes: extractContentTypes(lowerQuery),
    dateRange: extractDateRange(lowerQuery),
    rawQuery: query,
  };
}

/**
 * Extract content types from query
 */
export function extractContentTypes(lowerQuery: string): string[] {
  const types: string[] = [];
  
  // Check for plurals and singulars
  const patterns: Record<string, string[]> = {
    article: ['article', 'articles', 'post', 'posts', 'blog'],
    youtube: ['video', 'videos', 'youtube'],
    product: ['product', 'products', 'item for sale'],
    todo: ['todo', 'todos', 'task', 'tasks', 'list'],
    quote: ['quote', 'quotes'],
    note: ['note', 'notes'],
    image: ['image', 'images', 'picture', 'pictures', 'photo', 'photos', 'screenshot'],
  };

  for (const [type, keywords] of Object.entries(patterns)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        types.push(type);
        break;
      }
    }
  }

  return Array.from(new Set(types)); // Remove duplicates
}

/**
 * Extract date range from query
 */
export function extractDateRange(lowerQuery: string): DateRange | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Today
  if (lowerQuery.includes('today')) {
    return {
      start: today,
      end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      label: 'today',
    };
  }

  // Yesterday
  if (lowerQuery.includes('yesterday')) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      start: yesterday,
      end: today,
      label: 'yesterday',
    };
  }

  // This week
  if (lowerQuery.includes('this week')) {
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    return {
      start: startOfWeek,
      end: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      label: 'this week',
    };
  }

  // Last week
  if (lowerQuery.includes('last week')) {
    const dayOfWeek = today.getDay();
    const startOfLastWeek = new Date(today);
    startOfLastWeek.setDate(today.getDate() - dayOfWeek - 7);
    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(startOfLastWeek.getDate() + 7);
    return {
      start: startOfLastWeek,
      end: endOfLastWeek,
      label: 'last week',
    };
  }

  // This month
  if (lowerQuery.includes('this month')) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      start: startOfMonth,
      end: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      label: 'this month',
    };
  }

  // Last month
  if (lowerQuery.includes('last month')) {
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      start: startOfLastMonth,
      end: startOfThisMonth,
      label: 'last month',
    };
  }

  // This year
  if (lowerQuery.includes('this year')) {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return {
      start: startOfYear,
      end: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      label: 'this year',
    };
  }

  // Last 7 days
  if (lowerQuery.includes('last 7 days') || lowerQuery.includes('past week')) {
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return {
      start: sevenDaysAgo,
      end: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      label: 'last 7 days',
    };
  }

  // Last 30 days
  if (lowerQuery.includes('last 30 days') || lowerQuery.includes('past month')) {
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return {
      start: thirtyDaysAgo,
      end: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      label: 'last 30 days',
    };
  }

  return null;
}

/**
 * Extract keywords from query (removing date and type filters)
 */
export function extractKeywords(query: string, lowerQuery: string): string[] {
  // Remove common stop words and filter terms
  const stopWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'about', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
    'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
    'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'that',
    'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
    // Date-related words to remove
    'today', 'yesterday', 'week', 'last', 'this', 'month', 'year', 'days',
    'past', 'recent', 'ago',
    // Content type words to remove
    'article', 'articles', 'video', 'videos', 'youtube', 'product', 'products',
    'todo', 'todos', 'task', 'tasks', 'list', 'quote', 'quotes', 'note', 'notes',
    'image', 'images', 'picture', 'pictures', 'photo', 'photos', 'screenshot',
    'i', 'saved',
  ];

  // Split into words and filter
  const words = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => {
      return (
        word.length > 2 && // Minimum length
        !stopWords.includes(word) &&
        !/^\d+$/.test(word) // Not just numbers
      );
    });

  return Array.from(new Set(words)); // Remove duplicates
}

/**
 * Format date range for display
 */
export function formatDateRange(range: DateRange): string {
  return range.label;
}

/**
 * Convert date range to SQL WHERE clause
 */
export function dateRangeToSQL(range: DateRange): { clause: string; params: string[] } {
  const startISO = range.start.toISOString();
  const endISO = range.end.toISOString();
  
  return {
    clause: 'created_at >= ? AND created_at < ?',
    params: [startISO, endISO],
  };
}

