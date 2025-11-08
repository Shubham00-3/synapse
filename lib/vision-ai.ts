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
 * Uses Groq's Llama 3.2 Vision model (FREE!) to understand what's in the image
 * Works even without text - recognizes objects, scenes, people, etc.
 */
export async function analyzeImageContent(
  ocrText: string,
  imageDataUrl?: string
): Promise<VisionAnalysis | null> {
  try {
    // If we have the actual image, use Groq Vision API to analyze it
    if (imageDataUrl) {
      console.log('Analyzing image with Groq Vision API...');
      
      const response = await groq.chat.completions.create({
        model: 'llama-3.2-90b-vision-preview',  // Groq's FREE vision model
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image and provide detailed insights in JSON format.
              
Describe what you see: objects, people, scene, colors, mood, context, etc.

Respond ONLY with valid JSON in this format:
{
  "description": "detailed description of what's in the image",
  "objects": ["object1", "object2", "object3"],
  "scene": "type of scene (indoor/outdoor, location type, etc)",
  "colors": ["dominant color1", "color2"],
  "tags": ["searchable", "keywords", "for", "this", "image"]
}

Be specific and detailed. Include any text you see in the image.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl
              }
            }
          ]
        }],
        temperature: 0.3,
        max_tokens: 500,
      });

      const resultText = response.choices[0]?.message?.content || '{}';
      console.log('Vision API response:', resultText);
      
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
    
    // Fallback: If no image URL but we have OCR text, analyze the text
    if (ocrText && ocrText.length > 20) {
      console.log('Analyzing OCR text as fallback...');
      
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

    // No image or text to analyze
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

