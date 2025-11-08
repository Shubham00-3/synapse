import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface VisionAnalysis {
  description: string;
  objects: string[];
  scene: string;
  colors: string[];
  tags: string[];
}

/**
 * Analyze image content using AI vision
 * Note: As of current implementation, Groq doesn't have vision models yet,
 * so we'll use a text-based approach with OCR results
 * In production, you could use GPT-4 Vision, Claude with images, or other vision APIs
 */
export async function analyzeImageContent(
  ocrText: string,
  imageDataUrl?: string
): Promise<VisionAnalysis | null> {
  try {
    // If we have OCR text, use AI to analyze it
    if (ocrText && ocrText.length > 20) {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `Analyze this text extracted from an image and provide insights in JSON format:

Text: ${ocrText.slice(0, 1000)}

Respond ONLY with valid JSON in this format:
{
  "description": "brief description of what the image likely contains",
  "objects": ["object1", "object2"],
  "scene": "type of scene (document, screenshot, photo, etc)",
  "colors": ["color1", "color2"],
  "tags": ["tag1", "tag2", "tag3"]
}

Be concise and relevant.`
        }],
        temperature: 0.5,
        max_tokens: 400,
      });

      const resultText = response.choices[0]?.message?.content || '{}';
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          description: analysis.description || '',
          objects: analysis.objects || [],
          scene: analysis.scene || 'unknown',
          colors: analysis.colors || [],
          tags: analysis.tags || [],
        };
      }
    }

    // Fallback basic analysis
    return null;
  } catch (error) {
    console.error('Vision AI analysis failed:', error);
    return null;
  }
}

/**
 * Generate searchable tags from vision analysis
 */
export function generateSearchTags(analysis: VisionAnalysis): string[] {
  const tags = new Set<string>();
  
  if (analysis.scene) tags.add(analysis.scene);
  analysis.objects.forEach(obj => tags.add(obj.toLowerCase()));
  analysis.colors.forEach(color => tags.add(color.toLowerCase()));
  analysis.tags.forEach(tag => tags.add(tag.toLowerCase()));
  
  return Array.from(tags);
}

