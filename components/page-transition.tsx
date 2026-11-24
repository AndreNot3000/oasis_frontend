'use client';

import React from 'react';
import { motion, MotionConfig } from 'framer-motion';

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {/* Top neon route-change sweep bar */}
      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{
          scaleX: [0, 0.85, 1, 1],
          opacity: [1, 1, 0.9, 0],
        }}
        transition={{
          duration: 0.65,
          times: [0, 0.45, 0.72, 1],
          ease: EASE_OUT_EXPO,
        }}
        style={{ transformOrigin: 'left center' }}
        className="pointer-events-none fixed top-0 inset-x-0 z-[70] h-[2.5px] bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 shadow-[0_0_16px_rgba(34,211,238,0.85)]"
      />

      {/* Smooth page entrance */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.994 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.42, ease: EASE_OUT_EXPO }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
