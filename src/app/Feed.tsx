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
    // Optimistic UI
    setTimeout(() => {
      setArticles(prev => prev.filter(a => a.id !== articleId));
    }, 200);
    
    // DB Update
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
      <div className="flex flex-col items-center justify-center text-text-secondary relative w-full h-full bg-background">
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-sage-soft/30 backdrop-blur-xl border border-sage/20 rounded-full font-bold shadow-sm hover:scale-105 transition-transform text-foreground"
        >
          <ArrowLeft size={16} /> Dashboard
        </button>

        <CheckCircle size={64} className="mb-6 text-sage opacity-80" />
        <h2 className="text-3xl font-extrabold mb-3 text-foreground tracking-tight">You're all caught up.</h2>
        <p className="mb-10 text-lg">Want to read today's stories again?</p>
        
        <button 
          onClick={() => setArticles(initialArticles)}
          className="group relative flex h-14 items-center justify-center overflow-hidden rounded-full border border-sage/40 bg-foreground/90 px-10 text-background shadow-lg transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 text-sm font-medium mt-6"
        >
          <span className="relative z-10 flex items-center gap-2">
            Read Again
          </span>
        </button>
      </div>
    );
  }

  const activeArticle = articles[0];
  const st = activeArticle ? (Array.isArray(activeArticle.status) ? activeArticle.status[0] : activeArticle.status) : null;
  const isRead = st?.is_read === true || st?.status === 'read';
  const isSaved = st?.is_saved === true || st?.status === 'read_later';

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-md mx-auto px-4 py-8 relative bg-background">
      <button 
        onClick={onClose}
        className="fixed top-6 left-6 md:absolute md:-left-24 md:top-0 z-50 flex items-center gap-2 px-4 py-2 bg-sage-soft/30 backdrop-blur-xl border border-sage/20 rounded-full font-bold shadow-sm hover:scale-105 transition-transform text-foreground"
      >
        <ArrowLeft size={16} /> Dashboard
      </button>

      <div className="relative w-full h-[75vh] max-h-[750px] perspective-1000 mb-8 z-10">
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
      
      <div className="flex items-center justify-center gap-8 z-20">
        <button 
          onClick={() => triggerSwipe('left')}
          className="w-16 h-16 flex items-center justify-center bg-sage-soft/20 backdrop-blur-xl border border-sage/30 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-transform text-gold"
          aria-label="Read Later"
        >
          <Bookmark size={28} strokeWidth={isSaved ? 0 : 2} className={isSaved ? "fill-current scale-110" : "transition-transform"} />
        </button>
        <button 
          onClick={() => triggerSwipe('right')}
          className="w-16 h-16 flex items-center justify-center bg-sage-soft/20 backdrop-blur-xl border border-sage/30 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-transform text-sage"
          aria-label="Mark Read"
        >
          <Book size={28} strokeWidth={isRead ? 0 : 2} className={isRead ? "fill-current scale-110" : "transition-transform"} />
        </button>
      </div>
    </div>
  );
}
