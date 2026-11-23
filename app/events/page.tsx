'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Users,
  PartyPopper,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeEvent, setActiveEvent] = useState<any | null>(null);
  const [guestCount, setGuestCount] = useState<number>(10);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [reservationResult, setReservationResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await apiClient<any[]>('/events');
      setEvents(data || []);
    } catch (err: any) {
      setError(err.message || 'Unable to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) return;
    setError(null);
    try {
      setSubmitting(true);
      const res = await apiClient<any>(
        `/events/${encodeURIComponent(activeEvent.slug)}/reserve`,
        {
          method: 'POST',
          body: JSON.stringify({
            guestCount: Number(guestCount),
            customer: {
              email: email.trim(),
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              phoneNumber: phoneNumber.trim() || undefined,
            },
          }),
        },
      );
      setReservationResult(res);
      await loadEvents();
    } catch (err: any) {
      setError(err.message || 'Could not reserve event spaces');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-oasis-navy">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-oasis-coral/15 border border-oasis-coral/30 text-oasis-coral text-xs font-bold uppercase mb-3">
            <PartyPopper className="w-3.5 h-3.5" /> Group Visits &amp; Celebrations
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Events, Birthdays &amp; Corporate Tournaments
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
            Host unforgettable birthday celebrations, school STEM excursions, and
            corporate team nights at Oasis Amusement Park. Reserve spaces online
            with live group capacity tracking.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-200 text-sm mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {reservationResult && (
          <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 mb-8 space-y-2">
            <div className="flex items-center gap-2 font-black text-base text-white">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Event Space Reserved for {reservationResult.eventTitle}!
            </div>
            <p className="text-xs sm:text-sm">
              Reservation ID:{' '}
              <span className="font-mono font-bold text-oasis-yellow">
                {reservationResult.reservationId}
              </span>{' '}
              • Guests: <strong>{reservationResult.guestCount}</strong> • Package
              Rate:{' '}
              <strong>
                {formatCurrency(reservationResult.amountMinor, 'NGN')}
              </strong>{' '}
              • Remaining Event Spaces:{' '}
              <strong>{reservationResult.remainingSpacesAfter}</strong>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 grid grid-cols-1 gap-6">
            {loading
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-60 rounded-2xl bg-oasis-card/60 animate-pulse border border-slate-800"
                  />
                ))
              : events.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-3xl overflow-hidden bg-oasis-card border border-slate-800 flex flex-col sm:flex-row shadow-xl"
                  >
                    {ev.coverImageUrl && (
                      <div className="sm:w-64 h-52 sm:h-auto overflow-hidden relative flex-shrink-0">
                        <img
                          src={ev.coverImageUrl}
                          alt={ev.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-oasis-purple text-white">
                          {ev.eventType.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-oasis-cyan mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(ev.eventDate).toLocaleDateString('en-NG', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-oasis-yellow" />
                            {new Date(ev.startTime).toLocaleTimeString('en-NG', {
                              timeZone: 'Africa/Lagos',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            –{' '}
                            {new Date(ev.endTime).toLocaleTimeString('en-NG', {
                              timeZone: 'Africa/Lagos',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <h2 className="text-xl font-black text-white mb-2">
                          {ev.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {ev.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
                        <div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-emerald-400" />
                            {ev.remainingSpaces} of {ev.maxAttendees} guest spaces
                            available
                          </div>
                          <div className="text-lg font-black text-oasis-yellow mt-0.5">
                            {formatCurrency(ev.basePriceMinor, 'NGN')}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveEvent(ev);
                            setReservationResult(null);
                          }}
                          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-oasis-purple to-oasis-coral text-white shadow-lg"
                        >
                          Reserve Spaces →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          {/* Event Reservation Form Panel */}
          <aside className="lg:col-span-4 p-6 rounded-2xl bg-oasis-card border border-oasis-purple/40 sticky top-24 space-y-4">
            <h3 className="text-lg font-black text-white">
              {activeEvent
                ? `Reserve: ${activeEvent.title}`
                : 'Reserve Event Space'}
            </h3>
            {!activeEvent ? (
              <p className="text-xs text-slate-400">
                Click &ldquo;Reserve Spaces&rdquo; on any event card to book your
                group&apos;s spots.
              </p>
            ) : (
              <form onSubmit={handleReserveSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Number of Guests (Max {activeEvent.remainingSpaces})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={activeEvent.remainingSpaces}
                    required
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Organizer First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Organizer Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Organizer Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-oasis-coral to-oasis-yellow text-oasis-navy shadow-lg"
                >
                  {submitting
                    ? 'Reserving Group Spaces...'
                    : `Confirm Reservation (${formatCurrency(
                        activeEvent.basePriceMinor,
                        'NGN',
                      )})`}
                </button>
              </form>
            )}
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
