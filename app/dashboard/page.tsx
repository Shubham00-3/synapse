'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ContentCard from '@/components/cards/ContentCard';
import SearchBar from '@/components/SearchBar';
import AddItemModal from '@/components/AddItemModal';
import ChatButton from '@/components/ChatButton';
import SmartSuggestions from '@/components/SmartSuggestions';

interface Item {
  id: number;
  type: string;
  title: string;
  content: string;
  metadata: any;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [displayedItems, setDisplayedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>(null);

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
      fetchItems();
    } catch {
      router.push('/auth/login');
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
      const data = await response.json();
      setItems(data.items);
      setDisplayedItems(data.items);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (input: string) => {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to add item');
    }

    await fetchItems();
  };

  const handleSearch = async (query: string) => {
    setSearching(true);
    setSearchActive(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      setDisplayedItems(data.results);
      setAppliedFilters(data.appliedFilters || null);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchActive(false);
    setDisplayedItems(items);
    setAppliedFilters(null);
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/items?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems(items.filter(item => item.id !== id));
        setDisplayedItems(displayedItems.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
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

  const handleRegenerateInsights = async () => {
    if (!confirm('This will generate AI insights for all your saved items. Continue?')) return;
    
    setRegenerating(true);
    try {
      const response = await fetch('/api/ai/regenerate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || 'AI insights regenerated successfully!');
        await fetchItems(); // Refresh items to show new insights
      } else {
        alert('Failed to regenerate insights: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to regenerate insights:', error);
      alert('Failed to regenerate insights. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your Synapse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Synapse</h1>
              <p className="text-sm text-gray-600">Your second brain</p>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="/collections"
                className="text-sm text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Collections
              </a>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Smart Suggestions */}
        {!searchActive && items.length > 0 && (
          <div className="mb-8">
            <SmartSuggestions />
          </div>
        )}

        {/* Search and Add */}
        <div className="mb-8 space-y-4">
          <SearchBar 
            onSearch={handleSearch} 
            onClear={handleClearSearch}
            loading={searching}
            appliedFilters={appliedFilters}
          />
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-initial px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add to Synapse
            </button>
            
            {items.length > 0 && (
              <button
                onClick={handleRegenerateInsights}
                disabled={regenerating}
                className="flex-1 sm:flex-initial px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {regenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Generate AI Insights
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Results Info */}
        {searchActive && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">
              Found <span className="font-semibold text-purple-600">{displayedItems.length}</span> results
            </p>
          </div>
        )}

        {/* Items Grid */}
        {displayedItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {searchActive ? 'No results found' : 'Your Synapse is empty'}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchActive 
                ? 'Try a different search query'
                : 'Start capturing your thoughts, ideas, and discoveries'
              }
            </p>
            {!searchActive && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl font-medium"
              >
                Add your first item
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedItems.map((item) => (
              <ContentCard 
                key={item.id} 
                item={item}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
      />

      {/* AI Chat Button */}
      <ChatButton />
    </div>
  );
}

