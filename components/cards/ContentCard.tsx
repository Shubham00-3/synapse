'use client';

import { useState } from 'react';
import ArticleCard from './ArticleCard';
import TodoCard from './TodoCard';
import YouTubeCard from './YouTubeCard';
import ProductCard from './ProductCard';
import ImageCard from './ImageCard';
import QuoteCard from './QuoteCard';
import NoteCard from './NoteCard';
import AddToCollectionModal from '../AddToCollectionModal';

interface ContentCardProps {
  item: {
    id: number;
    type: string;
    title: string;
    content: string;
    metadata: any;
    created_at: string;
  };
  onDelete?: (id: number) => void;
  showCollectionButton?: boolean;
}

export default function ContentCard({ item, onDelete, showCollectionButton = true }: ContentCardProps) {
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const renderCard = () => {
    switch (item.type) {
      case 'article':
        return <ArticleCard item={item} onDelete={onDelete} />;
      case 'todo':
        return <TodoCard item={item} onDelete={onDelete} />;
      case 'youtube':
        return <YouTubeCard item={item} onDelete={onDelete} />;
      case 'product':
        return <ProductCard item={item} onDelete={onDelete} />;
      case 'image':
        return <ImageCard item={item} onDelete={onDelete} />;
      case 'quote':
        return <QuoteCard item={item} onDelete={onDelete} />;
      case 'note':
      default:
        return <NoteCard item={item} onDelete={onDelete} />;
    }
  };

  return (
    <>
      <div className="relative">
        {renderCard()}
        {showCollectionButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCollectionModal(true);
            }}
            className="absolute top-3 right-12 bg-purple-100 text-purple-700 p-2 rounded-lg hover:bg-purple-200 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
            title="Add to collection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </button>
        )}
      </div>

      <AddToCollectionModal
        isOpen={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        itemId={item.id}
      />
    </>
  );
}

