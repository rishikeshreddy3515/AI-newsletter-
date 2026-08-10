import { Variants } from 'framer-motion';

// Global Easing for a smooth, premium feel (not too bouncy, not linear)
export const premiumEasing = [0.22, 1, 0.36, 1];

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: premiumEasing 
    } 
  }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1, 
    transition: { 
      duration: 0.8, 
      ease: premiumEasing 
    } 
  }
};

export const cardEnter: Variants = {
  hidden: { scale: 0.95, opacity: 0, y: 20 },
  show: { 
    scale: 1, 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 25 
    } 
  }
};

// Use this for page transitions to feel intentional but fast
export const pageTransition = {
  initial: { opacity: 0, filter: 'blur(4px)' },
  animate: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.4, ease: premiumEasing } },
  exit: { opacity: 0, filter: 'blur(4px)', transition: { duration: 0.3, ease: premiumEasing } }
};
