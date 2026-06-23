import type { Variants } from 'motion/react';

export const motionPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.25, ease: "easeOut" }
  },
  slideUp: {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 15 },
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } // Apple-like spring/ease
  },
  slideLeft: {
    initial: { opacity: 0, x: 15 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 15 },
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  },
  cardHover: {
    rest: { y: 0, scale: 1, boxShadow: "var(--shadow-sm)" },
    hover: { 
      y: -2, 
      scale: 1.01, 
      boxShadow: "var(--shadow-lg)",
      transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: { scale: 0.98 }
  },
  pageTransition: {
    initial: { opacity: 0, filter: "blur(4px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(4px)" },
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  staggerChildren: (staggerDelay = 0.05) => ({
    animate: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  }),
  bottomNavAnimation: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }
};
