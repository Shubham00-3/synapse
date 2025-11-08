import Groq from 'groq-sdk';
import { Item } from './db';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  contextItems?: number[];
}

export interface ChatContext {
  items: Array<{
    id: number;
    type: string;
    title: string;
    content: string;
    metadata: any;
  }>;
  conversationHistory: ChatMessage[];
}

// Build context for the AI from user's saved items
export function buildKnowledgeContext(items: Item[], maxItems = 10): string {
  if (items.length === 0) {
    return "The user hasn't saved any content yet.";
  }

  const itemsContext = items.slice(0, maxItems).map((item, index) => {
    const metadata = item.metadata_json ? JSON.parse(item.metadata_json) : {};
    
    // For YouTube videos, indicate if transcript is available
    const hasTranscript = item.type === 'youtube' && metadata.hasTranscript === true;
    const contentLabel = hasTranscript
      ? 'Video Transcript'
      : item.type === 'youtube'
      ? 'Video Description'
      : 'Content';
    
    // For YouTube videos with transcript, show more content (up to 2000 chars for better context)
    const contentPreview = hasTranscript
      ? (item.content ? item.content.slice(0, 2000) : 'No transcript available')
      : (item.content ? item.content.slice(0, 300) : 'No content');
    
    return `[Item ${index + 1}] (ID: ${item.id}, Type: ${item.type})
Title: ${item.title}
${contentLabel}: ${contentPreview}
${metadata.videoId ? `Video ID: ${metadata.videoId}` : ''}
${metadata.url ? `URL: ${metadata.url}` : ''}
${metadata.aiSummary ? `AI Summary: ${metadata.aiSummary}` : ''}
${metadata.keyPoints && metadata.keyPoints.length > 0 ? `Key Points: ${metadata.keyPoints.join('; ')}` : ''}
${metadata.topics && metadata.topics.length > 0 ? `Topics: ${metadata.topics.join(', ')}` : ''}
`;
  }).join('\n---\n');

  return `The user has saved ${items.length} items in their knowledge base. Here are the most relevant ones:\n\n${itemsContext}`;
}

// Chat with the knowledge base
export async function chatWithKnowledge(
  userMessage: string,
  context: ChatContext
): Promise<{ response: string; citedItems: number[] }> {
  try {
    // Build the context string
    const knowledgeContext = buildKnowledgeContext(
      context.items.map(item => ({
        ...item,
        metadata_json: JSON.stringify(item.metadata),
        embedding_vector: null,
        user_id: 0, // Not needed for context
        created_at: new Date().toISOString(),
      })),
      20
    );

    // Build conversation history
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    
    // Add recent conversation history (last 5 exchanges)
    const recentHistory = context.conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });

    // Add current message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    // Call Groq with context
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are Synapse AI, an intelligent assistant that helps users explore and understand their personal knowledge base. 

${knowledgeContext}

Your role:
- Help users find, understand, and connect information from their saved content
- Answer questions based on their saved items
- Suggest connections between ideas
- Provide summaries and insights
- For YouTube videos: If "Video Transcript" is shown, you have the full transcript and can provide detailed answers. If only "Video Description" is shown, the video didn't have captions enabled, so you can only work with the description.
- When referencing saved content, mention the Item ID so users can find it
- Be conversational, helpful, and insightful
- If you don't have relevant information, say so honestly

Guidelines:
- Always cite which saved items you're referencing (e.g., "Based on Item 3...")
- For YouTube videos WITH transcripts, you can provide comprehensive summaries and answer specific questions about the content
- For YouTube videos WITHOUT transcripts (description only), acknowledge the limitation and work with what's available
- Help users discover patterns in their learning
- Suggest what they might want to explore next
- Be encouraging about their knowledge journey`
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = response.choices[0]?.message?.content || '';

    // Extract cited item IDs from response
    const citedItems: number[] = [];
    const itemIdMatches = responseText.matchAll(/Item (\d+)/g);
    for (const match of itemIdMatches) {
      const itemId = parseInt(match[1]);
      if (!isNaN(itemId) && !citedItems.includes(itemId)) {
        citedItems.push(itemId);
      }
    }

    return {
      response: responseText,
      citedItems,
    };
  } catch (error) {
    console.error('Chat error:', error);
    return {
      response: "I'm having trouble connecting right now. Please try again in a moment.",
      citedItems: [],
    };
  }
}

// Generate suggested questions based on user's content
export function generateSuggestedQuestions(items: Item[]): string[] {
  const suggestions: string[] = [];
  
  if (items.length === 0) {
    return ["Tell me what I can do with Synapse"];
  }

  const types = new Set(items.map(i => i.type));
  
  if (types.has('article')) {
    suggestions.push("What are the key themes in my saved articles?");
  }
  
  if (types.has('todo')) {
    suggestions.push("What tasks do I have pending?");
  }
  
  if (types.has('youtube')) {
    suggestions.push("Summarize the videos I've saved");
  }

  if (items.length > 5) {
    suggestions.push("What have I been learning lately?");
    suggestions.push("Find connections between my saved items");
  }

  suggestions.push("What should I review today?");
  
  return suggestions.slice(0, 4);
}

