import { useState } from 'react';

interface AIInsightsProps {
  metadata: {
    aiSummary?: string;
    keyPoints?: string[];
    topics?: string[];
  };
}

export default function AIInsights({ metadata }: AIInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!metadata.aiSummary && (!metadata.keyPoints || metadata.keyPoints.length === 0) && (!metadata.topics || metadata.topics.length === 0)) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-purple-100 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="text-sm font-semibold text-purple-700">AI Insights</span>
        </div>
        <svg
          className={`w-4 h-4 text-purple-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {metadata.aiSummary && (
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                {metadata.aiSummary}
              </p>
            </div>
          )}

          {metadata.keyPoints && metadata.keyPoints.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Key Points:</p>
              <ul className="space-y-1">
                {metadata.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {metadata.topics && metadata.topics.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Topics:</p>
              <div className="flex flex-wrap gap-1">
                {metadata.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

