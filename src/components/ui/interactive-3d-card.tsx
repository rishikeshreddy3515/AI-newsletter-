'use client';

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function Interactive3DCard({
  width = '100%',
  height = '400px',
  image = '',
  title = '',
  description = '',
  tags = [],
  actions = null,
  className = '',
  children = null
}: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('none');
  const [parallax, setParallax] = useState('none');
  const [isHovered, setIsHovered] = useState(false);

  // Responsive tilt threshold
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || isMobile) return;
    
    setIsHovered(true);
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;

    const rotateX = (y / (rect.height / 2)) * 10;
    const rotateY = -(x / (rect.width / 2)) * 10;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`);
    setParallax(`translateX(${x * 0.015}px) translateY(${y * 0.015}px)`);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform('none');
    setParallax('none');
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative rounded-3xl shadow-lg border border-sage/20 bg-background overflow-hidden mx-auto transition-shadow duration-500",
        isHovered ? "shadow-2xl shadow-sage/10" : "",
        className
      )}
      style={{
        width,
        height,
        transform,
        transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sage-soft/30 to-background/10 pointer-events-none z-0"></div>

      <div
        className="relative z-10 h-full flex flex-col"
        style={{
          transform: parallax,
          transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        {image && (
          <div className="h-[55%] relative overflow-hidden bg-sage-soft/20">
            <img
              src={image}
              alt={title || 'Featured Article'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
          </div>
        )}
        
        {/* If no image, create a visual placeholder using palette */}
        {!image && (
          <div className="h-[55%] relative overflow-hidden bg-sage-soft/20 flex flex-col items-center justify-center p-6 text-center">
             <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
             <span className="relative z-10 font-mono text-gold text-lg tracking-widest uppercase">Editorial Focus</span>
          </div>
        )}

        <div className="flex-1 flex flex-col p-6 lg:p-8 -mt-6">
          {title && (
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3 leading-tight text-foreground tracking-tight line-clamp-2">
              {title}
            </h2>
          )}

          {description && (
            <p className="text-text-secondary font-medium text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
              {description}
            </p>
          )}

          <div className="flex justify-between items-end mt-auto">
            {tags && tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] md:text-xs font-bold bg-sage-soft/40 text-sage px-3 py-1.5 rounded-full uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {actions && (
              <div className="shrink-0 ml-4">
                {actions}
              </div>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
