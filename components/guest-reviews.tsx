'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles, Star } from 'lucide-react';

export interface GuestReview {
  name: string;
  role: string;
  quote: string;
  rating: number;
  image: string;
}

const AUTOPLAY_MS = 5000;

const DEFAULT_REVIEWS: GuestReview[] = [
  {
    name: 'Adaeze Martins',
    role: 'Family weekend visitor',
    quote:
      'We booked the family weekend adventure online and scanning our phone at the gate took five seconds. The kids spent two non-stop hours in the soft play and bumper arena.',
    rating: 5,
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Seyi Balogun',
    role: 'Corporate team lead',
    quote:
      'We hosted a forty-person team night here. The simulators and the VR arena were electric, and there were zero queues because our slots were allocated in advance.',
    rating: 5,
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Chisom Nwachukwu',
    role: 'Birthday host',
    quote:
      'Half of our guests arrived twenty minutes late, and partial check-in made admission effortless. It was the easiest party I have ever organised.',
    rating: 5,
    image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Tunde Adeyemi',
    role: 'Weekend regular',
    quote:
      'Pay-per-play credits on one pass mean no coins and no fuss. I top up once and tap my way around the whole arcade hall.',
    rating: 5,
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Ngozi Okafor',
    role: 'School trip organiser',
    quote:
      'Booking for a whole class was simple, the staff were wonderful with the children, and every pupil came home talking about their favourite ride.',
    rating: 5,
    image:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=85',
  },
];

