import Image from 'next/image';

interface ProductCardProps {
  item: {
    id: number;
    title: string;
    content: string;
    metadata: {
      url?: string;
      image?: string;
      price?: string;
      description?: string;
    };
    created_at: string;
  };
  onDelete?: (id: number) => void;
}

export default function ProductCard({ item, onDelete }: ProductCardProps) {
  const handleClick = () => {
    if (item.metadata.url) {
      window.open(item.metadata.url, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer group">
      {item.metadata.image && (
        <div className="relative h-56 w-full bg-gray-50 overflow-hidden">
          <Image
            src={item.metadata.image}
            alt={item.title}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        </div>
      )}

      <div className="p-5" onClick={handleClick}>
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
            Product
          </span>
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

        {item.metadata.price && (
          <div className="mb-2">
            <span className="text-2xl font-bold text-green-600">
              {item.metadata.price}
            </span>
          </div>
        )}

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
          {item.title}
        </h3>

        {(item.metadata.description || item.content) && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {item.metadata.description || item.content}
          </p>
        )}

        <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
          <span className="text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
          {item.metadata.url && (
            <span className="text-green-600 group-hover:text-green-700 font-medium">
              View Product →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

