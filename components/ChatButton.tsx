'use client';

import { useState } from 'react';
import AIChat from './AIChat';

export default function ChatButton() {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 group"
        title="Chat with Synapse AI"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
      </button>

      <AIChat isOpen={showChat} onClose={() => setShowChat(false)} />
    </>
  );
}

