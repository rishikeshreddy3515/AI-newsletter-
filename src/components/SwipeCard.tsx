'use client';

import { motion, useMotionValue, useTransform, PanInfo, animate } from 'framer-motion';
import { useImperativeHandle, forwardRef, useState } from 'react';
import { ExternalLink, Check, BookmarkPlus } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  url: string;
  source: { name: string };
  publication_date: string;
  category: string;
  image_url?: string;
  description?: string;
  analysis: any[];
}

export interface SwipeCardHandle {
  swipe: (dir: 'left' | 'right') => Promise<void>;
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800&h=1200", // abstract ai
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800&h=1200", // tech glass
  "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800&h=1200", // neural network
  "https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&q=80&w=800&h=1200", // abstract glass
  "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=800&h=1200", // abstract data
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800&h=1200", // cyber
];

const getFallbackImage = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length];
};

const SwipeCard = forwardRef<SwipeCardHandle, { 
  article: Article; 
  onSwipe: (dir: 'left' | 'right') => void;
  isActive: boolean;
  index: number;
}>(({ article, onSwipe, isActive, index }, ref) => {
  const x = useMotionValue(0);
  const [isExiting, setIsExiting] = useState(false);
  
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const dragScale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  const readOpacity = useTransform(x, [0, 150], [0, 1]);
  const readLaterOpacity = useTransform(x, [0, -150], [0, 1]);

  const handleSwipeAction = async (dir: 'left' | 'right') => {
    if (isExiting) return;
    setIsExiting(true);

    const targetX = dir === 'right' ? window.innerWidth : -window.innerWidth;
    
    // Animate the motion value directly so opacity and rotation transforms react
    await animate(x, targetX, { type: 'spring', stiffness: 200, damping: 20 });
    
    onSwipe(dir);
  };

  useImperativeHandle(ref, () => ({
    swipe: handleSwipeAction
  }));

  const dragProps = isActive && !isExiting ? {
    drag: "x" as const,
    dragConstraints: { left: 0, right: 0 },
    dragDirectionLock: true,
    dragElastic: 1,
    onDragEnd: async (e: any, info: PanInfo) => {
      const threshold = 120;
      if (info.offset.x > threshold || info.velocity.x > 500) {
        await handleSwipeAction('right');
      } else if (info.offset.x < -threshold || info.velocity.x < -500) {
        await handleSwipeAction('left');
      } else {
        animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 });
      }
    }
  } : {};

  // Dribbble deck stagger calculations
  const baseY = index * 20;
  const baseScale = Math.max(0, 1 - index * 0.05);
  const baseOpacity = isActive ? 1 : Math.max(0, 1 - index * 0.2);
  
  const imageUrl = article.image_url || getFallbackImage(article.id);
  const analysis = Array.isArray(article.analysis) ? article.analysis[0] : article.analysis;

  return (
    <motion.div
      {...dragProps}
      layout
      initial={{ y: baseY + 50, opacity: 0 }}
      animate={{ y: baseY, opacity: baseOpacity, scale: baseScale }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        x,
        rotate,
        zIndex: 50 - index,
        pointerEvents: isActive && !isExiting ? 'auto' : 'none',
      }}
      className="absolute inset-0 w-full h-full max-h-[700px] bg-background rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-white/5 flex flex-col"
    >
      <motion.div style={{ opacity: readOpacity }} className="absolute inset-0 z-50 pointer-events-none bg-sage/20 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-sage text-background rounded-full p-8 shadow-2xl scale-150">
          <Check size={56} strokeWidth={4} />
        </div>
      </motion.div>
      
      <motion.div style={{ opacity: readLaterOpacity }} className="absolute inset-0 z-50 pointer-events-none bg-gold/20 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-gold text-background rounded-full p-8 shadow-2xl scale-150">
          <BookmarkPlus size={56} strokeWidth={4} />
        </div>
      </motion.div>

      <div className="relative w-full h-full bg-sage-soft/10">
        <img src={imageUrl} alt="Article visual" className="w-full h-full object-cover select-none pointer-events-none" />
        
        {/* DESKTOP LAYOUT (Minimal Text) */}
        <div className="hidden lg:block pointer-events-none">
          {/* Desktop background gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>
          
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
            <span className="px-4 py-2 bg-black/50 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg border border-white/10">
              {article.category}
            </span>
            <span suppressHydrationWarning className="px-4 py-2 bg-black/50 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-lg border border-white/10 font-mono">
              {new Date(article.publication_date).toLocaleDateString()}
            </span>
          </div>
          <div className="absolute bottom-8 left-8 right-8 z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg line-clamp-3">
              {analysis?.short_headline || article.title}
            </h2>
            <p className="text-sm font-bold text-white/70 mt-4 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sage"></span>
              {article.source?.name}
            </p>
          </div>
        </div>

        {/* MOBILE LAYOUT (Immersive Full Text) */}
        
        {/* Fixed Mobile Gradient */}
        <div className="block lg:hidden absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-0"></div>

        {/* Scrolling Content Container */}
        <div 
          className="block lg:hidden absolute inset-x-0 bottom-0 top-[50%] z-10 flex flex-col overflow-y-auto hide-scrollbar touch-pan-y"
          style={{ 
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)', 
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)' 
          }}
          onPointerDown={(e) => e.stopPropagation()} // Prevent vertical scroll from triggering horizontal swipe
        >
          <div className="mt-auto p-6 pt-2 flex flex-col">
            <span className="px-3 py-1 bg-sage/90 backdrop-blur-md text-background text-[10px] font-black uppercase tracking-widest rounded-full w-fit mb-4 shadow-lg">
              {article.category}
            </span>
            <h2 className="text-2xl font-extrabold text-white leading-snug tracking-tight drop-shadow-lg mb-3">
              {analysis?.short_headline || article.title}
            </h2>
            
            <p className="text-sm font-medium text-white/80 leading-relaxed mb-6 drop-shadow-md">
              {analysis?.detailed_summary || article.description}
            </p>
            
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2 w-full py-3.5 mb-6 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-colors font-bold text-sm uppercase tracking-widest border border-white/10 shadow-xl"
            >
              Read Full Article <ExternalLink size={16} />
            </a>

            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <span className="text-[11px] font-bold text-sage uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                {article.source?.name}
              </span>
              <span suppressHydrationWarning className="text-[11px] font-mono font-medium text-white/50">
                {new Date(article.publication_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

SwipeCard.displayName = 'SwipeCard';
export default SwipeCard;
