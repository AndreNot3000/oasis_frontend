import React from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-oasis-navy">
      <SiteHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-oasis-purple/15 border border-oasis-purple/40 text-oasis-cyan text-xs font-bold uppercase">
            <FileText className="w-3.5 h-3.5" /> Visitor Agreement
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Last updated: November 2026 • Oasis Amusement Park (Plot 8, Lagere,
            Ile-Ife, Osun State, Nigeria)
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-oasis-card border border-slate-800 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              1. Ticket Bookings &amp; 15-Minute Capacity Holds
            </h2>
            <p className="text-slate-400">
              Online reservations temporarily hold your selected attraction
              capacity for 15 minutes while payment is completed. Unpaid holds
              expire automatically and release capacity back to other guests.
              Your digital Master QR Pass is issued immediately once payment is
              confirmed.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              2. Gate Entry &amp; Partial Group Check-In
            </h2>
            <p className="text-slate-400">
              Each confirmed booking receives a unified QR Pass covering all
              purchased admissions and sessions. Multi-guest passes support
              partial check-in so members of your group may enter together or
              separately, up to the total purchased quantity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              3. Park Safety, Age &amp; Conduct Rules
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>
                Guests must follow all posted age, height, and safety marshal
                instructions at each attraction zone (VR Arena, Trampolines,
                Soft Play, Simulators, and Outdoor Trail).
              </li>
              <li>
                Oasis Amusement Park reserves the right to deny entry or revoke
                passes without refund for unsafe or disruptive conduct.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              4. Cancellations, Rescheduling &amp; Refunds
            </h2>
            <p className="text-slate-400">
              Timed attraction passes are valid for the booked date and time
              window. If a technical outage or late-payment capacity conflict
              prevents us from honoring a confirmed payment, our operations team
              will offer a priority reschedule or full refund.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              5. Pay-Per-Play Arcade Credits
            </h2>
            <p className="text-slate-400">
              Play-per-play credits (such as Arcade Packs and Air Hockey
              matches) are deducted in real time upon redemption at the gaming
              station and have no cash surrender value once partially redeemed.
            </p>
          </section>

          <section className="space-y-2 pt-2 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white">6. Contact</h2>
            <p className="text-slate-400">
              Questions regarding these terms? Reach us at{' '}
              <strong>+2348035382620</strong> or{' '}
              <strong>bookings@oasisamusementhub.com</strong>.
            </p>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <Link
            href="/privacy"
            className="inline-flex items-center gap-1.5 font-bold text-oasis-cyan hover:underline"
          >
            Read our Privacy Policy <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/book"
            className="inline-flex items-center gap-1.5 font-bold text-slate-300 hover:text-white"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Book Park Passes
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
