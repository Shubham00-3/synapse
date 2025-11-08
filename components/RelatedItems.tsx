'use client';

import { useState, useEffect } from 'react';

interface RelatedItem {
  id: number;
  title: string;
  type: string;
  similarity: number;
}

interface RelatedItemsProps {
  itemId: number;
}

export default function RelatedItems({ itemId }: RelatedItemsProps) {
  const [related, setRelated] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded && related.length === 0) {
      loadRelatedItems();
    }
  }, [isExpanded]);

  const loadRelatedItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/related/${itemId}`);
      const data = await response.json();
      setRelated(data.related || []);
    } catch (error) {
      console.error('Failed to load related items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return '📄';
      case 'youtube': return '🎥';
      case 'todo': return '✅';
      case 'quote': return '💬';
      case 'product': return '🛍️';
      case 'image': return '🖼️';
      default: return '📝';
    }
  };

  const getStrengthColor = (similarity: number) => {
    if (similarity >= 0.8) return 'text-green-600';
    if (similarity >= 0.7) return 'text-blue-600';
    if (similarity >= 0.6) return 'text-purple-600';
    return 'text-gray-600';
  };

  return (
    <div className="mt-3 border-t border-gray-200 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🔗</span>
          <span className="text-sm font-semibold text-gray-700">Related Content</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {loading ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-gray-500 mt-2">Finding connections...</p>
            </div>
          ) : related.length > 0 ? (
            <div className="space-y-2">
              {related.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    // Scroll to the item or open it
                    const element = document.querySelector(`[data-item-id="${item.id}"]`);
                    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  <span className="text-lg">{getTypeIcon(item.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </p>
                    <p className={`text-xs ${getStrengthColor(item.similarity)}`}>
                      {Math.round(item.similarity * 100)}% similar
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No related items found
            </p>
          )}
        </div>
      )}
    </div>
  );
}

