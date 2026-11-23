"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import CartoonMascot from "@/components/CartoonMascot";

const DEFAULT_IMAGES = [
  { 
    src: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600", 
    alt: "Reasoning & Inference", 
    category: "Models",
    title: "Speculative Decoding at Hyperscale" 
  },
  { 
    src: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=600", 
    alt: "Mathematical Proofs", 
    category: "Breakthroughs",
    title: "Neuro-Symbolic Geometry Engines" 
  },
  { 
    src: "https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&q=80&w=600", 
    alt: "Edge Architecture", 
    category: "Hardware",
    title: "Linear Attention on Silicon" 
  },
  { 
    src: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=600", 
    alt: "Mechanistic Interpretability", 
    category: "Safety",
    title: "Sparse Autoencoder Circuits" 
  },
  { 
    src: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600", 
    alt: "Agent Swarms", 
    category: "Agents",
    title: "Role-Sharded Code Orchestration" 
  },
  { 
    src: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600", 
    alt: "Frontier Weights", 
    category: "Open Weights",
    title: "High-Throughput Open Models" 
  },
];

// Dynamically generate orbit positions that stay cleanly below/flanking the typography
const generateOrbitCards = (items: typeof DEFAULT_IMAGES) => {
  const radiusX = 40; // Horizontal spread (vw)
  const radiusY = 14; // Flattened depth spread (vh)
  const total = items.length;

  return items.map((item, i) => {
    const angle = (i * (Math.PI * 2)) / total;
    
    // Ellipse coordinates centered below the text
    const x = Math.cos(angle - Math.PI / 2) * radiusX;
    const y = Math.sin(angle - Math.PI / 2) * radiusY;
    
    // Depth scaling
    const depthScale = Math.sin(angle - Math.PI / 2);
    const targetScale = 0.85 + (depthScale * 0.2); // 0.65 to 1.05

    // Z-Index for natural overlapping
    const calculatedZIndex = Math.round((depthScale + 1) * 100);
    const rotate = Math.cos(angle - Math.PI / 2) * 10;

    // Initial resting positions (gracefully fanned out in lower quadrant at progress=0)
    const initialSpreadX = (i - (total - 1) / 2) * 12; // -30vw to +30vw
    const initialSpreadY = Math.abs(i - (total - 1) / 2) * 1.5;

    return {
      item,
      // Initial resting fanned deck below the text
      linearOffset: { x: initialSpreadX, y: initialSpreadY + 24 },
      linearRotate: (i - (total - 1) / 2) * 3,
      // Target active orbit positions when scrolling
      target: { 
        x, 
        y: y + 25, // Safely pushed 25vh down so it NEVER collides with the headline
        rotate, 
        scale: targetScale, 
        w: 13, 
        h: 22 
      },
      targetSm: { 
        x: x * 0.75, 
        y: (y * 1.2) + 26, 
        rotate, 
        scale: targetScale, 
        w: 28, 
        h: 22 
      },
      z: calculatedZIndex,
    };
  });
};

const SPRING_CONFIG = { stiffness: 45, damping: 25, mass: 0.9 };
const PROGRESS_SPRING = { stiffness: 65, damping: 28, restDelta: 0.001 };

