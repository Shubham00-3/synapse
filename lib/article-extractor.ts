import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export interface ExtractedArticle {
  title: string;
  content: string;
  textContent: string;
  excerpt: string;
  byline: string | null;
  length: number;
  readingTime: number; // in minutes
  wordCount: number;
}

/**
 * Extract full article content using Mozilla's Readability
 */
export async function extractFullArticle(url: string, html?: string): Promise<ExtractedArticle | null> {
  try {
    // Fetch HTML if not provided
    if (!html) {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      html = await response.text();
    }

    // Parse with JSDOM
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      return null;
    }

    // Calculate reading time (average 200 words per minute)
    const wordCount = article.textContent?.split(/\s+/).length || 0;
    const readingTime = Math.ceil(wordCount / 200);

    return {
      title: article.title || '',
      content: article.content || '', // HTML content
      textContent: article.textContent || '', // Plain text
      excerpt: article.excerpt || '',
      byline: article.byline || null,
      length: article.length || 0,
      readingTime,
      wordCount,
    };
  } catch (error) {
    console.error('Article extraction failed:', error);
    return null;
  }
}

/**
 * Strip HTML tags from content
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number = 500): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

