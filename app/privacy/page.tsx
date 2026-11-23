import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-oasis-navy">
      <SiteHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-oasis-cyan/10 border border-oasis-cyan/30 text-oasis-cyan text-xs font-bold uppercase">
            <Lock className="w-3.5 h-3.5" /> Legal &amp; Data Protection
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Last updated: November 2026 • Oasis Amusement Park (Plot 8, Lagere,
            Ile-Ife, Osun State, Nigeria)
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-oasis-card border border-slate-800 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              1. Information We Collect
            </h2>
            <p>
              When you book attraction passes, create an account, or sign in
              with Google on Oasis Amusement Park, we collect only the
              information needed to issue your digital QR passes and manage your
              park visit:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>
                <strong>Identity &amp; Contact Details:</strong> Full name,
                email address, and phone number (provided directly or via Google
                Sign-In).
              </li>
              <li>
                <strong>Booking &amp; Pass Records:</strong> Selected dates,
                attraction time slots, play-per-play credit balances, and
                turnstile check-in history.
              </li>
              <li>
                <strong>Payment References:</strong> Transaction references and
                confirmation statuses processed securely via Paystack. We never
                store your raw card number or PIN on our servers.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>
                To reserve capacity slots, process ticket payments, and generate
                cryptographically signed QR passes for gate entry.
              </li>
              <li>
                To allow you to retrieve your tickets anytime via{' '}
                <Link href="/lookup" className="text-oasis-cyan hover:underline">
                  Ticket Lookup
                </Link>{' '}
                or your{' '}
                <Link href="/account" className="text-oasis-cyan hover:underline">
                  Visitor Account
                </Link>
                .
              </li>
              <li>
                To notify park operations staff when a booking is confirmed and
                assist you with customer support or event enquiries.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              3. Google Sign-In Data
            </h2>
            <p className="text-slate-400">
              If you choose to sign in or register using Google, we only request
              your verified email address and basic profile name to authenticate
              your Oasis account. We do not access your Google contacts, Drive,
              or other Google services, and we never sell or rent your personal
              data to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              4. Data Security &amp; Retention
            </h2>
            <p className="text-slate-400">
              Your session uses HTTP-only authentication cookies, passwords are
              hashed with Argon2, and every digital QR pass is signed with
              HMAC-SHA256. You may request account deletion or data corrections
              at any time by contacting our guest relations team.
            </p>
          </section>

          <section className="space-y-2 pt-2 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-oasis-yellow" /> Contact Us
            </h2>
            <p className="text-slate-400">
              Oasis Amusement Park — Plot 8, Lagere, Ile-Ife, Osun State •
              Phone: <strong>+2348035382620</strong> • Email:{' '}
              <strong>hello@oasisamusement.com</strong>
            </p>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <Link
            href="/terms"
            className="inline-flex items-center gap-1.5 font-bold text-oasis-cyan hover:underline"
          >
            Read our Terms of Service <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 font-bold text-slate-300 hover:text-white"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Return to Sign In
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
