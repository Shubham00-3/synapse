'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Item {
  id: number;
  type: string;
  title: string;
  content: string;
  metadata: {
    url?: string;
    author?: string;
    htmlContent?: string;
    readingTime?: number;
    wordCount?: number;
  };
  created_at: string;
}

export default function ReaderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [width, setWidth] = useState<'narrow' | 'medium' | 'wide'>('medium');

  useEffect(() => {
    fetchItem();
  }, []);

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/items?id=${params.id}`);
      if (!response.ok) {
        router.push('/dashboard');
        return;
      }
      const data = await response.json();
      setItem(data.item);
    } catch (error) {
      console.error('Failed to fetch item:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item || item.type !== 'article') {
    router.push('/dashboard');
    return null;
  }

  const fontSizeClasses = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
  };

  const fontFamilyClasses = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono',
  };

  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-[#f4ecd8] text-[#5f4b32]',
  };

  const widthClasses = {
    narrow: 'max-w-2xl',
    medium: 'max-w-4xl',
    wide: 'max-w-6xl',
  };

  const content = item.metadata.htmlContent || item.content;

  return (
    <div className={`min-h-screen ${themeClasses[theme]} transition-colors duration-200`}>
      {/* Controls Bar */}
      <div className={`sticky top-0 z-10 border-b ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : theme === 'sepia' ? 'border-[#d4c4a8] bg-[#f4ecd8]' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-4">
            {/* Font Size */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFontSize('small')}
                className={`px-2 py-1 text-sm rounded ${fontSize === 'small' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('medium')}
                className={`px-2 py-1 text-base rounded ${fontSize === 'medium' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 text-lg rounded ${fontSize === 'large' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
              >
                A
              </button>
            </div>

            {/* Font Family */}
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value as any)}
              className="px-3 py-1 rounded border bg-transparent"
            >
              <option value="serif">Serif</option>
              <option value="sans">Sans-serif</option>
              <option value="mono">Mono</option>
            </select>

            {/* Theme */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded ${theme === 'light' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                title="Light"
              >
                ☀️
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`p-2 rounded ${theme === 'sepia' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                title="Sepia"
              >
                📄
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded ${theme === 'dark' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}
                title="Dark"
              >
                🌙
              </button>
            </div>

            {/* Width */}
            <select
              value={width}
              onChange={(e) => setWidth(e.target.value as any)}
              className="px-3 py-1 rounded border bg-transparent"
            >
              <option value="narrow">Narrow</option>
              <option value="medium">Medium</option>
              <option value="wide">Wide</option>
            </select>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className={`${widthClasses[width]} mx-auto px-6 py-12`}>
        {/* Header */}
        <header className="mb-8">
          <h1 className={`font-bold mb-4 ${fontSize === 'small' ? 'text-3xl' : fontSize === 'medium' ? 'text-4xl' : 'text-5xl'}`}>
            {item.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm opacity-70">
            {item.metadata.author && (
              <span>By {item.metadata.author}</span>
            )}
            {item.metadata.readingTime && (
              <span>{item.metadata.readingTime} min read</span>
            )}
            {item.metadata.wordCount && (
              <span>{item.metadata.wordCount.toLocaleString()} words</span>
            )}
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
        </header>

        {/* Article Body */}
        <article
          className={`
            ${fontSizeClasses[fontSize]} 
            ${fontFamilyClasses[fontFamily]}
            leading-relaxed
            prose prose-lg max-w-none
            ${theme === 'dark' ? 'prose-invert' : ''}
          `}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Original Link */}
        {item.metadata.url && (
          <footer className="mt-12 pt-6 border-t">
            <a
              href={item.metadata.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
            >
              View original article
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </footer>
        )}
      </div>
    </div>
  );
}

