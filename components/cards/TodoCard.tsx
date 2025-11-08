import { useState } from 'react';

interface TodoCardProps {
  item: {
    id: number;
    title: string;
    content: string;
    metadata: {
      todos?: string[];
      completed?: boolean[];
    };
    created_at: string;
  };
  onDelete?: (id: number) => void;
}

export default function TodoCard({ item, onDelete }: TodoCardProps) {
  const [completedState, setCompletedState] = useState<boolean[]>(
    item.metadata.completed || new Array(item.metadata.todos?.length || 0).fill(false)
  );

  const todos = item.metadata.todos || [];

  const toggleTodo = (index: number) => {
    const newState = [...completedState];
    newState[index] = !newState[index];
    setCompletedState(newState);
  };

  const completedCount = completedState.filter(Boolean).length;
  const totalCount = todos.length;

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📝</span>
          <span className="text-xs font-medium text-orange-600">Todo List</span>
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

      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {item.title}
      </h3>

      <div className="space-y-2 mb-4">
        {todos.map((todo, index) => (
          <label
            key={index}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={completedState[index]}
              onChange={() => toggleTodo(index)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
            />
            <span className={`flex-1 text-sm ${completedState[index] ? 'line-through text-gray-500' : 'text-gray-700'}`}>
              {todo}
            </span>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-orange-100">
        <span>{new Date(item.created_at).toLocaleDateString()}</span>
        <span className="font-medium">
          {completedCount} / {totalCount} completed
        </span>
      </div>
    </div>
  );
}

