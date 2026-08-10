'use client';

import { motion, useAnimation, PanInfo } from 'framer-motion';
import { useState, useImperativeHandle, forwardRef } from 'react';
import { ExternalLink } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  url: string;
  source: { name: string };
  publication_date: string;
  category: string;
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
  const [exitX, setExitX] = useState(0);

  const handleSwipeAction = async (dir: 'left' | 'right') => {
    const targetX = dir === 'right' ? 1000 : -1000;
    setExitX(targetX);
    await controls.start({ x: targetX, opacity: 0, transition: { duration: 0.3 } });
    onSwipe(dir);
  };

  useImperativeHandle(ref, () => ({
    swipe: handleSwipeAction
  }));

  const dragProps = isActive ? {
    drag: "x" as const,
    dragConstraints: { left: 0, right: 0 },
    onDragEnd: async (e: any, info: PanInfo) => {
      const threshold = 100;
      if (info.offset.x > threshold) {
        await handleSwipeAction('right');
      } else if (info.offset.x < -threshold) {
        await handleSwipeAction('left');
      } else {
        controls.start({ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } });
      }
    }
  } : {};

  const analysis = Array.isArray(article.analysis) ? article.analysis[0] || {} : article.analysis || {};

  return (
    <motion.div
      {...dragProps}
      animate={controls}
      initial={false}
      style={{
        zIndex: isActive ? 10 : 0,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
      className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col"
    >
      <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar pb-24">
        <div className="flex items-center justify-between mb-6">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest rounded-full">
            {article.category}
          </span>
          <span suppressHydrationWarning className="text-xs text-gray-500 font-medium">
            {new Date(article.publication_date).toLocaleDateString()}
          </span>
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight tracking-tight">
          {analysis.short_headline || article.title}
        </h2>
        
        <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-8 uppercase tracking-wide">
          {article.source?.name}
        </p>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-[17px] leading-relaxed mb-8 text-gray-700 dark:text-gray-300">
            {analysis.detailed_summary}
          </p>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Why it matters
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed m-0">
              {analysis.why_it_matters}
            </p>
          </div>
        </div>

        <a 
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold transition mx-auto"
        >
          Read full article <ExternalLink size={16} />
        </a>
      </div>
    </motion.div>
  );
});

SwipeCard.displayName = 'SwipeCard';
export default SwipeCard;
