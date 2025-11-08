'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ContentCard from '@/components/cards/ContentCard';

interface Item {
  id: number;
  type: string;
  title: string;
  content: string;
  metadata: any;
  created_at: string;
}

interface Collection {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  created_at: string;
}

export default function CollectionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/auth/login');
        return;
      }
      const data = await response.json();
      setUser(data.user);
      fetchCollection();
    } catch {
      router.push('/auth/login');
    }
  };

  const fetchCollection = async () => {
    try {
      // Fetch collection details
      const collectionResponse = await fetch(`/api/collections/${params.id}`);
      if (!collectionResponse.ok) {
        router.push('/collections');
        return;
      }
      const collectionData = await collectionResponse.json();
      setCollection(collectionData.collection);

      // Fetch collection items
      const itemsResponse = await fetch(`/api/collections/${params.id}/items`);
      const itemsData = await itemsResponse.json();
      setItems(itemsData.items);
    } catch (error) {
      console.error('Failed to fetch collection:', error);
      router.push('/collections');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!confirm('Remove this item from the collection?')) return;

    try {
      const response = await fetch(`/api/collections/${params.id}/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== itemId));
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  const colorClass = collection.color || 'from-purple-500 to-pink-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/collections')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{collection.icon}</span>
                  <h1 className="text-2xl font-bold text-gray-900">{collection.name}</h1>
                </div>
                {collection.description && (
                  <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Collection Header Banner */}
      <div className={`h-32 bg-gradient-to-br ${colorClass} relative`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <p className="text-lg font-medium">
              {items.length} {items.length === 1 ? 'item' : 'items'} in this collection
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No items yet
            </h2>
            <p className="text-gray-600 mb-6">
              Add items to this collection from your dashboard
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ContentCard 
                key={item.id} 
                item={item} 
                onDelete={handleRemoveItem}
                showCollectionButton={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

