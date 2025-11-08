import Image from 'next/image';
import { useState } from 'react';
import AIInsights from '../AIInsights';
import RelatedItems from '../RelatedItems';

interface ImageCardProps {
  item: {
    id: number;
    title: string;
    content: string;
    metadata: {
      dataUrl?: string;
      caption?: string;
      ocrText?: string;
      hasText?: boolean;
      aiSummary?: string;
      keyPoints?: string[];
      topics?: string[];
      visionAnalysis?: {
        description: string;
        objects: string[];
        scene: string;
        colors: string[];
        tags: string[];
      };
    };
    created_at: string;
  };
  onDelete?: (id: number) => void;
}

export default function ImageCard({ item, onDelete }: ImageCardProps) {
  const [showFullscreen, setShowFullscreen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
        {item.metadata.dataUrl && (
          <div 
            className="relative h-64 w-full bg-gray-100 cursor-pointer"
            onClick={() => setShowFullscreen(true)}
          >
            <Image
              src={item.metadata.dataUrl}
              alt={item.title}
              fill
              className="object-cover hover:opacity-95 transition-opacity"
              unoptimized
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Image
              </span>
              {item.metadata.hasText && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Text Detected
                </span>
              )}
            </div>
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

          {item.content && (
            <div className="mb-3">
              <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                {item.content}
              </p>
            </div>
          )}

          {/* Vision AI Analysis */}
          {item.metadata.visionAnalysis && (
            <div className="mb-3 space-y-2">
              {item.metadata.visionAnalysis.objects.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.metadata.visionAnalysis.objects.map((obj, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full"
                    >
                      🔍 {obj}
                    </span>
                  ))}
                </div>
              )}
              
              {item.metadata.visionAnalysis.scene && (
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  <span className="font-medium">Scene:</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                    {item.metadata.visionAnalysis.scene}
                  </span>
                </div>
              )}
              
              {item.metadata.visionAnalysis.colors.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-medium">Colors:</span>
                  <div className="flex gap-1">
                    {item.metadata.visionAnalysis.colors.slice(0, 5).map((color, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <AIInsights metadata={item.metadata} />
          <RelatedItems itemId={item.id} />

          <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
            {new Date(item.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {showFullscreen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setShowFullscreen(false)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {item.metadata.dataUrl && (
            <div className="relative max-w-5xl max-h-full w-full h-full">
              <Image
                src={item.metadata.dataUrl}
                alt={item.title}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}

