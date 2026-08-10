'use client';

import { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import SwipeCard, { SwipeCardHandle } from '@/components/SwipeCard';
import { updateArticleStatus } from './actions';
import { CheckCircle, ArrowLeft, RefreshCw, Book, Bookmark } from 'lucide-react';

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
          className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full font-bold shadow-sm hover:scale-105 transition-transform text-gray-900 dark:text-white"
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

  const activeArticle = articles[0];
  const st = activeArticle ? (Array.isArray(activeArticle.status) ? activeArticle.status[0] : activeArticle.status) : null;
  const isRead = st?.is_read === true || st?.status === 'read';
  const isSaved = st?.is_saved === true || st?.status === 'read_later';

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-md mx-auto px-4 py-8 relative">
      {/* Back to Dashboard Button */}
      <button 
        onClick={onClose}
        className="fixed top-6 left-6 md:absolute md:-left-24 md:top-0 z-50 flex items-center gap-2 px-4 py-2 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full font-bold shadow-md hover:scale-105 transition-transform text-gray-900 dark:text-white"
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
      
      {/* Tinder-style action buttons with Glassmorphism */}
      <div className="flex items-center justify-center gap-8 z-20">
        <button 
          onClick={() => triggerSwipe('left')}
          className="w-16 h-16 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-transform text-blue-500"
          aria-label="Read Later"
        >
          <Bookmark size={30} strokeWidth={isSaved ? 0 : 2} className={isSaved ? "fill-current scale-110" : "transition-transform"} />
        </button>
        <button 
          onClick={() => triggerSwipe('right')}
          className="w-16 h-16 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-transform text-green-500"
          aria-label="Mark Read"
        >
          <Book size={30} strokeWidth={isRead ? 0 : 2} className={isRead ? "fill-current scale-110" : "transition-transform"} />
        </button>
      </div>
    </div>
  );
}
