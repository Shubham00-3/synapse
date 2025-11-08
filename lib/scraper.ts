import * as cheerio from 'cheerio';

export interface ScrapedMetadata {
  title: string;
  description?: string;
  image?: string;
  url: string;
  type: string;
  price?: string;
  author?: string;
  videoId?: string;
  favicon?: string;
  fullContent?: string; // Full article content
  htmlContent?: string; // HTML content for reader mode
  readingTime?: number;
  wordCount?: number;
}

export async function scrapeUrl(url: string): Promise<ScrapedMetadata> {
  try {
    // Detect content type from URL
    const type = detectContentType(url);
    
    // Handle YouTube specially
    if (type === 'youtube') {
      return await scrapeYouTube(url);
    }
    
    // Fetch the HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract metadata
    const metadata: ScrapedMetadata = {
      url,
      type,
      title: extractTitle($),
      description: extractDescription($),
      image: extractImage($, url),
      favicon: extractFavicon($, url),
    };
    
    // Try to detect price for products (but only if URL suggests it's a product)
    if (type === 'product') {
      const price = extractPrice($);
      if (price) {
        metadata.price = price;
      }
    }
    
    // Don't override article type with product based on price alone
    // Only mark as product if URL contains shopping keywords AND has price
    if (type === 'article') {
      const price = extractPrice($);
      const urlLower = url.toLowerCase();
      const isShoppingUrl = urlLower.includes('amazon.') || 
                           urlLower.includes('/product') || 
                           urlLower.includes('/shop') || 
                           urlLower.includes('/store') ||
                           urlLower.includes('/buy');
      
      if (price && isShoppingUrl) {
        metadata.price = price;
        metadata.type = 'product';
      }
    }
    
    // Extract author for articles
    const author = extractAuthor($);
    if (author) {
      metadata.author = author;
    }

    // Extract full article content for articles (not products or videos)
    if (metadata.type === 'article') {
      try {
        const { extractFullArticle } = await import('./article-extractor');
        const article = await extractFullArticle(url, html);
        
        if (article) {
          metadata.fullContent = article.textContent;
          metadata.htmlContent = article.content;
          metadata.readingTime = article.readingTime;
          metadata.wordCount = article.wordCount;
          
          // Use article title if better than extracted
          if (article.title && article.title.length > metadata.title.length) {
            metadata.title = article.title;
          }

          // Use article byline if author not found
          if (article.byline && !metadata.author) {
            metadata.author = article.byline;
          }

          // Use excerpt if description is missing
          if (article.excerpt && !metadata.description) {
            metadata.description = article.excerpt;
          }
        }
      } catch (error) {
        console.error('Full article extraction failed, using metadata only:', error);
      }
    }
    
    return metadata;
  } catch (error) {
    console.error('Error scraping URL:', error);
    // Return basic metadata on error
    return {
      url,
      type: 'article',
      title: url,
    };
  }
}

function detectContentType(url: string): string {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube';
  }
  if (urlLower.includes('amazon.') || urlLower.includes('shop') || urlLower.includes('store')) {
    return 'product';
  }
  
  return 'article';
}

async function scrapeYouTube(url: string): Promise<ScrapedMetadata> {
  const videoId = extractYouTubeId(url);
  
  if (!videoId) {
    return {
      url,
      type: 'youtube',
      title: 'YouTube Video',
    };
  }
  
  try {
    // Try to fetch video info
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    return {
      url,
      type: 'youtube',
      title: extractTitle($) || 'YouTube Video',
      description: extractDescription($),
      image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      videoId,
    };
  } catch {
    return {
      url,
      type: 'youtube',
      title: 'YouTube Video',
      videoId,
      image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  }
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function extractTitle($: cheerio.CheerioAPI): string {
  // Try multiple selectors
  return (
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text() ||
    $('h1').first().text() ||
    'Untitled'
  ).trim();
}

function extractDescription($: cheerio.CheerioAPI): string | undefined {
  const desc = (
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    $('meta[name="twitter:description"]').attr('content') ||
    $('p').first().text() ||
    ''
  ).trim();
  
  return desc.slice(0, 300);
}

function extractImage($: cheerio.CheerioAPI, baseUrl: string): string | undefined {
  let imgUrl = 
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') ||
    $('img').first().attr('src');
  
  if (imgUrl) {
    // Handle relative URLs
    if (imgUrl.startsWith('/')) {
      const base = new URL(baseUrl);
      imgUrl = `${base.protocol}//${base.host}${imgUrl}`;
    }
    return imgUrl;
  }
  
  return undefined;
}

function extractFavicon($: cheerio.CheerioAPI, baseUrl: string): string | undefined {
  let favicon = 
    $('link[rel="icon"]').attr('href') ||
    $('link[rel="shortcut icon"]').attr('href');
  
  if (favicon) {
    if (favicon.startsWith('/')) {
      const base = new URL(baseUrl);
      favicon = `${base.protocol}//${base.host}${favicon}`;
    }
    return favicon;
  }
  
  // Fallback to default favicon location
  try {
    const base = new URL(baseUrl);
    return `${base.protocol}//${base.host}/favicon.ico`;
  } catch {
    return undefined;
  }
}

function extractPrice($: cheerio.CheerioAPI): string | undefined {
  // Common price selectors and patterns
  const priceSelectors = [
    '[class*="price"]',
    '[id*="price"]',
    '.product-price',
    '[itemprop="price"]',
  ];
  
  for (const selector of priceSelectors) {
    const element = $(selector).first();
    if (element.length) {
      const text = element.text().trim();
      const priceMatch = text.match(/[$€£¥]\s*[\d,]+\.?\d*/);
      if (priceMatch) {
        return priceMatch[0];
      }
    }
  }
  
  // Try to find any price pattern in the page
  const bodyText = $('body').text();
  const priceMatch = bodyText.match(/[$€£¥]\s*[\d,]+\.?\d*/);
  
  return priceMatch ? priceMatch[0] : undefined;
}

function extractAuthor($: cheerio.CheerioAPI): string | undefined {
  return (
    $('meta[name="author"]').attr('content') ||
    $('meta[property="article:author"]').attr('content') ||
    $('[rel="author"]').text() ||
    undefined
  )?.trim();
}

// Detect if text is a todo list
export function detectTodoList(text: string): boolean {
  const lines = text.trim().split('\n');
  
  if (lines.length < 2) return false;
  
  let todoCount = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    // Check for todo patterns
    if (
      /^[-*•]\s/.test(trimmed) ||
      /^\d+[\.)]\s/.test(trimmed) ||
      /^\[[ x]\]\s/i.test(trimmed)
    ) {
      todoCount++;
    }
  }
  
  // If more than half the lines look like todos, it's a todo list
  return todoCount >= lines.length * 0.5;
}

// Parse todo list into structured format
export function parseTodoList(text: string): string[] {
  const lines = text.trim().split('\n');
  const todos: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Remove common todo prefixes
    const cleaned = trimmed
      .replace(/^[-*•]\s+/, '')
      .replace(/^\d+[\.)]\s+/, '')
      .replace(/^\[[ x]\]\s+/i, '');
    
    if (cleaned) {
      todos.push(cleaned);
    }
  }
  
  return todos;
}

