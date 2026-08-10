'use client';

import { motion, useAnimation, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useState, useImperativeHandle, forwardRef } from 'react';
import { ExternalLink, Check, BookmarkPlus } from 'lucide-react';
import CartoonMascot from './CartoonMascot';

interface Article {
  id: string;
  title: string;
  url: string;
  source: { name: string };
  publication_date: string;
  category: string;
  image_url?: string;
  analysis: any[];
}

export interface SwipeCardHandle {
  swipe: (dir: 'left' | 'right') => Promise<void>;
}

const SwipeCard = forwardRef<SwipeCardHandle, { 
  article: Article; 
  onSwipe: (dir: 'left' | 'right') => void;
  isActive: boolean;
}>(({ article, onSwipe, isActive }, ref) => {
  const controls = useAnimation();
  const x = useMotionValue(0);
  
  // Transform values based on drag distance
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-300, 0, 300], [0.5, 1, 0.5]);
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  // Directional Feedback Indicators
  const readOpacity = useTransform(x, [0, 150], [0, 1]);
  const readLaterOpacity = useTransform(x, [0, -150], [0, 1]);

  const handleSwipeAction = async (dir: 'left' | 'right') => {
    const targetX = dir === 'right' ? window.innerWidth : -window.innerWidth;
    await controls.start({ 
      x: targetX, 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.3, ease: 'easeOut' } 
    });
    onSwipe(dir);
  };

  useImperativeHandle(ref, () => ({
    swipe: handleSwipeAction
  }));

  const dragProps = isActive ? {
    drag: "x" as const,
    dragConstraints: { left: 0, right: 0 },
    dragDirectionLock: true,
    dragElastic: 0.8,
    onDragEnd: async (e: any, info: PanInfo) => {
      const threshold = 120; // Needs a deliberate swipe
      if (info.offset.x > threshold || info.velocity.x > 500) {
        await handleSwipeAction('right');
      } else if (info.offset.x < -threshold || info.velocity.x < -500) {
        await handleSwipeAction('left');
      } else {
        controls.start({ x: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } });
      }
    }
  } : {};

  const analysis = Array.isArray(article.analysis) ? article.analysis[0] || {} : article.analysis || {};
  const editorialComment = analysis.editorial_comment;

  return (
    <motion.div
      {...dragProps}
      animate={controls}
      initial={false}
      style={{
        x,
        rotate,
        scale,
        opacity: isActive ? 1 : 0.6,
        zIndex: isActive ? 10 : 0,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
      className="absolute inset-0 w-full h-full bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col touch-pan-y"
    >
      {/* Directional Overlay Indicators */}
      <motion.div style={{ opacity: readOpacity }} className="absolute inset-0 z-50 pointer-events-none bg-green-500/10 flex items-center justify-center">
        <div className="bg-green-500 text-white rounded-full p-6 shadow-2xl scale-150">
          <Check size={48} strokeWidth={3} />
        </div>
      </motion.div>
      <motion.div style={{ opacity: readLaterOpacity }} className="absolute inset-0 z-50 pointer-events-none bg-blue-500/10 flex items-center justify-center">
        <div className="bg-blue-500 text-white rounded-full p-6 shadow-2xl scale-150">
          <BookmarkPlus size={48} strokeWidth={3} />
        </div>
      </motion.div>

      {/* Image / Visual Header */}
      <div className="relative h-48 sm:h-56 shrink-0 bg-gray-900 overflow-hidden">
        {article.image_url ? (
          <img src={article.image_url} alt="Article visual" className="w-full h-full object-cover select-none pointer-events-none" />
        ) : (
          <img 
            src={
              article.category.toLowerCase() === 'research' 
                ? 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800' // Tech chip/board
                : article.category.toLowerCase() === 'models'
                ? 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800' // Abstract AI orb
                : article.category.toLowerCase() === 'open source'
                ? 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800' // Code on screen
                : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800' // Global digital earth
            } 
            alt="Category fallback" 
            className="w-full h-full object-cover select-none pointer-events-none opacity-80" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 via-transparent to-black/30"></div>
        
        {/* Top Badges */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <span className="px-3 py-1.5 bg-black/80 backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg border border-white/10">
            {article.category}
          </span>
          <span suppressHydrationWarning className="px-3 py-1.5 bg-black/80 backdrop-blur text-gray-100 text-[10px] font-bold rounded-full shadow-lg border border-white/10">
            {new Date(article.publication_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-32 hide-scrollbar relative z-10 -mt-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight tracking-tight">
          {analysis.short_headline || article.title}
        </h2>
        
        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 mb-8 uppercase tracking-widest">
          {article.source?.name}
        </p>

        {editorialComment && (
          <div className="flex items-start gap-4 mb-8 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <CartoonMascot state="thinking" size={40} className="shrink-0" />
            <div>
              <p className="text-sm font-bold text-blue-700 dark:text-blue-400">Analysis</p>
              <p className="text-sm text-blue-900 dark:text-blue-300 italic">"{editorialComment}"</p>
            </div>
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-[16px] sm:text-[17px] leading-relaxed mb-8 text-gray-700 dark:text-gray-300 font-medium">
            {analysis.detailed_summary}
          </p>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-800">
            <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Why it matters
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed m-0 font-medium">
              {analysis.why_it_matters}
            </p>
          </div>
        </div>

        <a 
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-500 font-bold transition mx-auto"
        >
          Read full article <ExternalLink size={16} />
        </a>
      </div>
    </motion.div>
  );
});

SwipeCard.displayName = 'SwipeCard';
export default SwipeCard;
