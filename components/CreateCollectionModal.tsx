'use client';

import { useState } from 'react';

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrUpdate: (data: { name: string; description: string; color: string; icon: string }, id?: number) => Promise<void>;
  editingCollection?: {
    id: number;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
  } | null;
}

const ICONS = ['📚', '💼', '🎯', '✨', '🚀', '💡', '🎨', '📝', '🔖', '⭐', '🌟', '🔥', '🎭', '🎪', '🎬', '🎮', '🎸', '🎹'];
const COLORS = [
  { name: 'Purple', class: 'from-purple-500 to-pink-500', preview: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  { name: 'Blue', class: 'from-blue-500 to-cyan-500', preview: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
  { name: 'Green', class: 'from-green-500 to-emerald-500', preview: 'bg-gradient-to-br from-green-500 to-emerald-500' },
  { name: 'Orange', class: 'from-orange-500 to-red-500', preview: 'bg-gradient-to-br from-orange-500 to-red-500' },
  { name: 'Indigo', class: 'from-indigo-500 to-purple-500', preview: 'bg-gradient-to-br from-indigo-500 to-purple-500' },
  { name: 'Pink', class: 'from-pink-500 to-rose-500', preview: 'bg-gradient-to-br from-pink-500 to-rose-500' },
];

export default function CreateCollectionModal({ isOpen, onClose, onCreateOrUpdate, editingCollection }: CreateCollectionModalProps) {
  const [name, setName] = useState(editingCollection?.name || '');
  const [description, setDescription] = useState(editingCollection?.description || '');
  const [selectedIcon, setSelectedIcon] = useState(editingCollection?.icon || ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(editingCollection?.color || COLORS[0].class);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onCreateOrUpdate(
        {
          name: name.trim(),
          description: description.trim(),
          color: selectedColor,
          icon: selectedIcon,
        },
        editingCollection?.id
      );
      handleClose();
    } catch (error) {
      console.error('Failed to save collection:', error);
      alert('Failed to save collection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setSelectedIcon(ICONS[0]);
    setSelectedColor(COLORS[0].class);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingCollection ? 'Edit Collection' : 'Create Collection'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview */}
        <div className={`h-32 bg-gradient-to-br ${selectedColor} relative mx-6 mt-6 rounded-xl overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-4 left-4 text-6xl">
            {selectedIcon}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Collection Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Reading List, Work Projects, Ideas"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this collection about?"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 resize-none"
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Icon
            </label>
            <div className="grid grid-cols-9 gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`text-3xl p-3 rounded-lg transition-all ${
                    selectedIcon === icon
                      ? 'bg-purple-100 ring-2 ring-purple-500 scale-110'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Color
            </label>
            <div className="grid grid-cols-3 gap-3">
              {COLORS.map((color) => (
                <button
                  key={color.class}
                  type="button"
                  onClick={() => setSelectedColor(color.class)}
                  className={`h-16 rounded-lg ${color.preview} transition-all ${
                    selectedColor === color.class
                      ? 'ring-4 ring-purple-500 scale-105'
                      : 'hover:scale-105'
                  }`}
                >
                  <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : editingCollection ? 'Update Collection' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

