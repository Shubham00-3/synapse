import { scrapeUrl, detectTodoList, parseTodoList } from './scraper';
import { generateEmbedding, analyzeContent, generateSummaryAndInsights } from './ai';
import { extractYouTubeTranscript, truncateTranscript } from './youtube-transcript';

export interface ProcessedContent {
  type: string;
  title: string;
  content: string;
  metadata: any;
  embedding: number[];
}

// Process different types of input
export async function processContent(input: {
  type: 'url' | 'text' | 'image';
  data: string;
}): Promise<ProcessedContent> {
  switch (input.type) {
    case 'url':
      return await processUrl(input.data);
    case 'text':
      return await processText(input.data);
    case 'image':
      return await processImage(input.data);
    default:
      throw new Error('Invalid input type');
  }
}

// Process URL input
async function processUrl(url: string): Promise<ProcessedContent> {
  try {
    // Scrape metadata from the URL
    const metadata = await scrapeUrl(url);
    
    // Handle YouTube videos specially - extract transcript
    let transcript: string | null = null;
    let contentForProcessing = metadata.fullContent || metadata.description || '';
    let contentForStorage = metadata.fullContent || metadata.description || '';
    
    if (metadata.type === 'youtube' && metadata.videoId) {
      try {
        console.log(`Extracting transcript for YouTube video: ${metadata.videoId}`);
        transcript = await extractYouTubeTranscript(metadata.videoId);
        
        if (transcript) {
          console.log(`Transcript extracted: ${transcript.length} characters`);
          contentForProcessing = transcript;
          contentForStorage = transcript;
        } else {
          console.log('No transcript available for this video');
          // Fallback to description if transcript unavailable
          contentForProcessing = metadata.description || '';
          contentForStorage = metadata.description || '';
        }
      } catch (error) {
        console.error('Error extracting YouTube transcript:', error);
        // Continue with description if transcript extraction fails
        contentForProcessing = metadata.description || '';
        contentForStorage = metadata.description || '';
      }
    }
    
    // Generate embedding from title and content
    const textForEmbedding = `${metadata.title} ${contentForProcessing}`.slice(0, 8000);
    const embedding = await generateEmbedding(textForEmbedding);
    
    // Generate AI insights for articles and YouTube videos (if we have content)
    let aiInsights = null;
    const shouldGenerateInsights = 
      (metadata.type === 'article' || metadata.type === 'youtube') && 
      contentForProcessing && 
      contentForProcessing.length > 50;
    
    if (shouldGenerateInsights) {
      try {
        // For YouTube, use truncated transcript for AI processing
        const contentForAI = metadata.type === 'youtube' && transcript
          ? truncateTranscript(transcript, 4000)
          : contentForProcessing.slice(0, 4000);
        
        aiInsights = await generateSummaryAndInsights(
          metadata.title,
          contentForAI,
          metadata.type
        );
      } catch (error) {
        console.error('Failed to generate AI insights:', error);
        // Skip AI insights if it fails
      }
    }
    
    return {
      type: metadata.type,
      title: metadata.title,
      content: contentForStorage,
      metadata: {
        url: metadata.url,
        image: metadata.image,
        price: metadata.price,
        author: metadata.author,
        videoId: metadata.videoId,
        favicon: metadata.favicon,
        htmlContent: metadata.htmlContent,
        readingTime: metadata.readingTime,
        wordCount: metadata.wordCount,
        transcript: transcript ? transcript.slice(0, 500) : undefined, // Store first 500 chars in metadata for preview
        hasTranscript: !!transcript,
        aiSummary: aiInsights?.summary,
        keyPoints: aiInsights?.keyPoints,
        topics: aiInsights?.topics,
      },
      embedding,
    };
  } catch (error) {
    console.error('Error processing URL:', error);
    
    // Fallback processing
    const embedding = await generateEmbedding(url);
    return {
      type: 'article',
      title: url,
      content: '',
      metadata: { url },
      embedding,
    };
  }
}

