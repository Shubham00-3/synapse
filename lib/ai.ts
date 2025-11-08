import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Generate embeddings using simple text-based approach
// For a production app, you'd use a proper embedding model
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Use Groq to generate a semantic summary (optional enhancement)
    // For now, we'll use the simple text-based vector which is fast and works well
    const vector = textToVector(text.slice(0, 500));
    return vector;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return textToVector(text.slice(0, 500));
  }
}

// Simple text to vector conversion (for prototype purposes)
// In production, use a proper embedding model
function textToVector(text: string): number[] {
  const vector: number[] = new Array(128).fill(0);
  const normalized = text.toLowerCase();
  
  // Create a simple frequency-based vector
  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const index = charCode % 128;
    vector[index] += 1;
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 0;
  
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }
  
  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);
  
  if (mag1 === 0 || mag2 === 0) return 0;
  
  return dotProduct / (mag1 * mag2);
}

// Semantic search using embeddings
export interface SearchResult {
  id: number;
  score: number;
  item: any;
}

export async function semanticSearch(
  query: string,
  items: Array<{ id: number; embedding_vector: string | null; [key: string]: any }>,
  topK: number = 10
): Promise<SearchResult[]> {
  // Generate embedding for the search query
  const queryEmbedding = await generateEmbedding(query);
  
  // Calculate similarity scores for all items
  const results: SearchResult[] = items
    .filter(item => item.embedding_vector)
    .map(item => {
      try {
        const itemEmbedding = JSON.parse(item.embedding_vector as string);
        const score = cosineSimilarity(queryEmbedding, itemEmbedding);
        return { id: item.id, score, item };
      } catch {
        return { id: item.id, score: 0, item };
      }
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  
  return results;
}

// Enhanced search that combines semantic and keyword matching
export async function enhancedSearch(
  query: string,
  items: Array<{ 
    id: number; 
    title: string;
    content: string | null;
    embedding_vector: string | null; 
    [key: string]: any 
  }>,
  topK: number = 10
): Promise<SearchResult[]> {
  // Get semantic search results
  const semanticResults = await semanticSearch(query, items, topK * 2);
  
  // Boost scores for keyword matches
  const queryTerms = query.toLowerCase().split(/\s+/);
  const enhancedResults = semanticResults.map(result => {
    let boost = 0;
    const title = result.item.title.toLowerCase();
    const content = (result.item.content || '').toLowerCase();
    
    // Add boost for exact keyword matches
    queryTerms.forEach(term => {
      if (title.includes(term)) boost += 0.3;
      if (content.includes(term)) boost += 0.1;
    });
    
    return {
      ...result,
      score: Math.min(result.score + boost, 1.0)
    };
  });
  
  // Re-sort and return top K
  return enhancedResults
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// Analyze text using Groq for content extraction
export async function analyzeContent(text: string): Promise<{
  type: string;
  title: string;
  summary?: string;
}> {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `Analyze this content and respond ONLY with valid JSON in this exact format:
{
  "type": "article|todo|quote|note",
  "title": "brief title",
  "summary": "one sentence summary"
}

Content: ${text.slice(0, 2000)}`
      }],
      temperature: 0.3,
      max_tokens: 300,
    });

    const resultText = response.choices[0]?.message?.content || '{}';
    
    // Extract JSON from response
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      type: 'note',
      title: text.slice(0, 100),
    };
  } catch (error) {
    console.error('Error analyzing content:', error);
    return {
      type: 'note',
      title: text.slice(0, 100),
    };
  }
}

// Generate AI summary and key points for content using Groq
export async function generateSummaryAndInsights(title: string, content: string, type: string): Promise<{
  summary: string;
  keyPoints: string[];
  topics: string[];
}> {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `Analyze this ${type} and provide insights in JSON format:

Title: ${title}
Content: ${content.slice(0, 2000)}

Respond ONLY with valid JSON in this format:
{
  "summary": "2-3 sentence summary of the main points",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "topics": ["topic1", "topic2", "topic3"]
}

Keep it concise and actionable.`
      }],
      temperature: 0.5,
      max_tokens: 500,
    });

    const resultText = response.choices[0]?.message?.content || '{}';
    
    // Extract JSON from response
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || 'No summary available',
        keyPoints: parsed.keyPoints || [],
        topics: parsed.topics || [],
      };
    }
    
    return {
      summary: content.slice(0, 200) + '...',
      keyPoints: [],
      topics: [],
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    return {
      summary: content.slice(0, 200) + '...',
      keyPoints: [],
      topics: [],
    };
  }
}

