'use client';

import { useEffect, useState } from 'react';

interface Suggestion {
  type: 'review' | 'explore' | 'complete';
  title: string;
  description: string;
  itemId?: number;
  action?: string;
}

export default function SmartSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await fetch('/api/ai/smart-suggestions');
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'review': return '📖';
      case 'explore': return '🔍';
      case 'complete': return '✅';
      default: return '✨';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'review': return 'from-blue-50 to-cyan-50 border-blue-200';
      case 'explore': return 'from-purple-50 to-pink-50 border-purple-200';
      case 'complete': return 'from-green-50 to-emerald-50 border-green-200';
      default: return 'from-gray-50 to-slate-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">✨</span>
          <h2 className="text-lg font-bold text-gray-900">Suggested for You</h2>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-md p-6 border border-purple-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">✨</span>
        <h2 className="text-lg font-bold text-gray-900">Suggested for You</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${getColor(suggestion.type)} p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getIcon(suggestion.type)}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {suggestion.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {suggestion.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

