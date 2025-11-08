import { createWorker, Worker } from 'tesseract.js';

let worker: Worker | null = null;

/**
 * Initialize Tesseract worker (reusable)
 */
async function getWorker(): Promise<Worker> {
  if (!worker) {
    worker = await createWorker('eng', 1, {
      // Use CDN for worker and language data to avoid bundling issues
      workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js',
    });
  }
  return worker;
}

/**
 * Extract text from an image using OCR
 * @param dataUrl Image data URL (data:image/png;base64,...)
 * @returns Extracted text
 */
export async function extractTextFromImage(dataUrl: string): Promise<string> {
  try {
    const worker = await getWorker();
    
    const { data: { text } } = await worker.recognize(dataUrl);
    
    // Clean up the text
    const cleanedText = text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n{3,}/g, '\n\n'); // Limit multiple newlines
    
    return cleanedText;
  } catch (error) {
    console.error('OCR extraction failed:', error);
    return '';
  }
}

/**
 * Pre-process image for better OCR accuracy
 * Note: In a production app, you might want to use canvas to:
 * - Convert to grayscale
 * - Increase contrast
 * - Resize to optimal dimensions
 * - Denoise
 */
export function preprocessImage(dataUrl: string): string {
  // For now, return as-is
  // Future enhancement: implement image pre-processing
  return dataUrl;
}

/**
 * Cleanup resources when done
 */
export async function terminateOCR() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

