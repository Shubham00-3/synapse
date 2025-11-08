import Image from 'next/image';
import AIInsights from '../AIInsights';
import RelatedItems from '../RelatedItems';

interface ArticleCardProps {
  item: {
    id: number;
    title: string;
    content: string;
    metadata: {
      url?: string;
      image?: string;
      description?: string;
      author?: string;
      favicon?: string;
      htmlContent?: string;
      readingTime?: number;
      wordCount?: number;
      aiSummary?: string;
      keyPoints?: string[];
      topics?: string[];
    };
    created_at: string;
  };
  onDelete?: (id: number) => void;
}

export default function ArticleCard({ item, onDelete }: ArticleCardProps) {
  const handleClick = () => {
    if (item.metadata.url) {
      window.open(item.metadata.url, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer group">
      {item.metadata.image && (
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <Image
            src={item.metadata.image}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        </div>
      )}
      
      <div className="p-5" onClick={handleClick}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            {item.metadata.favicon && (
              <Image
                src={item.metadata.favicon}
                alt=""
                width={16}
                height={16}
                className="inline mr-2"
                unoptimized
              />
            )}
            <span className="text-xs text-gray-500">Article</span>
          </div>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {item.title}
        </h3>
        
        {(item.metadata.description || item.content) && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {item.metadata.description || item.content}
          </p>
        )}
        
        {item.metadata.author && (
          <p className="text-xs text-gray-500 mb-2">By {item.metadata.author}</p>
        )}
        
        <AIInsights metadata={item.metadata} />
        <RelatedItems itemId={item.id} />
        
        <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
          <div className="flex items-center gap-3">
            {item.metadata.htmlContent && (
              <a
                href={`/reader/${item.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
              >
                📖 Read
              </a>
            )}
            {item.metadata.url && (
              <span className="text-purple-500 group-hover:text-purple-700">
                View original →
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

