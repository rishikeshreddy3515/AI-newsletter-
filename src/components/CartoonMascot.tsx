'use client';

import { motion } from 'framer-motion';

interface CartoonMascotProps {
  state?: 'idle' | 'reading' | 'surprised' | 'thinking';
  className?: string;
  size?: number;
}

export default function CartoonMascot({ state = 'idle', className = '', size = 64 }: CartoonMascotProps) {
  // Define animation states for the mascot
  const variants = {
    idle: { y: [0, -5, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
    reading: { y: [0, 2, 0], x: [-1, 1, -1], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
    surprised: { y: -10, scale: 1.1, transition: { type: 'spring', stiffness: 300, damping: 10 } },
    thinking: { y: [0, -3, 0], rotate: [0, 5, -5, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }
  };

  const eyeVariants = {
    idle: { scaleY: [1, 1, 0.1, 1, 1], transition: { duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 0.98, 1] } }, // Blinking
    surprised: { scaleY: 1.5, scaleX: 1.2 },
    reading: { scaleY: 0.8, x: [0, 2, -2, 0], transition: { duration: 3, repeat: Infinity } },
    thinking: { scaleY: [1, 0.5, 1], transition: { duration: 2, repeat: Infinity } }
  };

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
      variants={variants}
      animate={state}
      initial="idle"
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        {/* Antenna */}
        <line x1="50" y1="25" x2="50" y2="10" stroke="currentColor" strokeWidth="3" className="text-gray-400 dark:text-gray-500" />
        <circle cx="50" cy="8" r="4" fill="currentColor" className="text-blue-500 dark:text-blue-400" />
        
        {/* Head/Body */}
        <rect x="25" y="25" width="50" height="45" rx="16" fill="currentColor" className="text-white dark:text-gray-800" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
        
        {/* Face Screen */}
        <rect x="32" y="32" width="36" height="24" rx="8" fill="currentColor" className="text-gray-900 dark:text-black" />
        
        {/* Eyes */}
        <motion.ellipse 
          cx="40" cy="44" rx="4" ry="6" 
          fill="currentColor" 
          className="text-blue-400 dark:text-blue-300"
          variants={eyeVariants}
          animate={state}
        />
        <motion.ellipse 
          cx="60" cy="44" rx="4" ry="6" 
          fill="currentColor" 
          className="text-blue-400 dark:text-blue-300"
          variants={eyeVariants}
          animate={state}
        />
      </svg>
    </motion.div>
  );
}
