'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Timer, CreditCard, QrCode, Check, Gamepad2, Car } from 'lucide-react';

/* ---------- Step 1: calendar picker illustration ---------- */
function CalendarVisual() {
  const [active, setActive] = useState(10);
  useEffect(() => {
    const cells = [9, 10, 11, 16, 17, 18];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % cells.length;
      setActive(cells[i]);
    }, 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 21 }).map((_, i) => (
          <motion.div
            key={i}
            animate={
              i === active
                ? { scale: 1.25, backgroundColor: '#22d3ee', boxShadow: '0 0 14px rgba(34,211,238,0.9)' }
                : { scale: 1, backgroundColor: 'rgba(255,255,255,0.12)', boxShadow: '0 0 0 rgba(0,0,0,0)' }
            }
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="w-3.5 h-3.5 rounded-[4px]"
          />
        ))}
      </div>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-1 right-1 flex items-center gap-1 text-[10px] font-bold text-fuchsia-200 bg-fuchsia-500/20 border border-fuchsia-400/40 px-2 py-0.5 rounded-full"
      >
        <Gamepad2 className="w-3 h-3" /> VR
      </motion.div>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-1 left-1 flex items-center gap-1 text-[10px] font-bold text-amber-200 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded-full"
      >
        <Car className="w-3 h-3" /> Bumper
      </motion.div>
    </div>
  );
}

/* ---------- Step 2: 15-minute countdown ring ---------- */
function HoldVisual() {
  const [secs, setSecs] = useState(15 * 60);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s <= 1 ? 15 * 60 : s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  const progress = secs / (15 * 60);
  const R = 42;
  const C = 2 * Math.PI * R;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
        className="absolute w-24 h-24 rounded-full border border-fuchsia-400/50"
      />
      <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
        <defs>
          <linearGradient id="holdGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e879f9" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="url(#holdGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 6px rgba(232,121,249,0.7))' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <Timer className="w-3.5 h-3.5 text-fuchsia-300 mb-0.5" />
        <span className="font-mono text-lg font-black text-white tabular-nums">
          {mm}:{ss}
        </span>
      </div>
    </div>
  );
}

/* ---------- Step 3: payment card + success tick ---------- */
function PaymentVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        animate={{ rotate: [-4, 3, -4], y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-36 h-[88px] rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-amber-500 p-3 shadow-[0_10px_30px_-8px_rgba(217,70,239,0.7)] overflow-hidden"
      >
        <div className="w-7 h-5 rounded-[4px] bg-amber-200/90" />
        <div className="mt-3 flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-1.5 flex-1 rounded-full bg-white/50" />
          ))}
        </div>
        <CreditCard className="absolute right-2.5 top-2.5 w-4 h-4 text-white/80" />
        <motion.div
          animate={{ x: ['-120%', '220%'] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
          className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
        />
      </motion.div>
      <motion.div
        animate={{ scale: [0, 1.15, 1, 1, 0], opacity: [0, 1, 1, 1, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.15, 0.25, 0.8, 1] }}
        className="absolute bottom-0 right-3 w-9 h-9 rounded-full bg-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.8)]"
      >
        <Check className="w-5 h-5 text-slate-900" strokeWidth={3.5} />
      </motion.div>
    </div>
  );
}

/* ---------- Step 4: QR scanner ---------- */
const QR_PATTERN = [
  '1111101',
  '1000101',
  '1011101',
  '0001000',
  '1110111',
  '0100001',
  '1010111',
];

function QrVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative p-2.5 rounded-xl bg-white/95 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
        <div className="grid grid-cols-7 gap-[3px]">
          {QR_PATTERN.flatMap((row, r) =>
            row.split('').map((c, i) => (
              <motion.div
                key={`${r}-${i}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (r + i) * 0.04 }}
                className={`w-3.5 h-3.5 rounded-[2px] ${c === '1' ? 'bg-slate-900' : 'bg-slate-200'}`}
              />
            ))
          )}
        </div>
        {/* scanning laser */}
        <motion.div
          animate={{ top: ['6%', '90%', '6%'] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-1 right-1 h-[3px] rounded-full bg-cyan-400 shadow-[0_0_12px_3px_rgba(34,211,238,0.9)]"
        />
      </div>
      <QrCode className="absolute -top-0.5 left-2 w-4 h-4 text-cyan-300/80" />
      <motion.div
        animate={{ scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -bottom-0.5 right-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 rounded-full"
      >
        ✓ Admitted
      </motion.div>
    </div>
  );
}

const STEPS = [
  {
    step: '01',
    icon: CalendarDays,
    title: 'Pick Date & Experiences',
    desc: 'Choose General Admission, timed sessions (VR, Bumper Cars, Trampolines), or multi-play arcade packs.',
    accent: 'from-cyan-400 to-sky-500',
    glow: 'rgba(34,211,238,0.35)',
    Visual: CalendarVisual,
  },
  {
    step: '02',
    icon: Timer,
    title: '15-Minute Capacity Hold',
    desc: 'Our engine locks your exact slots in real time so your group is guaranteed never to be overbooked.',
    accent: 'from-fuchsia-400 to-violet-500',
    glow: 'rgba(217,70,239,0.35)',
    Visual: HoldVisual,
  },
  {
    step: '03',
    icon: CreditCard,
    title: 'Instant Online Payment',
    desc: 'Pay securely via Paystack or reserve at our walk-in POS counter in Victoria Island.',
    accent: 'from-amber-300 to-orange-500',
    glow: 'rgba(251,146,60,0.35)',
    Visual: PaymentVisual,
  },
  {
    step: '04',
    icon: QrCode,
    title: 'Scan QR Pass at Gate',
    desc: 'Receive cryptographic QR passes immediately. Arrive together or check in partially as friends arrive!',
    accent: 'from-emerald-300 to-cyan-400',
    glow: 'rgba(52,211,153,0.35)',
    Visual: QrVisual,
  },
];

export function BookingSteps() {
  return (
    <section className="relative py-14 sm:py-20 bg-white/[0.02] border-y border-white/[0.07] overflow-hidden">
      {/* ambient glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-10 w-72 h-72 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-0 w-72 h-72 rounded-full bg-fuchsia-500/10 blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-oasis-cyan">
            <span className="w-6 h-px bg-oasis-cyan/60" />
            Simple 4-Step Flow
            <span className="w-6 h-px bg-oasis-cyan/60" />
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-2">
            How Booking at Oasis Works
          </h2>
        </motion.div>

        <div className="relative">
          {/* Desktop connector line with traveling spark */}
          <div aria-hidden="true" className="hidden lg:block absolute top-[34px] left-[12.5%] right-[12.5%] h-[2px]">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              style={{ transformOrigin: 'left' }}
              className="h-full w-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 via-60% to-emerald-400 opacity-60 rounded-full"
            />
            <motion.div
              animate={{ left: ['0%', '100%'] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', delay: 1.4 }}
              className="absolute -top-[3px] w-2 h-2 -ml-1 rounded-full bg-white shadow-[0_0_14px_4px_rgba(255,255,255,0.8)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: idx * 0.15, ease: 'easeOut' }}
                  whileHover={{ y: -6 }}
                  className="group relative flex flex-row sm:flex-col gap-4 sm:gap-0"
                >
                  {/* mobile vertical timeline connector */}
                  {idx < STEPS.length - 1 && (
                    <motion.span
                      aria-hidden="true"
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.4 + idx * 0.15 }}
                      style={{ transformOrigin: 'top' }}
                      className="sm:hidden absolute left-6 -ml-px top-12 -bottom-5 w-[2px] rounded-full bg-gradient-to-b from-white/40 to-white/5"
                    />
                  )}

                  {/* step badge: left rail on mobile, floating on top from sm up */}
                  <div className="relative z-10 flex shrink-0 sm:shrink sm:justify-center sm:-mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.3 + idx * 0.15 }}
                      className={`relative w-12 h-12 sm:w-[68px] sm:h-[68px] rounded-full bg-gradient-to-br ${s.accent} p-[2px]`}
                      style={{ boxShadow: `0 0 28px ${s.glow}` }}
                    >
                      <motion.span
                        aria-hidden="true"
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: idx * 0.4 }}
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${s.accent}`}
                      />
                      <div className="relative w-full h-full rounded-full bg-[#0b1026] flex items-center justify-center">
                        <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                      </div>
                    </motion.div>
                  </div>

                  <div className="relative flex-1 min-w-0 pt-4 sm:pt-10 pb-5 sm:pb-6 px-4 sm:px-5 rounded-2xl bg-[#0d1230]/90 border border-white/10 group-hover:border-white/25 backdrop-blur-xl overflow-hidden transition-colors duration-300"
                    style={{ boxShadow: `0 20px 40px -24px ${s.glow}` }}
                  >
                    {/* big ghost number */}
                    <span
                      aria-hidden="true"
                      className={`absolute -top-1 right-2 text-5xl sm:text-7xl font-black bg-gradient-to-br ${s.accent} bg-clip-text text-transparent opacity-[0.12] group-hover:opacity-25 transition-opacity select-none`}
                    >
                      {s.step}
                    </span>

                    {/* animated illustration */}
                    <div className="relative h-32 mb-4 rounded-xl [&>div:last-child]:scale-[0.92] sm:[&>div:last-child]:scale-100 bg-black/25 border border-white/5 overflow-hidden">
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `radial-gradient(circle at 50% 120%, ${s.glow}, transparent 70%)`,
                        }}
                      />
                      <s.Visual />
                    </div>

                    <div className={`text-xs font-black tracking-widest bg-gradient-to-r ${s.accent} bg-clip-text text-transparent mb-1`}>
                      STEP {s.step}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                    <p className="text-[13px] text-slate-300/90 sm:text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
