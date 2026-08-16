'use client';

import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SwipeCard, { SwipeCardHandle } from '@/components/SwipeCard';
import { updateArticleStatus } from './actions';
import { CheckCircle, ArrowLeft, RefreshCw, Book, Bookmark } from 'lucide-react';

export default function Feed({ initialArticles, onClose }: { initialArticles: any[], onClose: () => void }) {
  const [articles, setArticles] = useState(initialArticles);
  const activeCardRef = useRef<SwipeCardHandle>(null);

  const handleSwipe = async (articleId: string, direction: 'left' | 'right') => {
    // 1. Instantly delete it from the UI state ONLY AFTER the card finishes its physics animation
    setArticles(prev => prev.filter(a => a.id !== articleId));
    
    // 2. Do the database update in the background
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
      <div className="flex flex-col items-center justify-center text-text-secondary relative w-full h-[100dvh] bg-background overflow-hidden">
        {/* Animated Background Glow */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-[80vw] h-[80vw] max-w-3xl max-h-3xl rounded-full bg-sage blur-[120px] opacity-40"></div>
        </motion.div>

        <button 
          onClick={onClose}
          className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-sage-soft/30 backdrop-blur-xl border border-sage/20 rounded-full font-bold shadow-sm hover:scale-105 transition-transform text-foreground"
        >
          <ArrowLeft size={16} /> Dashboard
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="relative z-10 flex flex-col items-center text-center p-12 backdrop-blur-2xl bg-white/5 dark:bg-black/20 border border-sage/20 rounded-[3rem] shadow-2xl max-w-xl mx-4"
        >
          <div className="w-24 h-24 mb-8 rounded-full bg-sage-soft/20 flex items-center justify-center border border-sage/30 shadow-[0_0_30px_-5px_rgba(143,162,138,0.4)]">
            <CheckCircle size={40} className="text-sage" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground tracking-tight drop-shadow-sm">You're all caught up.</h2>
          <p className="mb-12 text-lg text-text-secondary font-medium leading-relaxed max-w-md">
            You've successfully cleared today's intelligence brief. Want to reinforce what you've learned?
          </p>
          
          <button 
            onClick={() => setArticles(initialArticles)}
            className="group relative flex h-16 w-full max-w-[280px] items-center justify-center overflow-hidden rounded-full border border-sage/30 bg-gradient-to-r from-sage to-sage-soft px-10 shadow-[0_0_40px_-10px_rgba(143,162,138,0.6)] transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_0_80px_-15px_rgba(143,162,138,0.8)] active:scale-95"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out"></div>
            <span className="relative z-10 flex items-center gap-3 text-lg font-extrabold tracking-widest uppercase text-white drop-shadow-md">
              <RefreshCw size={22} className="group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
              Read Again
            </span>
          </button>
        </motion.div>
      </div>
    );
  }

  const activeArticle = articles[0];
  const st = activeArticle ? (Array.isArray(activeArticle.status) ? activeArticle.status[0] : activeArticle.status) : null;
  const isRead = st?.is_read === true || st?.status === 'read';
  const isSaved = st?.is_saved === true || st?.status === 'read_later';

  const analysis = activeArticle ? (Array.isArray(activeArticle.analysis) ? activeArticle.analysis[0] : activeArticle.analysis) : null;
  const editorialComment = analysis?.editorial_comment;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center w-full h-[100dvh] max-w-7xl mx-auto px-6 lg:px-12 py-6 pt-20 lg:py-24 relative bg-background gap-4 lg:gap-24 overflow-hidden">
      <button 
        onClick={onClose}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-sage-soft/30 backdrop-blur-xl border border-sage/20 rounded-full font-bold shadow-sm hover:scale-105 transition-transform text-foreground"
      >
        <ArrowLeft size={16} /> Dashboard
      </button>

      {/* LEFT COLUMN: Editorial Content */}
      <div className="flex-1 w-full max-w-2xl flex flex-col justify-center h-full relative z-20 order-2 lg:order-1 pt-4 lg:pt-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeArticle && (
            <motion.div 
              key={activeArticle.id}
              initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col h-full overflow-y-auto hide-scrollbar pb-4 lg:pb-32 pr-2"
            >
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-[1.1] tracking-tight">
                {analysis?.short_headline || activeArticle.title}
              </h2>
              
              {editorialComment && (
                <div className="flex items-start gap-4 mb-6 bg-sage-soft/10 p-5 rounded-2xl border border-sage/20">
                  <div>
                    <p className="text-xs font-mono font-bold text-sage mb-2 uppercase tracking-wider">AI Insight</p>
                    <p className="text-[15px] text-text-secondary italic leading-relaxed">"{editorialComment}"</p>
                  </div>
                </div>
              )}

              <div className="prose max-w-none">
                <p className="text-[16px] sm:text-[19px] leading-relaxed mb-6 text-foreground font-medium">
                  {analysis?.detailed_summary}
                </p>

                <div className="bg-sage-soft/10 rounded-2xl p-6 mb-8 border border-sage/10">
                  <h3 className="text-xs font-black text-foreground mb-3 uppercase tracking-widest flex items-center gap-2 font-mono">
                    <span className="w-2 h-2 bg-gold rounded-full"></span>
                    Why it matters
                  </h3>
                  <p className="text-text-secondary text-[15px] leading-relaxed m-0">
                    {analysis?.why_it_matters}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons (Swipe Controls) */}
        <div className="flex items-center gap-6 mt-4 lg:mt-auto pb-4 lg:pb-0 shrink-0">
          <button 
            onClick={() => triggerSwipe('left')}
            className="w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center bg-sage-soft/20 backdrop-blur-xl border border-sage/30 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-transform text-gold group shrink-0"
            aria-label="Read Later"
          >
            <Bookmark size={24} strokeWidth={isSaved ? 0 : 2} className={isSaved ? "fill-current scale-110" : "transition-transform group-hover:scale-110"} />
          </button>
          <button 
            onClick={() => triggerSwipe('right')}
            className="w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center bg-sage-soft/20 backdrop-blur-xl border border-sage/30 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-transform text-sage group shrink-0"
            aria-label="Mark Read"
          >
            <Book size={24} strokeWidth={isRead ? 0 : 2} className={isRead ? "fill-current scale-110" : "transition-transform group-hover:scale-110"} />
          </button>
          <span className="text-sm font-bold text-text-muted uppercase tracking-widest ml-4 hidden sm:block">
            Swipe or Click
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Dribbble Card Stack */}
      <div className="h-[45vh] lg:h-[65vh] w-full lg:flex-1 max-w-md lg:max-w-lg relative perspective-1000 z-10 order-1 lg:order-2 shrink-0">
        <AnimatePresence mode="popLayout">
          {articles.map((article, index) => {
            const isActive = index === 0;
            return (
              <SwipeCard
                key={article.id}
                ref={isActive ? activeCardRef : null}
                article={article}
                isActive={isActive}
                index={index}
                onSwipe={(dir) => handleSwipe(article.id, dir)}
              />
            );
          }).reverse()}
        </AnimatePresence>
      </div>
    </div>
  );
}
