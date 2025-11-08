import { useState } from 'react';
import Image from 'next/image';
import AIInsights from '../AIInsights';
import RelatedItems from '../RelatedItems';

interface YouTubeCardProps {
  item: {
    id: number;
    title: string;
    content: string;
    metadata: {
      url?: string;
      videoId?: string;
      image?: string;
      description?: string;
      aiSummary?: string;
      keyPoints?: string[];
      topics?: string[];
    };
    created_at: string;
  };
  onDelete?: (id: number) => void;
}

export default function YouTubeCard({ item, onDelete }: YouTubeCardProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const videoId = item.metadata.videoId;

  const handlePlay = () => {
    setShowPlayer(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="relative h-56 w-full bg-black group">
        {!showPlayer ? (
          <>
            {item.metadata.image && (
              <Image
                src={item.metadata.image}
                alt={item.title}
                fill
                className="object-cover"
                unoptimized
              />
            )}
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors"
            >
              <div className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>
          </>
        ) : (
          videoId && (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-medium text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            YouTube
          </span>
          {onDelete && (
            <button
              onClick={() => onDelete(item.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {item.title}
        </h3>

        {(item.metadata.description || item.content) && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {item.metadata.description || item.content}
          </p>
        )}

        {/* AI Insights */}
        <AIInsights metadata={item.metadata} />

        {/* Related Items */}
        <RelatedItems itemId={item.id} />

        <div className="flex items-center justify-between text-xs text-gray-400 mt-4">
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
          {item.metadata.url && (
            <a
              href={item.metadata.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700"
              onClick={(e) => e.stopPropagation()}
            >
              Watch on YouTube →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

