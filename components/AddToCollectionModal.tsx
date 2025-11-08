'use client';

import { useEffect, useState } from 'react';

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: number;
}

interface Collection {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  itemCount: number;
  isItemInCollection: boolean;
}

export default function AddToCollectionModal({ isOpen, onClose, itemId }: AddToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen, itemId]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/collections');
      const data = await response.json();
      
      // Check which collections already contain this item
      const collectionsWithStatus = await Promise.all(
        data.collections.map(async (collection: any) => {
          const itemsResponse = await fetch(`/api/collections/${collection.id}/items`);
          const itemsData = await itemsResponse.json();
          const isItemInCollection = itemsData.items.some((item: any) => item.id === itemId);
          
          return {
            ...collection,
            isItemInCollection,
          };
        })
      );
      
      setCollections(collectionsWithStatus);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCollection = async (collectionId: number, isCurrentlyIn: boolean) => {
    setSaving(true);
    try {
      const method = isCurrentlyIn ? 'DELETE' : 'POST';
      const response = await fetch(`/api/collections/${collectionId}/items`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });

      if (response.ok) {
        // Update local state
        setCollections(collections.map(c => 
          c.id === collectionId 
            ? { ...c, isItemInCollection: !isCurrentlyIn }
            : c
        ));
      }
    } catch (error) {
      console.error('Failed to update collection:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add to Collection</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📚</div>
              <p className="text-gray-600 mb-4">No collections yet</p>
              <a
                href="/collections"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Create your first collection →
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => handleToggleCollection(collection.id, collection.isItemInCollection)}
                  disabled={saving}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    collection.isItemInCollection
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{collection.icon || '📁'}</span>
                      <div>
                        <p className="font-medium text-gray-900">{collection.name}</p>
                        {collection.description && (
                          <p className="text-sm text-gray-600 line-clamp-1">{collection.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {collection.itemCount} items
                        </p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      collection.isItemInCollection
                        ? 'bg-purple-600 border-purple-600'
                        : 'border-gray-300'
                    }`}>
                      {collection.isItemInCollection && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

