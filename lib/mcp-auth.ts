import { apiKeyDb } from './db';

/**
 * Validate an API key and return the associated user ID
 */
export async function validateApiKey(apiKey: string): Promise<number | null> {
  try {
    const keyRecord = apiKeyDb.findByKey(apiKey);
    
    if (!keyRecord) {
      return null;
    }

    // Update last used timestamp
    apiKeyDb.updateLastUsed(apiKey);

    return keyRecord.user_id;
  } catch (error) {
    console.error('Error validating API key:', error);
    return null;
  }
}

/**
 * Extract API key from Authorization header
 */
export function extractApiKey(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer <key>" and just "<key>"
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
}

