import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Sparkles,
  Users,
  HeartHandshake,
  Award,
  Ticket,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-oasis-navy">
      <SiteHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-oasis-purple/15 border border-oasis-purple/40 text-oasis-cyan text-xs font-bold uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Our Story &amp; Safety Standards
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Designed for Joy, Engineered for Safety.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            Located at Plot 8, Lagere, Ile-Ife, Osun State, Oasis Amusement Park
            brings international-standard entertainment attractions, multi-player VR
            arenas, electric drift bumper cars, F1 motion simulators, and
            family adventure zones under one roof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-3">
            <ShieldCheck className="w-8 h-8 text-oasis-cyan" />
            <h2 className="text-lg font-bold text-white">
              Strict Capacity &amp; Safety Marshals
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every zone operates with real-time occupancy controls and trained
              safety marshals. Our booking engine guarantees no session is ever
              overcrowded.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-3">
            <Users className="w-8 h-8 text-oasis-yellow" />
            <h2 className="text-lg font-bold text-white">
              Built for All Ages
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              From toddlers in the 3-tier Jungle Soft Play to teenagers and
              corporate teams competing in the Omni VR Arena and F1 Simulators,
              every age bracket has dedicated experiences.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-3">
            <Award className="w-8 h-8 text-oasis-coral" />
            <h2 className="text-lg font-bold text-white">
              Seamless Digital Ticketing
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Whether you book online from home or walk in at our physical
              counter, your passes and play credits are managed on a unified
              real-time platform.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-gradient-to-r from-oasis-card via-oasis-navyLight to-oasis-card border border-oasis-purple/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-oasis-yellow">
              <HeartHandshake className="w-4 h-4" /> Ready to Visit Oasis?
            </div>
            <h3 className="text-2xl font-black text-white">
              Reserve Your Passes &amp; Sessions Online Today
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Lock in your time slots in advance and skip the ticket counter queue.
            </p>
          </div>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-oasis-coral to-oasis-yellow text-oasis-navy shadow-xl whitespace-nowrap"
          >
            <Ticket className="w-4 h-4" /> Book Tickets Now
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
