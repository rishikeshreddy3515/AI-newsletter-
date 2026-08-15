'use client';

import { motion, useAnimation, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useImperativeHandle, forwardRef } from 'react';
import { ExternalLink, Check, BookmarkPlus } from 'lucide-react';

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
  
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const opacity = useTransform(x, [-300, 0, 300], [0.5, 1, 0.5]);
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

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
      const threshold = 120;
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
      className="absolute inset-0 w-full h-full bg-background rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-sage/20 flex flex-col touch-pan-y"
    >
      <motion.div style={{ opacity: readOpacity }} className="absolute inset-0 z-50 pointer-events-none bg-sage/10 flex items-center justify-center">
        <div className="bg-sage text-background rounded-full p-6 shadow-2xl scale-150">
          <Check size={48} strokeWidth={3} />
        </div>
      </motion.div>
      
      <motion.div style={{ opacity: readLaterOpacity }} className="absolute inset-0 z-50 pointer-events-none bg-gold/10 flex items-center justify-center">
        <div className="bg-gold text-background rounded-full p-6 shadow-2xl scale-150">
          <BookmarkPlus size={48} strokeWidth={3} />
        </div>
      </motion.div>

      <div className="relative h-48 sm:h-56 shrink-0 bg-sage-soft/30 overflow-hidden">
        {article.image_url ? (
          <img src={article.image_url} alt="Article visual" className="w-full h-full object-cover select-none pointer-events-none" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sage font-mono text-sm uppercase tracking-widest bg-sage-soft/20">
            Editorial Piece
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/20"></div>
        
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <span className="px-3 py-1.5 bg-foreground/90 backdrop-blur text-background text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg border border-background/20">
            {article.category}
          </span>
          <span suppressHydrationWarning className="px-3 py-1.5 bg-foreground/90 backdrop-blur text-background text-[10px] font-bold rounded-full shadow-lg border border-background/20 font-mono">
            {new Date(article.publication_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-32 hide-scrollbar relative z-10 -mt-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4 leading-tight tracking-tight">
          {analysis.short_headline || article.title}
        </h2>
        
        <p className="text-xs font-bold text-text-muted mb-8 uppercase tracking-widest">
          Source: {article.source?.name}
        </p>

        {editorialComment && (
          <div className="flex items-start gap-4 mb-8 bg-sage-soft/10 p-5 rounded-2xl border border-sage/20">
            <div>
              <p className="text-xs font-mono font-bold text-sage mb-2 uppercase tracking-wider">AI Insight</p>
              <p className="text-[15px] text-text-secondary italic">"{editorialComment}"</p>
            </div>
          </div>
        )}

        <div className="prose max-w-none">
          <p className="text-[16px] sm:text-[17px] leading-relaxed mb-8 text-foreground font-medium">
            {analysis.detailed_summary}
          </p>

          <div className="bg-sage-soft/10 rounded-2xl p-6 mb-8 border border-sage/10">
            <h3 className="text-xs font-black text-foreground mb-3 uppercase tracking-widest flex items-center gap-2 font-mono">
              <span className="w-2 h-2 bg-gold rounded-full"></span>
              Why it matters
            </h3>
            <p className="text-text-secondary text-[15px] leading-relaxed m-0">
              {analysis.why_it_matters}
            </p>
          </div>
        </div>

        <a 
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sage hover:text-sage-soft font-bold transition mx-auto mb-8 font-mono text-sm uppercase tracking-wider"
        >
          Read full source <ExternalLink size={16} />
        </a>
      </div>
    </motion.div>
  );
});

SwipeCard.displayName = 'SwipeCard';
export default SwipeCard;