function Stars({ count, className = 'w-3.5 h-3.5' }: { count: number; className?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${className} ${i < count ? 'fill-[#F5B301] text-[#F5B301]' : 'fill-transparent text-white/20'}`}
        />
      ))}
    </div>
  );
}

const pad = (n: number) => String(n + 1).padStart(2, '0');

export function GuestReviews({ reviews = DEFAULT_REVIEWS }: { reviews?: GuestReview[] }) {
  const count = reviews.length;
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  // bumped on every navigation so the timer + progress bar always restart
  const [tick, setTick] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      const target = ((index % count) + count) % count;
      setDirection(target >= active ? 'next' : 'prev');
      setActive(target);
      setTick((t) => t + 1);
    },
    [count, active]
  );

  const next = useCallback(() => {
    setActive((current) => (current + 1) % count);
    setDirection('next');
    setTick((t) => t + 1);
  }, [count]);

  const prev = useCallback(() => {
    setActive((current) => (current - 1 + count) % count);
    setDirection('prev');
    setTick((t) => t + 1);
  }, [count]);

  // Autoplay: never paused by hover; restarts on any navigation; cleaned up on change/unmount.
  useEffect(() => {
    if (count < 2) return;
    const id = window.setTimeout(next, AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [tick, count, next]);

  const current = reviews[active];
  const previous = reviews[(active - 1 + count) % count];
  const upcoming = reviews[(active + 1) % count];
  const slideClass = direction === 'prev' ? 'rv-in-prev' : direction === 'next' ? 'rv-in-next' : '';
  const fadeClass = direction ? 'rv-up' : '';

  const arrowBase =
    'inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)] transition-all duration-300 hover:bg-[#1478FF] hover:border-[#1478FF] hover:scale-110 hover:shadow-[0_12px_26px_-8px_rgba(20,120,255,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1478FF] focus-visible:ring-offset-0';

  return (
    <section
      aria-labelledby="guest-reviews-heading"
      className="py-14 sm:py-20 px-4 sm:px-6 bg-white/[0.02] border-y border-white/[0.07]"
    >
      <style>{`
        @keyframes rv-in-next { from { opacity: .0; transform: translateX(28px) scale(.96); filter: blur(6px); } to { opacity: 1; transform: none; filter: blur(0); } }
        @keyframes rv-in-prev { from { opacity: .0; transform: translateX(-28px) scale(.96); filter: blur(6px); } to { opacity: 1; transform: none; filter: blur(0); } }
        @keyframes rv-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes rv-zoom { from { transform: scale(1); } to { transform: scale(1.07); } }
        @keyframes rv-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .rv-in-next { animation: rv-in-next 700ms cubic-bezier(.22,1,.36,1) both; }
        .rv-in-prev { animation: rv-in-prev 700ms cubic-bezier(.22,1,.36,1) both; }
        .rv-up { animation: rv-up 550ms cubic-bezier(.22,1,.36,1) both; }
        .rv-zoom { animation: rv-zoom 9s ease-out forwards; }
        .rv-progress { transform-origin: left; animation: rv-progress ${AUTOPLAY_MS}ms linear forwards; }
        @media (prefers-reduced-motion: reduce) {
          .rv-in-next, .rv-in-prev, .rv-up, .rv-zoom { animation: none; }
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto text-white flex flex-col">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
              <span className="w-2 h-2 rounded-full bg-[#1478FF]" />
              Stories from real visits
            </div>
            <h2
              id="guest-reviews-heading"
              className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.02]"
            >
              Loved by guests
              <br />
              who came for the fun.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/60 leading-relaxed max-w-md">
              Families, friends and teams use their Oasis pass to skip the queues, play more and
              make the day count.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3 text-white/55 text-sm leading-snug">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <p>
              A better way to plan,
              <br />
              play and make memories.
            </p>
          </div>
        </header>

        {/* Showcase */}
        <div className="flex-1 flex items-center py-8 sm:py-10">
          <div className="w-full flex flex-col md:flex-row md:items-stretch gap-6 md:gap-6 xl:gap-5">
            {/* 1. Previous customer card (xl+) */}
            <div className="hidden xl:flex items-center">
              <article
                key={`prev-${active}`}
                className={`${fadeClass} w-[210px] rounded-3xl bg-white/[0.06] backdrop-blur border border-white/10 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.6)] p-4`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previous.image}
                  alt=""
                  aria-hidden="true"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="mt-3 text-sm font-bold leading-tight">{previous.name}</div>
                <div className="text-xs text-white/55">{previous.role}</div>
                <div className="mt-4 text-[10px] uppercase tracking-wider text-white/45">
                  Guest rating
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-2xl font-black">{previous.rating.toFixed(1)}</span>
                  <Stars count={previous.rating} className="w-3 h-3" />
                </div>
              </article>
            </div>

            {/* 2. Previous arrow (xl+) */}
            <div className="hidden xl:flex items-center">
              <button type="button" onClick={prev} aria-label="Previous review" className={arrowBase}>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* 3. Main portrait */}
            <div className="relative w-full md:w-[270px] lg:w-[300px] xl:w-[290px] shrink-0 h-[340px] sm:h-[420px] md:h-auto md:min-h-[440px] lg:min-h-[480px]">
              <div
                key={`portrait-${active}`}
                className={`${slideClass} absolute inset-0 rounded-[28px] overflow-hidden shadow-[0_24px_50px_-20px_rgba(16,19,22,0.55)]`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={`img-${active}`}
                  src={current.image}
                  alt={`Portrait of ${current.name}, ${current.role}`}
                  className="rv-zoom absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-transparent" />
                <span className="absolute bottom-4 right-4 text-xs font-bold tracking-widest text-white bg-black/35 backdrop-blur px-3 py-1.5 rounded-full">
                  {pad(active)}
                </span>
              </div>
            </div>

            {/* 4. Active testimonial */}
            <article
              key={`content-${active}`}
              className={`${slideClass} flex-1 min-w-0 flex flex-col justify-between md:py-2`}
            >
              <div>
                <span
                  aria-hidden="true"
                  className="block font-serif text-7xl sm:text-8xl leading-[0.6] text-[#1478FF] h-10 sm:h-12"
                >
                  &ldquo;
                </span>
                <blockquote className="mt-4 text-lg sm:text-xl 2xl:text-2xl leading-[1.55] font-medium max-w-xl">
                  {current.quote}
                </blockquote>
              </div>

              <div className="mt-8 pt-5 border-t border-white/10 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-bold text-base truncate">{current.name}</div>
                  <div className="text-sm text-white/55 truncate">{current.role}</div>
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-[10px] uppercase tracking-wider text-white/45">
                    Guest rating
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-2xl font-black">{current.rating.toFixed(1)}</span>
                    <Stars count={current.rating} />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button type="button" onClick={prev} aria-label="Previous review" className={`${arrowBase} xl:hidden shrink-0`}>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={next} aria-label="Next review" className={`${arrowBase} shrink-0`}>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="sm:hidden mt-3 flex items-center gap-2">
                <span className="text-xl font-black">{current.rating.toFixed(1)}</span>
                <Stars count={current.rating} />
              </div>
            </article>

            {/* 5. Next customer preview (lg+) */}
            <div className="hidden 2xl:flex items-center">
              <div
                key={`next-${active}`}
                className={`${fadeClass} relative w-[260px] h-[300px] rounded-3xl overflow-hidden shadow-[0_16px_36px_-16px_rgba(0,0,0,0.6)]`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={upcoming.image}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 text-[10px] uppercase tracking-wider font-bold text-white bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">
                  Next story
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="font-bold leading-tight">{upcoming.name}</div>
                  <div className="text-xs text-white/70">{upcoming.role}</div>
                  <div className="mt-2 flex items-center gap-1.5 text-sm font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#F5B301] text-[#F5B301]" aria-hidden="true" />
                    {upcoming.rating.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-6">
          <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-3 order-2 lg:order-1">
            <Link
              href="/attractions"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1478FF] text-white text-sm font-bold transition-colors duration-300 hover:bg-[#3a8dff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1478FF] focus-visible:ring-offset-0 w-full sm:w-auto"
            >
              Explore the attractions
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-full border border-white/25 text-sm font-bold transition-colors duration-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1478FF] focus-visible:ring-offset-0 w-full sm:w-auto"
            >
              Book your visit
            </Link>
          </div>

          <div className="flex flex-col items-center gap-3 order-1 lg:order-2">
            <div className="flex items-center gap-2" role="group" aria-label="Choose a review">
              {reviews.map((r, i) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show review ${i + 1} of ${count}: ${r.name}`}
                  aria-current={i === active ? 'true' : undefined}
                  className={`h-2 rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1478FF] focus-visible:ring-offset-0 ${
                    i === active ? 'w-8 bg-[#1478FF]' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
            <div className="w-40 sm:w-48 h-[3px] rounded-full bg-white/10 overflow-hidden" aria-hidden="true">
              <div key={`progress-${tick}`} className="rv-progress h-full w-full rounded-full bg-[#1478FF]" />
            </div>
          </div>

          <p className="hidden lg:block order-3 text-right text-sm text-white/50 leading-snug">
            Made for families, friends
            <br />
            and every kind of fun.
          </p>
        </footer>
      </div>
    </section>
  );
}
