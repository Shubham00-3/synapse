import { Item } from './db';
import { cosineSimilarity } from './ai';

export interface RelatedItem {
  id: number;
  title: string;
  type: string;
  similarity: number;
}

// Find related items based on embedding similarity
export function findRelatedItems(
  currentItem: Item,
  allItems: Item[],
  topK: number = 5,
  minSimilarity: number = 0.5
): RelatedItem[] {
  if (!currentItem.embedding_vector) {
    return [];
  }

  try {
    const currentEmbedding = JSON.parse(currentItem.embedding_vector);
    const related: RelatedItem[] = [];

    for (const item of allItems) {
      // Skip the current item
      if (item.id === currentItem.id) continue;
      
      // Skip items without embeddings
      if (!item.embedding_vector) continue;

      try {
        const itemEmbedding = JSON.parse(item.embedding_vector);
        const similarity = cosineSimilarity(currentEmbedding, itemEmbedding);

        if (similarity >= minSimilarity) {
          related.push({
            id: item.id,
            title: item.title,
            type: item.type,
            similarity,
          });
        }
      } catch {
        // Skip items with invalid embeddings
        continue;
      }
    }

    // Sort by similarity and return top K
    return related
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch {
    return [];
  }
}

// Get connection strength description
export function getConnectionStrength(similarity: number): {
  label: string;
  color: string;
} {
  if (similarity >= 0.8) {
    return { label: 'Very Similar', color: 'text-green-600' };
  } else if (similarity >= 0.7) {
    return { label: 'Quite Similar', color: 'text-blue-600' };
  } else if (similarity >= 0.6) {
    return { label: 'Somewhat Related', color: 'text-purple-600' };
  } else {
    return { label: 'Loosely Related', color: 'text-gray-600' };
  }
}

