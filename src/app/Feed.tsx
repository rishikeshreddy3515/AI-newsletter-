'use client';

import { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import SwipeCard, { SwipeCardHandle } from '@/components/SwipeCard';
import { updateArticleStatus } from './actions';
import { CheckCircle, X, Heart } from 'lucide-react';

export default function Feed({ initialArticles }: { initialArticles: any[] }) {
  const [articles, setArticles] = useState(initialArticles);
  const activeCardRef = useRef<SwipeCardHandle>(null);

  const handleSwipe = async (articleId: string, direction: 'left' | 'right') => {
    const status = direction === 'left' ? 'read_later' : 'read';
    
    // Allow animation to finish before removing from UI
    setTimeout(() => {
      setArticles(prev => prev.filter(a => a.id !== articleId));
    }, 200);
    
    // Update DB
    await updateArticleStatus(articleId, status);
  };

  const triggerSwipe = (dir: 'left' | 'right') => {
    if (activeCardRef.current) {
      activeCardRef.current.swipe(dir);
    }
  };

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <CheckCircle size={64} className="mb-4 text-green-500 opacity-80" />
        <h2 className="text-2xl font-bold mb-2">You're all caught up!</h2>
        <p>Check back tomorrow for the next AI Morning Brief.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-md mx-auto px-4 py-8 relative">
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
          className="w-16 h-16 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-transform border border-gray-100 dark:border-gray-700 text-red-500"
          aria-label="Read Later"
        >
          <X size={32} strokeWidth={3} />
        </button>
        <button 
          onClick={() => triggerSwipe('right')}
          className="w-16 h-16 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-transform border border-gray-100 dark:border-gray-700 text-green-500"
          aria-label="Mark Read"
        >
          <Heart size={28} strokeWidth={3} className="fill-current" />
        </button>
      </div>
    </div>
  );
}
