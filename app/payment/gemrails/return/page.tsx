'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Coins, Loader2, Printer, QrCode, Search } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { apiClient } from '@/lib/api-client';

const POLL_INTERVAL_MS = 5000;
const MAX_ATTEMPTS = 24; // ~2 minutes for the on-chain payment to settle

type Phase = 'checking' | 'verified' | 'review' | 'timeout' | 'error';

function ReturnInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const booking = searchParams.get('booking') || '';
  const pay = searchParams.get('pay') || '';

  const [phase, setPhase] = useState<Phase>('checking');
  const [message, setMessage] = useState<string>('');
  const [attempt, setAttempt] = useState(0);
  const [tickets, setTickets] = useState<any[]>([]);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelled = useRef(false);

  const lookupHref = useCallback(
    (emailOverride?: string) => {
      let storedEmail = emailOverride || customerEmail || '';
      if (!storedEmail) {
        try {
          storedEmail = sessionStorage.getItem('oasis_gr_email') || '';
        } catch {
          storedEmail = '';
        }
      }
      const qs = new URLSearchParams({ ref: booking });
      if (storedEmail) qs.set('email', storedEmail);
      return `/lookup?${qs.toString()}`;
    },
    [booking, customerEmail],
  );

  useEffect(() => {
    cancelled.current = false;
    if (!booking || !pay) {
      setPhase('error');
      setMessage('This payment link is incomplete. Use the booking lookup to check your tickets.');
      return;
    }

    let tries = 0;
    const check = async () => {
      if (cancelled.current) return;
      tries += 1;
      setAttempt(tries);
      try {
        const res = await apiClient<any>(`/payments/verify/${encodeURIComponent(pay)}`);
        if (cancelled.current) return;
        if (res?.verified) {
          const emailVal = res?.customerEmail || '';
          if (emailVal) setCustomerEmail(emailVal);

          if (Array.isArray(res?.tickets) && res.tickets.length > 0) {
            setTickets(res.tickets);
            setPhase('verified');
            return;
          }

          // Fallback: fetch from /tickets or redirect to lookup if tickets array was empty
          setPhase('verified');
          timer.current = setTimeout(() => router.replace(lookupHref(emailVal)), 1200);
          return;
        }
        if (res?.status === 'REQUIRES_REVIEW') {
          setPhase('review');
          setMessage(res.message || 'Your payment needs a quick manual review by our team.');
          return;
        }
      } catch (err: any) {
        if (cancelled.current) return;
        // Transient provider/network errors: keep polling until the limit.
        setMessage(err?.message || '');
      }
      if (tries >= MAX_ATTEMPTS) {
        setPhase('timeout');
        return;
      }
      timer.current = setTimeout(check, POLL_INTERVAL_MS);
    };

    check();
    return () => {
      cancelled.current = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [booking, pay, router, lookupHref]);

  const masterTicket = tickets[0];

  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-12 sm:py-16">
      {phase === 'verified' && masterTicket ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-oasis-card border border-emerald-500/40 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Stablecoin Payment Confirmed &amp; Paid
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Your Digital QR Tickets Are Ready!
              </h1>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-oasis-navy border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              Booking Reference:{' '}
              <span className="font-mono font-black text-oasis-yellow text-sm">{booking}</span>
            </div>
            {customerEmail && (
              <div>
                Booked under: <span className="font-bold text-oasis-cyan">{customerEmail}</span>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-oasis-navy border border-oasis-cyan/30 flex flex-col md:flex-row items-center gap-7">
            <div className="flex flex-col items-center text-center space-y-2.5 flex-shrink-0">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                All-In-One Master QR Pass
              </span>
              {masterTicket.qrDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={masterTicket.qrDataUrl}
                  alt={`QR ticket for ${booking}`}
                  className="w-52 h-52 sm:w-56 sm:h-56 rounded-2xl border-4 border-white shadow-xl bg-white"
                />
              )}
              <div className="font-mono text-sm font-black text-oasis-yellow">{booking}</div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-oasis-cyan" />
                Scan once at the gate to view &amp; admit all passes
              </div>
            </div>

            <div className="flex-1 w-full space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Included Passes ({tickets.length})
                {masterTicket.visitorName ? (
                  <>
                    {' '}
                    • Visitor: <span className="text-white">{masterTicket.visitorName}</span>
                  </>
                ) : null}
              </div>
              <div className="space-y-2">
                {tickets.map((tkt: any) => (
                  <div
                    key={tkt.id}
                    className="p-3.5 rounded-xl bg-oasis-card border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{tkt.title}</div>
                      <div className="font-mono text-[11px] text-oasis-cyan">{tkt.ticketCode}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-black text-oasis-yellow">
                        {tkt.remainingQuantity} / {tkt.totalQuantity}
                      </span>
                      <div className="text-[10px] text-slate-400">Valid Admissions</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-oasis-purple text-white hover:opacity-90 transition-opacity"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF Passes
            </button>
            <Link
              href={lookupHref()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-oasis-navy text-oasis-cyan border border-slate-700 hover:border-oasis-cyan/60 transition-colors"
            >
              <Search className="w-4 h-4" /> Open in Ticket Lookup
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 transition-colors"
            >
              Book Another Visit
            </Link>
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-oasis-card border border-slate-800 text-center space-y-5">
          {phase === 'checking' && (
            <>
              <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <h1 className="text-2xl font-black text-white">Confirming your stablecoin payment</h1>
              <p className="text-sm text-slate-300">
                We are waiting for the network to confirm your USDT / USDC transfer. This usually
                takes under a minute. Please keep this page open.
              </p>
              <p className="text-xs text-slate-500" aria-live="polite">
                Check {attempt} of {MAX_ATTEMPTS}
                {message ? ` • ${message}` : ''}
              </p>
            </>
          )}

          {phase === 'verified' && (
            <>
              <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-white">Payment confirmed</h1>
              <p className="text-sm text-slate-300">Taking you to your QR tickets...</p>
              <Link
                href={lookupHref()}
                className="inline-flex px-5 py-3 rounded-xl font-bold text-sm bg-emerald-400 text-oasis-navy"
              >
                View my tickets
              </Link>
            </>
          )}

          {phase === 'review' && (
            <>
              <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-white">We received your payment</h1>
              <p className="text-sm text-slate-300">{message}</p>
              <p className="text-xs text-slate-400">
                Booking reference: <span className="font-mono text-oasis-yellow">{booking}</span>
              </p>
            </>
          )}

          {phase === 'timeout' && (
            <>
              <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-700/40 border border-slate-600 flex items-center justify-center text-oasis-cyan">
                <Coins className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-white">Still waiting for confirmation</h1>
              <p className="text-sm text-slate-300">
                We have not seen the payment settle yet. If you already sent it, your tickets will
                appear under your booking as soon as the network confirms it. You do not need to pay
                again.
              </p>
              <p className="text-xs text-slate-400">
                Booking reference: <span className="font-mono text-oasis-yellow">{booking}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-5 py-3 rounded-xl font-bold text-sm bg-emerald-400 text-oasis-navy"
                >
                  Check again
                </button>
                <Link
                  href={lookupHref()}
                  className="px-5 py-3 rounded-xl font-bold text-sm border border-slate-600 text-white"
                >
                  Open booking lookup
                </Link>
              </div>
            </>
          )}

          {phase === 'error' && (
            <>
              <div className="mx-auto h-14 w-14 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-300">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-white">We couldn&apos;t check this payment</h1>
              <p className="text-sm text-slate-300">{message}</p>
              <Link
                href="/lookup"
                className="inline-flex px-5 py-3 rounded-xl font-bold text-sm bg-oasis-cyan text-oasis-navy"
              >
                Go to booking lookup
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function GemRailsReturnPage() {
  return (
    <div className="flex flex-col min-h-screen bg-oasis-navy">
      <SiteHeader />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-xl mx-auto px-6 py-16">
              <div className="h-64 rounded-3xl bg-oasis-card/60 animate-pulse" />
            </div>
          }
        >
          <ReturnInner />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
