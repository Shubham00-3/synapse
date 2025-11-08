import AIInsights from '../AIInsights';
import RelatedItems from '../RelatedItems';

interface NoteCardProps {
  item: {
    id: number;
    title: string;
    content: string;
    metadata: {
      aiSummary?: string;
      keyPoints?: string[];
      topics?: string[];
      [key: string]: any;
    };
    created_at: string;
  };
  onDelete?: (id: number) => void;
}

export default function NoteCard({ item, onDelete }: NoteCardProps) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">
          Note
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

      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        {item.title}
      </h3>

      <div className="text-gray-700 text-sm whitespace-pre-wrap mb-4 line-clamp-6">
        {item.content}
      </div>

      <AIInsights metadata={item.metadata} />
      <RelatedItems itemId={item.id} />

      <div className="text-xs text-gray-500 pt-3 border-t border-amber-100 mt-3">
        {new Date(item.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}

