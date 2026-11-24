'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  Compass,
  ArrowRight,
  Ticket,
  Gift,
  Calendar,
  MapPin,
  HelpCircle,
  ChevronDown,
  Star,
  Users,
  CheckCircle2,
  Zap,
  Instagram,
  Send,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Hero3dCanvas } from '@/components/hero-3d-canvas';
import { CrumpleCardCarousel } from '@/components/crumple-card-carousel';
import { CarouselSkeleton } from '@/components/oasis-skeleton';
import { SocialLinks } from '@/components/social-links';
import { BookingSteps } from '@/components/booking-steps';
import { GuestReviews } from '@/components/guest-reviews';
import {
  ScrollProgressBeam,
  SectionTransitionBeam,
  ScrollReveal,
} from '@/components/scroll-effects';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const faqs = [
  {
    q: 'Do I need to book online in advance, or can I walk in?',
    a: 'Both! You can reserve your exact time slots online in under two minutes or purchase tickets physically at our Victoria Island counter. Online and walk-in tickets share the same real-time capacity pool, so booking online guarantees your spot on busy weekends.',
  },
  {
    q: 'How does the 15-minute checkout hold work?',
    a: 'As soon as you proceed to checkout, our booking engine locks your chosen time slots for 15 minutes so nobody else can take your spots while you complete payment.',
  },
  {
    q: 'What is the difference between Timed Sessions and Pay-Per-Play?',
    a: 'Timed Sessions (like Omni VR Arena, Bumper Cars, and Jungle Soft Play) reserve a specific time window. Pay-Per-Play attractions (like our 40+ machine Arcade Hall and Air Hockey) load digital play credits onto your pass that you tap and redeem at any game cabinet.',
  },
  {
    q: 'Can part of our group check in first if others are running late?',
    a: 'Yes! Our turnstile QR passes support partial group check-in. If you book for 6 visitors and 4 arrive first, our marshals admit the 4 guests while keeping the remaining 2 admissions active on your pass.',
  },
];


