'use client';

import React, { useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'sage' | 'gold' | 'soft-sage';
  size?: 'sm' | 'md' | 'lg' | 'full';
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
}

// Adapted to Newsletter palette (HSL approximate representations)
// Sage: #8FA28A -> H:105, S:13%, L:59%
// Gold: #C8A96B -> H:40, S:46%, L:60%
// Soft Sage: #C7D3C0 -> H:98, S:18%, L:79%
const glowColorMap = {
  sage: { hue: 105, saturation: 13, lightness: 59 },
  gold: { hue: 40, saturation: 46, lightness: 60 },
  'soft-sage': { hue: 98, saturation: 18, lightness: 79 }
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96',
  full: 'w-full h-full'
};

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = 'sage',
  size = 'md',
  width,
  height,
  customSize = false
}) => {

  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      const { clientX: x, clientY: y } = e;
      if (cardRef.current) {
        cardRef.current.style.setProperty('--x', x.toFixed(2));
        cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty('--y', y.toFixed(2));
        cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2));
      }
    };
    document.addEventListener('pointermove', syncPointer);
    return () => {
      document.removeEventListener('pointermove', syncPointer);
    };
  }, []);

  const { hue, saturation, lightness } = glowColorMap[glowColor];

  const getSizeClasses = () => {
    if (customSize) return '';
    return sizeMap[size];
  };

  const getInlineStyles = () => {
    const baseStyles: any = {
      '--hue': hue,
      '--saturation': saturation,
      '--lightness': lightness,
      '--radius': '24', // Rounder corners for newsletter feel
      '--border': '1.5',
      '--backdrop': 'transparent', // using tailwind bg instead
      '--backup-border': 'rgba(199,211,192,0.3)', // Sage soft 30%
      '--size': '300', // Larger softer spotlight
      '--outer': '1',
      '--border-size': 'calc(var(--border, 1.5) * 1px)',
      '--spotlight-size': 'calc(var(--size, 300) * 1px)',

      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(
          var(--hue)
          calc(var(--saturation) * 1%)
          calc(var(--lightness) * 1%) /
          0.15
        ),
        transparent
      )`,
      backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
      backgroundPosition: '50% 50%',
      backgroundAttachment: 'fixed',
      border: 'var(--border-size) solid var(--backup-border)',
      position: 'relative',
      touchAction: 'none',
    };

    if (width !== undefined) {
      baseStyles.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === 'number' ? `${height}px` : height;
    }

    return baseStyles;
  };

  const beforeAfterStyles = `
    [data-glow-${glowColor}]::before,
    [data-glow-${glowColor}]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-attachment: fixed;
      background-size:
        calc(100% + (2 * var(--border-size)))
        calc(100% + (2 * var(--border-size)));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      mask: linear-gradient(transparent, transparent),
            linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
    }

    [data-glow-${glowColor}]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 1)
        calc(var(--spotlight-size) * 1) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(
          var(--hue)
          calc(var(--saturation) * 1%)
          calc(var(--lightness) * 1%) /
          0.8
        ),
        transparent 100%
      );
      filter: brightness(1.2);
    }

    [data-glow-${glowColor}] [data-glow-inner] {
      position: absolute;
      inset: 0;
      will-change: filter;
      opacity: var(--outer, 1);
      border-radius: calc(var(--radius) * 1px);
      border-width: calc(var(--border-size) * 10);
      filter: blur(calc(var(--border-size) * 5));
      background: none;
      pointer-events: none;
      border: none;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        {...{[`data-glow-${glowColor}`]: true}}
        style={getInlineStyles()}
        className={cn(
          getSizeClasses(),
          "rounded-[24px] relative grid p-8 gap-4 overflow-hidden shadow-sm bg-white/50 dark:bg-black/20 backdrop-blur-md",
          className
        )}
      >
        <div ref={innerRef} data-glow-inner />
        <div className="relative z-10 h-full w-full">{children}</div>
      </div>
    </>
  );
};

export { GlowCard };
