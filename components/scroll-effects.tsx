'use client';

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Fixed top neon progress line driven by scroll position on the landing page.
 */
export function ScrollProgressBeam() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 inset-x-0 z-[60] h-[3px] bg-white/[0.04]"
    >
      <motion.div
        style={{ scaleX, transformOrigin: 'left center' }}
        className="h-full w-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 shadow-[0_0_14px_rgba(0,240,255,0.8)]"
      />
    </div>
  );
}

/**
 * Expanding glowing horizon line between landing page sections.
 */
export function SectionTransitionBeam({
  accent = 'cyan',
}: {
  accent?: 'cyan' | 'purple' | 'amber';
}) {
  const lineGradient =
    accent === 'amber'
      ? 'from-transparent via-amber-400/70 to-transparent'
      : accent === 'purple'
        ? 'from-transparent via-fuchsia-500/70 to-transparent'
        : 'from-transparent via-cyan-400/70 to-transparent';

  const orbColor =
    accent === 'amber'
      ? 'bg-amber-300 shadow-[0_0_18px_4px_rgba(251,191,36,0.7)]'
      : accent === 'purple'
        ? 'bg-fuchsia-400 shadow-[0_0_18px_4px_rgba(217,70,239,0.7)]'
        : 'bg-cyan-300 shadow-[0_0_18px_4px_rgba(34,211,238,0.7)]';

  return (
    <div
      aria-hidden="true"
      className="relative max-w-6xl mx-auto px-6 h-px flex items-center justify-center overflow-visible"
    >
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.85, ease: EASE_OUT_EXPO }}
        className={`h-[1.5px] w-full bg-gradient-to-r ${lineGradient}`}
      />
      <motion.span
        initial={{ scale: 0, opacity: 0, rotate: 45 }}
        whileInView={{ scale: 1, opacity: 1, rotate: 45 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT_EXPO }}
        className={`absolute w-2 h-2 rounded-[2px] ${orbColor}`}
      />
    </div>
  );
}

/**
 * Reusable scroll-triggered reveal wrapper for section blocks and headings.
 */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'scale';
}) {
  const initial =
    direction === 'left'
      ? { opacity: 0, x: -28 }
      : direction === 'right'
        ? { opacity: 0, x: 28 }
        : direction === 'scale'
          ? { opacity: 0, y: 24, scale: 0.96 }
          : { opacity: 0, y: 28 };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.62, delay, ease: EASE_OUT_EXPO }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
