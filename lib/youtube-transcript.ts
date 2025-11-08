import { YoutubeTranscript } from 'youtube-transcript';

export interface TranscriptEntry {
  text: string;
  offset: number;
  duration: number;
}

/**
 * Extract transcript from a YouTube video
 * @param videoId - YouTube video ID
 * @returns Full transcript text or null if unavailable
 */
export async function extractYouTubeTranscript(videoId: string): Promise<string | null> {
  try {
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcriptData || transcriptData.length === 0) {
      return null;
    }

    // Combine all transcript entries into a single text
    const fullText = transcriptData
      .map((entry: TranscriptEntry) => entry.text)
      .join(' ')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    return fullText || null;
  } catch (error: any) {
    // Transcript might not be available (disabled, auto-generated only, etc.)
    console.error(`Failed to extract transcript for video ${videoId}:`, error.message);
    return null;
  }
}

/**
 * Get a summary-friendly excerpt from transcript
 * @param transcript - Full transcript text
 * @param maxLength - Maximum length in characters
 * @returns Truncated transcript
 */
export function truncateTranscript(transcript: string, maxLength: number = 8000): string {
  if (transcript.length <= maxLength) {
    return transcript;
  }
  
  // Try to cut at sentence boundary
  const truncated = transcript.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');
  
  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
  
  if (lastSentenceEnd > maxLength * 0.8) {
    return truncated.slice(0, lastSentenceEnd + 1);
  }
  
  return truncated + '...';
}

