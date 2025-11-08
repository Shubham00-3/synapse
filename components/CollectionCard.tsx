'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CollectionCardProps {
  collection: {
    id: number;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    itemCount: number;
    created_at: string;
  };
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const DEFAULT_ICONS = ['📚', '💼', '🎯', '✨', '🚀', '💡', '🎨', '📝', '🔖', '⭐'];
const DEFAULT_COLORS = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-purple-500',
  'from-pink-500 to-rose-500',
];

export default function CollectionCard({ collection, onEdit, onDelete }: CollectionCardProps) {
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);

  const colorClass = collection.color || DEFAULT_COLORS[collection.id % DEFAULT_COLORS.length];
  const icon = collection.icon || DEFAULT_ICONS[collection.id % DEFAULT_ICONS.length];

  const handleClick = () => {
    router.push(`/collections/${collection.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(collection.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete collection "${collection.name}"?`)) {
      onDelete?.(collection.id);
    }
  };

  return (
    <div
      className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Gradient Header */}
      <div className={`h-32 bg-gradient-to-br ${colorClass} relative`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
        <div className="absolute bottom-4 left-4 text-6xl">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
            {collection.name}
          </h3>
          
          {/* Action Buttons */}
          {showActions && (onEdit || onDelete) && (
            <div className="flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit collection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete collection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {collection.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {collection.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
          </span>
          <span className="text-purple-600 font-medium group-hover:translate-x-1 transition-transform">
            View →
          </span>
        </div>
      </div>
    </div>
  );
}

