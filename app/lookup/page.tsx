'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

function LookupInner() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const initialEmail = searchParams.get('email') || '';

  const [reference, setReference] = useState<string>(initialRef);
  const [email, setEmail] = useState<string>(initialEmail);
  const [booking, setBooking] = useState<any | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [paying, setPaying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const performLookup = async (refVal: string, emailVal: string) => {
    if (!refVal.trim() || !emailVal.trim()) {
      setError('Please enter both your booking reference and booking email address.');
      return;
    }
    setError(null);
    try {
      setLoading(true);
      const cleanRef = refVal.trim().toUpperCase();
      const cleanEmail = emailVal.trim();
      const bookingRes = await apiClient<any>(
        `/bookings/${encodeURIComponent(cleanRef)}?email=${encodeURIComponent(
          cleanEmail,
        )}`,
      );
      setBooking(bookingRes);

      if (
        bookingRes?.status === 'CONFIRMED' ||
        bookingRes?.status === 'PARTIALLY_CHECKED_IN' ||
        bookingRes?.status === 'CHECKED_IN'
      ) {
        const tktRes = await apiClient<any>(
          `/tickets/${encodeURIComponent(cleanRef)}?email=${encodeURIComponent(
            cleanEmail,
          )}`,
        );
        setTickets(tktRes?.tickets || []);
      } else {
        setTickets([]);
      }
    } catch (err: any) {
      setBooking(null);
      setTickets([]);
      setError(err.message || 'Booking not found or email did not match');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef && initialEmail) {
      performLookup(initialRef, initialEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResumePayment = async () => {
    if (!booking) return;
    setError(null);
    try {
      setPaying(true);
      const res = await apiClient<any>('/payments/bachs/initialize', {
        method: 'POST',
        body: JSON.stringify({
          bookingReference: booking.reference,
          returnOrigin: typeof window !== 'undefined' ? window.location.origin : undefined,
        }),
      });
      if (!res?.checkoutUrl) {
        throw new Error('Could not start payment checkout');
      }
      try {
        sessionStorage.setItem('oasis_pay_email', email.trim());
        sessionStorage.setItem('oasis_pay_booking', booking.reference);
      } catch {
        // storage unavailable
      }
      window.location.href = res.checkoutUrl;
    } catch (err: any) {
      setError(err.message || 'Could not start payment checkout');
      setPaying(false);
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-6 py-12 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-oasis-cyan/10 border border-oasis-cyan/30 text-oasis-cyan text-xs font-bold uppercase mb-3">
          <Ticket className="w-3.5 h-3.5" /> Secure Pass Retrieval
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Find Your Booking &amp; Digital QR Tickets
        </h1>
        <p className="text-slate-300 text-sm mt-2">
          Enter your booking reference (e.g. <code className="text-oasis-yellow">OAS-2026-...</code>) and the email address used at checkout to view or print your passes.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          performLookup(reference, email);
        }}
        className="p-6 rounded-2xl bg-oasis-card border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
      >
        <div className="md:col-span-5">
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            Booking Reference *
          </label>
          <input
            type="text"
            required
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="OAS-2026-XXXXXXXXXX"
            className="w-full px-4 py-2.5 rounded-xl bg-oasis-navy border border-slate-700 text-sm font-mono text-white uppercase"
          />
        </div>
        <div className="md:col-span-5">
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            Verification Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="visitor@example.com"
            className="w-full px-4 py-2.5 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-oasis-purple to-oasis-coral text-white"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Searching...' : 'Find'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {booking && (
        <div className="p-7 rounded-3xl bg-oasis-card border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Booking Reference</div>
              <div className="text-2xl font-mono font-black text-oasis-yellow">
                {booking.reference}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase ${
                  booking.status === 'CONFIRMED' ||
                  booking.status === 'CHECKED_IN' ||
                  booking.status === 'PARTIALLY_CHECKED_IN'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                    : booking.status === 'AWAITING_PAYMENT'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                    : 'bg-red-500/15 text-red-300 border border-red-500/40'
                }`}
              >
                {booking.status}
              </span>
              <span className="text-xl font-black text-white">
                {formatCurrency(booking.totalAmountMinor, booking.currency)}
              </span>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase text-slate-400">
              Booked Experiences
            </div>
            {(booking.items || []).map((item: any) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-oasis-navy border border-slate-800 flex items-center justify-between text-xs sm:text-sm"
              >
                <div>
                  <span className="font-bold text-white">{item.itemName}</span>{' '}
                  <span className="text-slate-400">× {item.quantity}</span>
                </div>
                <span className="font-bold text-oasis-yellow">
                  {formatCurrency(item.subtotalMinor, booking.currency)}
                </span>
              </div>
            ))}
          </div>

          {booking.status === 'AWAITING_PAYMENT' && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-amber-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  This booking is awaiting payment. Complete payment before hold
                  expiry to issue your QR tickets.
                </span>
              </div>
              <button
                type="button"
                disabled={paying}
                onClick={handleResumePayment}
                className="px-5 py-2.5 rounded-xl font-black text-xs bg-emerald-400 text-oasis-navy inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <CreditCard className="w-4 h-4" />
                {paying ? 'Processing...' : 'Complete Payment Now'}
              </button>
            </div>
          )}

          {tickets.length > 0 && (() => {
            const masterTicket = tickets[0];
            return (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Unified Digital QR Pass ({tickets.length} Included)
                  </h2>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-oasis-purple text-white"
                  >
                    Print Pass
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-oasis-navy border border-oasis-cyan/30 flex flex-col md:flex-row items-center gap-7">
                  <div className="flex flex-col items-center text-center space-y-2.5 flex-shrink-0">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-oasis-cyan/15 text-oasis-cyan border border-oasis-cyan/30">
                      All-In-One Master QR
                    </span>
                    {masterTicket.qrDataUrl && (
                      <img
                        src={masterTicket.qrDataUrl}
                        alt={masterTicket.ticketCode}
                        className="w-48 h-48 rounded-2xl border-4 border-white shadow-xl"
                      />
                    )}
                    <div className="font-mono text-sm font-black text-oasis-yellow">
                      {booking.reference}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Scan once at the gate to display all details
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Included Passes &amp; Admissions
                    </div>
                    {tickets.map((tkt) => (
                      <div
                        key={tkt.id}
                        className="p-3.5 rounded-xl bg-oasis-card border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{tkt.title}</div>
                          <div className="font-mono text-[11px] text-oasis-cyan">
                            {tkt.ticketCode} • {tkt.status}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-oasis-yellow">
                            Remaining: {tkt.remainingQuantity}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Admitted: {tkt.admittedCount} / {tkt.totalQuantity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default function BookingLookupPage() {
  return (
    <div className="flex flex-col min-h-screen bg-oasis-navy">
      <SiteHeader />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-5xl mx-auto px-6 py-12">
              <div className="h-64 rounded-2xl bg-oasis-card/60 animate-pulse" />
            </div>
          }
        >
          <LookupInner />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