function usePointerParallax(active: boolean, enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  useEffect(() => {
    if (!enabled || !active) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [active, enabled, rawX, rawY]);

  return { x, y };
}

function Card({ card, progress, pointer, isMobile, onSelect }: any) {
  const { item, linearOffset, linearRotate, z } = card;
  const activeTarget = isMobile ? card.targetSm : card.target;
  const depthFactor = 0.15 + (z / 300);

  const translate = useTransform(
    [progress, pointer.x, pointer.y],
    ([p, px, py]: number[]) => {
      const easeP = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const tx = linearOffset.x + (activeTarget.x - linearOffset.x) * easeP;
      const ty = linearOffset.y + (activeTarget.y - linearOffset.y) * easeP;

      const dx = tx - px * 4 * depthFactor;
      const dy = ty - py * 4 * depthFactor;
      return `calc(-50% + ${dx}vw) calc(-50% + ${dy}vh)`;
    }
  );

  const rotate = useTransform(progress, [0, 1], [linearRotate, activeTarget.rotate]);
  const scale = useTransform(progress, [0, 1], [0.85, activeTarget.scale]);

  return (
    <motion.div
      onClick={onSelect}
      className="absolute left-1/2 top-1/2 will-change-transform cursor-pointer group select-none"
      style={{
        width: `${activeTarget.w}vw`,
        height: `${activeTarget.h}vh`,
        minWidth: isMobile ? 120 : 150,
        maxWidth: isMobile ? 180 : 220,
        minHeight: isMobile ? 160 : 200,
        maxHeight: isMobile ? 240 : 280,
        zIndex: z,
        translate,
        rotate,
        scale,
      }}
      whileHover={{ scale: 1.08, zIndex: 999, transition: { duration: 0.2 } }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-xl shadow-black/15 border border-white/20 dark:border-white/10 bg-sage-soft/10 backdrop-blur-md transition-all duration-300 group-hover:shadow-2xl group-hover:border-sage/50">
        <img
          src={item.src}
          alt={item.alt}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        
        {/* Clean, un-cluttered tag */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-mono font-bold tracking-wider uppercase border border-white/10">
            {item.category || "AI"}
          </span>
        </div>

        {/* Clean headline shown gracefully at bottom */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 pointer-events-none">
          <p className="text-white text-xs font-bold line-clamp-1 leading-tight drop-shadow-md group-hover:line-clamp-2 transition-all">
            {item.title}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function CinematicOrbitHero({
  onStartReading,
  articles = [],
}: {
  onStartReading?: () => void;
  articles?: any[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  // Map real articles into the orbit cards
  const items = DEFAULT_IMAGES.map((img, i) => {
    if (articles[i]) {
      const art = articles[i];
      const analysis = Array.isArray(art.analysis) ? art.analysis[0] : art.analysis;
      return {
        src: art.image_url || img.src,
        alt: art.title || img.alt,
        category: art.category || img.category,
        title: analysis?.short_headline || art.title || img.title,
      };
    }
    return img;
  });

  const cards = generateOrbitCards(items);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, PROGRESS_SPRING);
  const progress = useTransform(smoothProgress, [0.05, 0.85], [0, 1]);

  const [spread, setSpread] = useState(false);
  useMotionValueEvent(progress, "change", (p) => setSpread(p > 0.1));

  const pointer = usePointerParallax(spread, !reduce);

  return (
    <section ref={wrapRef} className="relative w-full h-[175vh] bg-background text-foreground transition-colors duration-500">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col items-center justify-start pt-14 md:pt-18">
        
        {/* Ambient atmospheric aura */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] md:w-[45vw] h-[35vw] rounded-full bg-sage/20 blur-[110px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

        {/* Clean, Spacious Editorial Headlines */}
        <div className="relative z-30 flex flex-col items-center text-center px-4 max-w-4xl mx-auto pointer-events-auto">
          
          {/* Top pill with cute animated mascot */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-sage-soft/30 dark:bg-white/10 backdrop-blur-xl border border-sage/30 text-foreground text-xs font-mono font-bold tracking-widest uppercase mb-5 shadow-sm">
            <CartoonMascot state="reading" size={26} className="shrink-0 -my-1" />
            <span className="text-sage font-extrabold flex items-center gap-1.5">
              <Sparkles size={12} /> Today's Intelligence Brief
            </span>
          </div>

          {/* Crisp, Bold Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-foreground">
            Daily Intelligence.<br />
            <span className="text-sage">Curated by AI.</span>
          </h1>

          {/* Clean Subtitle */}
          <p className="mt-4 max-w-[56ch] text-sm md:text-base font-medium text-text-secondary leading-relaxed">
            The decisive breakthroughs, research papers, and industrial shifts in artificial intelligence—synthesized without noise.
          </p>

          {/* Action CTAs */}
          {onStartReading && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={onStartReading}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-foreground text-background font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <BookOpen size={16} className="text-sage" />
                <span>Start Reading (3 min)</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Orbit 3D Cards - Stage positioned cleanly in lower view */}
        <div className="absolute inset-0 z-10 pointer-events-auto overflow-hidden">
          {cards.map((card, i) => (
            <Card 
              key={i} 
              card={card} 
              progress={progress} 
              pointer={pointer} 
              isMobile={isMobile}
              onSelect={onStartReading}
            />
          ))}
        </div>

        {/* Scroll hint indicator */}
        <div className="absolute bottom-4 z-20 flex flex-col items-center gap-1.5 pointer-events-none opacity-50">
          <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted">Scroll to orbit</span>
          <div className="w-1 h-3.5 rounded-full bg-sage/50 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
