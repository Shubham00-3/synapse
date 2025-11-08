interface QuoteCardProps {
  item: {
    id: number;
    title: string;
    content: string;
    metadata: {
      author?: string;
    };
    created_at: string;
  };
  onDelete?: (id: number) => void;
}

export default function QuoteCard({ item, onDelete }: QuoteCardProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-purple-400">
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl text-purple-300">"</span>
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

      <blockquote className="text-lg text-gray-800 font-medium italic mb-4 leading-relaxed">
        {item.content}
      </blockquote>

      {item.metadata.author && (
        <p className="text-right text-sm text-purple-700 font-semibold">
          — {item.metadata.author}
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-purple-100 text-xs text-gray-500">
        <span>{new Date(item.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

