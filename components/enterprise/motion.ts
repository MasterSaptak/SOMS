// ============================================================
// SOMS Enterprise — Motion System
// Centralized Framer Motion presets for the entire application
// ============================================================

import type { Variants, Transition } from 'motion/react'

// ─── Container Variants ─── //

/** Stagger container — wraps children for sequential entrance */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

/** Fast stagger — for KPI rows and small card groups */
export const fastStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
}

// ─── Entrance Variants ─── //

/** Card entrance — spring-based fade + slide up */
export const cardEntrance: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 24,
    },
  },
}

/** Fade in — simple opacity */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
}

/** Slide in from left */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
}

/** Slide in from right */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
}

/** Slide in from bottom */
export const slideInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
}

/** Scale in from center */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
}

/** Chart reveal — delayed scale + fade for data visualizations */
export const chartReveal: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.2,
    },
  },
}

/** Page transition — for route-level animations */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
}

// ─── Interaction Presets (use with whileHover / whileTap) ─── //

/** Hover lift — subtle translateY + spring */
export const hoverLift = {
  y: -3,
  transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
}

/** Hover scale — subtle scale up */
export const hoverScale = {
  scale: 1.02,
  transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
}

/** Tap scale — press feedback */
export const tapScale = {
  scale: 0.97,
  transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
}

// ─── Transition Presets ─── //

/** Spring transition */
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 24,
}

/** Smooth ease-out transition */
export const smoothTransition: Transition = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
}

/** Fast transition */
export const fastTransition: Transition = {
  duration: 0.15,
  ease: [0.16, 1, 0.3, 1],
}

/** Slow transition — for large reveals */
export const slowTransition: Transition = {
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1],
}
