'use client';

import { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import SwipeCard, { SwipeCardHandle } from '@/components/SwipeCard';
import { updateArticleStatus } from './actions';
import { CheckCircle, X, Heart, ArrowLeft, RefreshCw } from 'lucide-react';

export default function Feed({ initialArticles, onClose }: { initialArticles: any[], onClose: () => void }) {
  const [articles, setArticles] = useState(initialArticles);
  const activeCardRef = useRef<SwipeCardHandle>(null);

  const handleSwipe = async (articleId: string, direction: 'left' | 'right') => {
    // Optimistic UI: remove from stack immediately
    setTimeout(() => {
      setArticles(prev => prev.filter(a => a.id !== articleId));
    }, 200);
    
    // Background DB update
    if (direction === 'right') {
      await updateArticleStatus(articleId, { is_read: true });
    } else {
      await updateArticleStatus(articleId, { is_saved: true });
    }
  };

  const triggerSwipe = (dir: 'left' | 'right') => {
    if (activeCardRef.current) {
      activeCardRef.current.swipe(dir);
    }
  };

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 relative w-full h-full">
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-black/80 backdrop-blur rounded-full font-bold shadow-sm hover:scale-105 transition-transform text-gray-900 dark:text-white"
        >
          <ArrowLeft size={16} /> Dashboard
        </button>

        <CheckCircle size={64} className="mb-4 text-green-500 opacity-80" />
        <h2 className="text-2xl font-bold mb-2">You're all caught up.</h2>
        <p className="mb-8">Want to read today's stories again?</p>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
        >
          <RefreshCw size={18} /> Start Re-reading
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-md mx-auto px-4 py-8 relative">
      {/* Back to Dashboard Button */}
      <button 
        onClick={onClose}
        className="fixed top-6 left-6 md:absolute md:-left-24 md:top-0 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-black/80 backdrop-blur rounded-full font-bold shadow-md hover:scale-105 transition-transform text-gray-900 dark:text-white"
      >
        <ArrowLeft size={16} /> Dashboard
      </button>

      <div className="relative w-full h-[70vh] max-h-[700px] perspective-1000 mb-8 z-10">
        <AnimatePresence mode="popLayout">
          {articles.map((article, index) => {
            const isActive = index === 0;
            return (
              <SwipeCard
                key={article.id}
                ref={isActive ? activeCardRef : null}
                article={article}
                isActive={isActive}
                onSwipe={(dir) => handleSwipe(article.id, dir)}
              />
            );
          }).reverse()}
        </AnimatePresence>
      </div>
      
      {/* Tinder-style action buttons */}
      <div className="flex items-center justify-center gap-8 z-20">
        <button 
          onClick={() => triggerSwipe('left')}
          className="w-16 h-16 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform border border-gray-100 dark:border-gray-700 text-blue-500"
          aria-label="Read Later"
        >
          <X size={32} strokeWidth={3} />
        </button>
        <button 
          onClick={() => triggerSwipe('right')}
          className="w-16 h-16 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform border border-gray-100 dark:border-gray-700 text-green-500"
          aria-label="Mark Read"
        >
          <Heart size={28} strokeWidth={3} className="fill-current" />
        </button>
      </div>
    </div>
  );
}