export default function HomePage() {
  const [attractions, setAttractions] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [operatingHours, setOperatingHours] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);
  const [spinBoost, setSpinBoost] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroBackdropY = useTransform(heroScroll, [0, 1], ['0%', '18%']);
  const heroTextY = useTransform(heroScroll, [0, 1], ['0%', '-14%']);
  const heroTextOpacity = useTransform(heroScroll, [0, 0.78], [1, 0]);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [attrData, pkgData, evData, hoursData] = await Promise.all([
          apiClient<any[]>('/attractions'),
          apiClient<any[]>('/packages'),
          apiClient<any[]>('/events'),
          apiClient<any[]>('/scheduling/operating-hours'),
        ]);
        setAttractions(attrData || []);
        setPackages(pkgData || []);
        setEvents(evData || []);
        setOperatingHours(hoursData || []);
      } catch {
        // Fallback if API is warming up
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-oasis-navy">
      <ScrollProgressBeam />
      <SiteHeader />

      <main className="flex-1">
        {/* 1-4. Full-Viewport Reference-Styled Hero with Interactive 3D Aerial Ride & Spheres */}
        <section
          ref={heroRef}
          className="relative overflow-hidden min-h-[90vh] flex flex-col justify-end md:flex-row md:items-end bg-[#040611]"
        >
          {/* Parallax wrapper for backdrop photo + 3D WebGL scene */}
          <motion.div style={{ y: heroBackdropY }} className="absolute inset-0">
            {/* Indoor Neon Amusement Park Backdrop Photo */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-45 scale-105"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=2000&q=85')",
              }}
            />

            {/* Neon Color Washes (Deep Starry Night Top Sky + Clean Left Negative Space + Ambient Right Glow) */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#03050e] via-[#040611]/90 via-45% to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E27] via-transparent to-[#02040a]/85" />
            <div className="absolute top-16 right-1/4 w-[420px] h-[220px] bg-emerald-400/12 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[480px] h-[480px] bg-fuchsia-600/15 rounded-full blur-[140px] pointer-events-none" />

            {/* Full-Bleed Three.js 3D WebGL Scene (3D Aerial Swing Ride + Photorealistic 3D Balloons + Starry Night Sky) */}
            <div
              onClick={() => setSpinBoost((prev) => !prev)}
              title="Click to toggle 3D ride speed"
              className="absolute inset-0 z-10 cursor-pointer"
            >
              <Hero3dCanvas spinBoost={spinBoost} />
            </div>
          </motion.div>

          {/* Mobile Bottom Stage Gradient (keeps the top 3D ride crystal clear while giving bottom text a clean dark stage) */}
          <div className="md:hidden absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#060919] via-[#060919]/95 via-65% to-transparent z-[15] pointer-events-none" />

          {/* Hero Typography & Dual Pill Buttons (Grounded Lower-Left on Desktop, Bottom-Docked on Mobile) */}
          <motion.div
            style={{ y: heroTextY, opacity: heroTextOpacity }}
            className="max-w-7xl w-full mx-auto px-5 sm:px-10 pt-64 pb-8 md:pt-52 md:pb-12 lg:pt-56 lg:pb-14 relative z-20 pointer-events-none"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.045, delayChildren: 0.1 },
                },
              }}
              className="max-w-xl md:max-w-2xl"
            >
              {/* Animated 3D Sculpted & Neon-Flow Headline */}
              <h1
                className="text-[2.15rem] sm:text-6xl lg:text-[4.35rem] font-black uppercase tracking-[0.04em] sm:tracking-[0.05em] leading-[1.06] select-none pointer-events-auto"
                style={{ perspective: '900px' }}
              >
                {/* Line 1: OASIS (3D Sculpted Metallic White + Interactive Letter Lift) */}
                <span className="block">
                  {'OASIS'.split('').map((char, i) => (
                    <motion.span
                      key={`oasis-${i}`}
                      variants={{
                        hidden: {
                          opacity: 0,
                          y: 36,
                          rotateX: -70,
                          filter: 'blur(8px)',
                        },
                        visible: {
                          opacity: 1,
                          y: 0,
                          rotateX: 0,
                          filter: 'blur(0px)',
                          transition: {
                            type: 'spring',
                            damping: 14,
                            stiffness: 180,
                          },
                        },
                      }}
                      whileHover={{
                        y: -8,
                        scale: 1.1,
                        color: '#00F0FF',
                        textShadow: '0 0 28px rgba(0,240,255,0.9)',
                      }}
                      className="inline-block oasis-title-3d-white cursor-default transition-colors"
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>

                {/* Line 2: AMUSEMENT (Flowing Liquid Neon Gradient + Breathing Aura) */}
                <span className="relative inline-block my-1">
                  <motion.span
                    variants={{
                      hidden: {
                        opacity: 0,
                        x: -28,
                        scale: 0.94,
                        filter: 'blur(10px)',
                      },
                      visible: {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        filter: 'blur(0px)',
                        transition: {
                          type: 'spring',
                          damping: 16,
                          stiffness: 140,
                          delay: 0.22,
                        },
                      },
                    }}
                    whileHover={{ scale: 1.03 }}
                    className="inline-block oasis-title-neon-flow cursor-default"
                  >
                    AMUSEMENT
                  </motion.span>
                  {/* Animated Laser Under-Glow Line */}
                  <motion.span
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.65, ease: 'easeOut' }}
                    className="block h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 shadow-[0_0_16px_rgba(0,240,255,0.8)]"
                  />
                </span>

                {/* Line 3: PARK (3D Sculpted Metallic White + Interactive Letter Lift) */}
                <span className="block">
                  {'PARK'.split('').map((char, i) => (
                    <motion.span
                      key={`park-${i}`}
                      variants={{
                        hidden: {
                          opacity: 0,
                          y: 36,
                          rotateX: -70,
                          filter: 'blur(8px)',
                        },
                        visible: {
                          opacity: 1,
                          y: 0,
                          rotateX: 0,
                          filter: 'blur(0px)',
                          transition: {
                            type: 'spring',
                            damping: 14,
                            stiffness: 180,
                          },
                        },
                      }}
                      whileHover={{
                        y: -8,
                        scale: 1.1,
                        color: '#FFB800',
                        textShadow: '0 0 28px rgba(255,184,0,0.9)',
                      }}
                      className="inline-block oasis-title-3d-white cursor-default transition-colors"
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              </h1>

              {/* Organized Subtitle Stack (Clean 2-Line Hierarchy on Mobile & Desktop) */}
              <motion.div
                initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.65, delay: 0.55 }}
                className="mt-4 sm:mt-6 space-y-2 max-w-lg pointer-events-auto"
              >
                <p className="text-base sm:text-2xl text-slate-100 font-medium leading-snug drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                  Experience{' '}
                  <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-300 to-fuchsia-300">
                    incredible attractions
                  </span>
                </p>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-cyan-400/35 backdrop-blur-md text-xs sm:text-sm font-semibold text-white/95 shadow-[0_0_20px_rgba(0,240,255,0.12)]">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fuchsia-400 flex-shrink-0 animate-bounce" />
                  <span>Plot 8, Lagere, Ile-Ife, Osun State</span>
                </div>
              </motion.div>

              {/* Signature Dual Pill CTAs (Balanced 2-Column Grid on Mobile, Inline Row on Desktop) */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.72 }}
                className="mt-6 sm:mt-9 grid grid-cols-2 sm:flex items-center gap-3 sm:gap-4 pointer-events-auto"
              >
                <Link
                  href="/book"
                  className="oasis-sheen-btn inline-flex items-center justify-center px-5 sm:px-10 py-3.5 rounded-full font-bold text-xs sm:text-sm tracking-wide text-white bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:from-[#6D28D9] hover:to-[#8B5CF6] shadow-[0_0_28px_rgba(124,58,237,0.65)] hover:shadow-[0_0_36px_rgba(0,240,255,0.6)] hover:scale-[1.03] active:scale-[0.98] transition-all text-center"
                >
                  Book Now
                </Link>

                <Link
                  href="#attractions"
                  className="inline-flex items-center justify-center px-5 sm:px-9 py-3.5 rounded-full font-semibold text-xs sm:text-sm tracking-wide text-white bg-black/55 hover:bg-amber-400/15 border border-amber-400/90 shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_28px_rgba(251,191,36,0.45)] backdrop-blur-sm hover:scale-[1.03] active:scale-[0.98] transition-all text-center"
                >
                  Our Attractions
                </Link>
              </motion.div>
            </motion.div>

            {/* Bottom-Left Social Icons (Instagram, TikTok, Facebook, WhatsApp) */}
            <div className="mt-6 md:mt-10 pointer-events-auto">
              <SocialLinks />
            </div>
          </motion.div>
        </section>

        {/* Rich Multi-Layer Neon Aurora Gradient Backdrop for All Post-Hero Sections */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#070B1E] via-[#0D0A2A] to-[#050816]">
          {/* Animated Ambient Neon Aurora Orbs & Subtle Grid */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="oasis-aurora-a absolute -top-24 -left-32 w-[620px] h-[620px] rounded-full bg-gradient-to-tr from-[#7C3AED]/28 via-[#FF2A85]/18 to-transparent blur-[130px]" />
            <div className="oasis-aurora-b absolute top-[18%] -right-32 w-[640px] h-[640px] rounded-full bg-gradient-to-bl from-[#00F0FF]/22 via-[#38BDF8]/14 to-transparent blur-[140px]" />
            <div className="oasis-aurora-a absolute top-[46%] left-1/4 w-[580px] h-[580px] rounded-full bg-gradient-to-tr from-[#FF2A85]/18 via-[#7C3AED]/20 to-transparent blur-[150px]" />
            <div className="oasis-aurora-b absolute top-[72%] -left-24 w-[560px] h-[560px] rounded-full bg-gradient-to-tr from-[#00F0FF]/18 via-[#10B981]/12 to-transparent blur-[140px]" />
            <div className="oasis-aurora-a absolute bottom-0 right-1/4 w-[620px] h-[520px] rounded-full bg-gradient-to-tl from-[#FFB800]/14 via-[#FF2A85]/15 to-transparent blur-[150px]" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)',
                backgroundSize: '72px 72px',
              }}
            />
          </div>

          <div className="relative z-10">
        <SectionTransitionBeam accent="cyan" />
        {/* 5 & 6. Explore Attractions & Featured Experiences */}
        <section id="attractions" className="py-20 bg-white/[0.015] border-y border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-oasis-coral">
                    Signature Experiences
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                    Explore Attractions &amp; Experiences
                  </h2>
                </div>
                <Link
                  href="/attractions"
                  className="mt-4 sm:mt-0 text-sm font-bold text-oasis-cyan hover:underline inline-flex items-center gap-1"
                >
                  Filter &amp; search all attractions <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="scale" delay={0.08}>
              {loading ? (
                <CarouselSkeleton />
              ) : (
                <CrumpleCardCarousel
                  items={attractions}
                  background="transparent"
                  imageY={0}
                  hold={3600}
                  crumple={100}
                  itemWidth={507}
                  itemHeight={400}
                  gap={-90}
                  radius={14}
                  dragSens={100}
                  direction="horizontal"
                  bounce={0}
                  hover={50}
                  speed={6}
                />
              )}
            </ScrollReveal>
          </div>
        </section>

        <SectionTransitionBeam accent="amber" />

        {/* 7. Packages and Offers */}
        <section id="packages" className="relative py-14 sm:py-20 overflow-hidden">
          {/* Ambient neon backdrop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="w-full max-w-[780px] h-[260px] sm:h-[340px] rounded-full bg-gradient-to-r from-fuchsia-600/15 via-cyan-500/10 to-amber-500/15 blur-[90px] sm:blur-[110px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-oasis-yellow">
                  <Sparkles className="w-3.5 h-3.5" /> Value Bundles
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-1">
                  All-In-One Park Packages
                </h2>
              </div>
              <Link
                href="/packages"
                className="text-sm font-bold text-oasis-cyan hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
              >
                Compare all packages <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
              {packages.map((pkg, idx) => {
                const isAlt = idx % 2 === 1;
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.5, delay: idx * 0.12 }}
                    whileHover={{ y: -6 }}
                    className={`group relative rounded-3xl p-[1.5px] transition-shadow duration-500 ${
                      isAlt
                        ? 'bg-gradient-to-br from-amber-400/50 via-fuchsia-500/40 to-cyan-400/50 hover:shadow-[0_20px_50px_-12px_rgba(245,158,11,0.35),0_0_30px_rgba(236,72,153,0.25)]'
                        : 'bg-gradient-to-br from-cyan-400/50 via-fuchsia-500/40 to-amber-400/50 hover:shadow-[0_20px_50px_-12px_rgba(6,182,212,0.35),0_0_30px_rgba(236,72,153,0.25)]'
                    }`}
                  >
                    <div className="relative h-full rounded-[22.5px] p-5 sm:p-7 bg-[#0b1026]/95 backdrop-blur-xl overflow-hidden flex flex-col sm:flex-row gap-5 sm:gap-6 items-stretch sm:items-center justify-between">
                      {/* Diagonal light sweep on hover */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -skew-x-12"
                      />

                      {/* Corner radial glow */}
                      <div
                        aria-hidden="true"
                        className={`pointer-events-none absolute -top-20 -right-20 w-44 sm:w-56 h-44 sm:h-56 rounded-full blur-3xl opacity-40 group-hover:opacity-80 transition-opacity duration-500 ${
                          isAlt ? 'bg-amber-500/25' : 'bg-cyan-500/25'
                        }`}
                      />

                      <div className="relative z-10 space-y-3 flex-1 min-w-0">
                        <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold text-oasis-yellow bg-oasis-yellow/10 px-3 py-1 rounded-full border border-oasis-yellow/30 shadow-[0_0_15px_rgba(250,204,21,0.15)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-oasis-yellow animate-pulse shrink-0" />
                          <Gift className="w-3.5 h-3.5 shrink-0" />
                          <span>Best Value Bundle</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-cyan-200 group-hover:to-amber-200 transition-all duration-300">
                          {pkg.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {pkg.description}
                        </p>
                        {pkg.items?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                            {pkg.items.map((it: any) => (
                              <span
                                key={it.id}
                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/[0.04] text-oasis-cyan px-2.5 py-1 rounded-lg border border-white/10 group-hover:border-oasis-cyan/35 transition-colors max-w-full"
                              >
                                <CheckCircle2 className="w-3 h-3 text-oasis-cyan shrink-0" />
                                <span className="truncate">{it.quantity}x {it.attraction?.name}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="relative z-10 sm:text-right flex flex-row flex-wrap sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto sm:shrink-0 gap-3 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
                        <div>
                          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                            Bundle Price
                          </div>
                          <div className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-white via-white to-amber-200 bg-clip-text text-transparent">
                            {formatCurrency(pkg.priceMinor, pkg.currency)}
                          </div>
                        </div>
                        <Link
                          href={`/book?package=${pkg.id}`}
                          className="group/btn inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-oasis-coral to-oasis-orange text-oasis-navy shadow-[0_8px_24px_-6px_rgba(251,146,60,0.6)] hover:shadow-[0_12px_28px_-4px_rgba(251,146,60,0.85)] hover:scale-[1.03] active:scale-[0.98] transition-all whitespace-nowrap"
                        >
                          <span>Select Package</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 8. How It Works */}
        <SectionTransitionBeam accent="cyan" />
        <BookingSteps />

        {/* 9. Upcoming Events */}
        <SectionTransitionBeam accent="purple" />
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-oasis-coral">
                    Group Celebrations &amp; Tournaments
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                    Upcoming Park Events &amp; Group Packages
                  </h2>
                </div>
                <Link
                  href="/events"
                  className="mt-4 sm:mt-0 text-sm font-bold text-oasis-cyan hover:underline inline-flex items-center gap-1"
                >
                  Reserve an event space <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((ev, idx) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 28, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.55, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6 }}
                  className="group rounded-2xl overflow-hidden bg-oasis-card border border-slate-800 hover:border-oasis-purple/60 hover:shadow-[0_20px_44px_-16px_rgba(124,58,237,0.4)] transition-colors flex flex-col"
                >
                  {ev.coverImageUrl && (
                    <div className="h-44 overflow-hidden relative">
                      <img
                        src={ev.coverImageUrl}
                        alt={ev.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-oasis-purple text-white">
                        {ev.eventType.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-oasis-cyan mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ev.eventDate).toLocaleDateString('en-NG', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{ev.title}</h3>
                    <p className="text-xs text-slate-400 mb-4 flex-1 line-clamp-3">
                      {ev.description}
                    </p>
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800">
                      <span className="text-slate-300 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-oasis-yellow" />
                        {ev.remainingSpaces} of {ev.maxAttendees} spots open
                      </span>
                      <Link
                        href="/events"
                        className="font-bold text-oasis-yellow hover:underline"
                      >
                        Reserve →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 10 & 11. Guest Reviews & Park Highlights */}
        <SectionTransitionBeam accent="cyan" />
        <ScrollReveal>
          <GuestReviews />
        </ScrollReveal>

        {/* 12 & 13. Location, Operating Hours & FAQ */}
        <SectionTransitionBeam accent="amber" />
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Operating Hours & Location */}
            <ScrollReveal direction="left" className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-oasis-cyan">
                  Plan Your Visit
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  Location &amp; Operating Hours
                </h2>
              </div>

              <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-oasis-coral flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white text-sm">
                      Oasis Amusement Park — Ile-Ife
                    </div>
                    <div className="text-xs text-slate-400">
                      Plot 8, Lagere, Ile-Ife, Osun State • +2348035382620
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <div className="text-xs font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-oasis-yellow" /> Weekly Schedule (Africa/Lagos WAT)
                  </div>
                  {operatingHours.map((h: any) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50 last:border-b-0"
                    >
                      <span className="font-medium text-slate-300">
                        {dayNames[h.dayOfWeek]}
                      </span>
                      <span className="font-bold text-oasis-cyan">
                        {h.isClosed ? 'Closed' : `${h.openTime} – ${h.closeTime}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* FAQ Accordion */}
            <ScrollReveal direction="right" delay={0.1} className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-oasis-coral">
                  Got Questions?
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-3">
                {faqs.map((item, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-2xl bg-oasis-card border border-slate-800 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-oasis-navyLight/40 transition-colors"
                      >
                        <span className="font-bold text-sm text-white flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-oasis-cyan flex-shrink-0" />
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-oasis-cyan' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>
        </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