// Process text input
async function processText(text: string): Promise<ProcessedContent> {
  // Check if it's a todo list
  if (detectTodoList(text)) {
    const todos = parseTodoList(text);
    const title = `Todo List - ${new Date().toLocaleDateString()}`;
    const embedding = await generateEmbedding(text);
    
    return {
      type: 'todo',
      title,
      content: text,
      metadata: {
        todos,
        completed: todos.map(() => false),
      },
      embedding,
    };
  }
  
  // Check if it's a quote (starts and ends with quotes)
  const trimmed = text.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    trimmed.includes('—') ||
    trimmed.includes(' - ')
  ) {
    // Try to extract author
    const parts = trimmed.split(/—|-/).map(p => p.trim());
    const quote = parts[0].replace(/^["']|["']$/g, '');
    const author = parts.length > 1 ? parts[parts.length - 1] : undefined;
    
    const embedding = await generateEmbedding(quote);
    
    return {
      type: 'quote',
      title: quote.slice(0, 100),
      content: quote,
      metadata: { author },
      embedding,
    };
  }
  
  // Use AI to analyze the content
  try {
    const analysis = await analyzeContent(text);
    const embedding = await generateEmbedding(text);
    
    // Generate AI insights for longer text
    let aiInsights = null;
    if (text.length > 50) {
      try {
        aiInsights = await generateSummaryAndInsights(
          analysis.title,
          text,
          analysis.type
        );
      } catch (error) {
        console.error('Failed to generate AI insights:', error);
        // Skip AI insights if it fails
      }
    }
    
    return {
      type: analysis.type,
      title: analysis.title,
      content: text,
      metadata: {
        summary: analysis.summary,
        aiSummary: aiInsights?.summary,
        keyPoints: aiInsights?.keyPoints,
        topics: aiInsights?.topics,
      },
      embedding,
    };
  } catch {
    // Fallback to generic note
    const embedding = await generateEmbedding(text);
    const title = text.split('\n')[0].slice(0, 100) || 'Note';
    
    return {
      type: 'note',
      title,
      content: text,
      metadata: {},
      embedding,
    };
  }
}

// Process image input
async function processImage(dataUrl: string): Promise<ProcessedContent> {
  // Extract text from image using OCR
  let ocrText = '';
  let aiInsights = null;
  let visionAnalysis = null;
  
  // Skip OCR/Vision during build time (File API not available)
  if (typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping OCR during build phase');
  } else {
    try {
      // Dynamic import to avoid bundling issues
      const { extractTextFromImage } = await import('./ocr');
      ocrText = await extractTextFromImage(dataUrl);
      console.log('OCR extracted text length:', ocrText.length);
    } catch (error) {
      console.error('OCR failed:', error);
      // Continue without OCR text
    }
  }
  
  // Analyze image with vision AI if we have OCR text
  if (ocrText && ocrText.length > 0) {
    try {
      const { analyzeImageContent, generateSearchTags } = await import('./vision-ai');
      visionAnalysis = await analyzeImageContent(ocrText, dataUrl);
      if (visionAnalysis) {
        console.log('Vision analysis:', visionAnalysis.scene);
      }
    } catch (error) {
      console.error('Vision AI failed:', error);
    }
  }
  
  // Generate title based on vision analysis, OCR text, or fallback to date
  let title = `Image - ${new Date().toLocaleDateString()}`;
  if (visionAnalysis?.description) {
    title = visionAnalysis.description.slice(0, 100);
  } else if (ocrText.length > 0) {
    title = ocrText.split('\n')[0].slice(0, 100) || title;
  }
  
  // Combine OCR text and vision tags for better embedding
  let textForEmbedding = ocrText || title;
  if (visionAnalysis) {
    const { generateSearchTags } = await import('./vision-ai');
    const tags = generateSearchTags(visionAnalysis);
    textForEmbedding += ' ' + tags.join(' ');
  }
  
  const embedding = await generateEmbedding(textForEmbedding);
  
  // Generate AI insights if we have substantial text
  if (ocrText && ocrText.length > 100) {
    try {
      aiInsights = await generateSummaryAndInsights(
        title,
        ocrText,
        'note'
      );
    } catch (error) {
      console.error('Failed to generate AI insights from OCR:', error);
    }
  }
  
  return {
    type: 'image',
    title,
    content: ocrText, // Store OCR-extracted text as content
    metadata: {
      dataUrl,
      ocrText,
      hasText: ocrText.length > 0,
      visionAnalysis,
      aiSummary: aiInsights?.summary,
      keyPoints: aiInsights?.keyPoints,
      topics: aiInsights?.topics,
    },
    embedding,
  };
}

// Detect content type from raw input
export function detectInputType(input: string): 'url' | 'text' | 'image' {
  // Check if it's a URL
  try {
    const url = new URL(input);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return 'url';
    }
  } catch {
    // Not a valid URL
  }
  
  // Check if it's a data URL (image)
  if (input.startsWith('data:image/')) {
    return 'image';
  }
  
  // Default to text
  return 'text';
}

