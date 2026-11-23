'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  Users,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Ticket,
  ArrowLeft,
  Layers,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

export default function AttractionDetailPage() {
  const params = useParams();
  const slug = String(params?.slug || '');

  const [attraction, setAttraction] = useState<any | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [availability, setAvailability] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    async function loadDetail() {
      try {
        setLoading(true);
        const [detail, allAttr] = await Promise.all([
          apiClient<any>(`/attractions/${slug}`),
          apiClient<any[]>('/attractions'),
        ]);
        setAttraction(detail);
        setRelated(
          (allAttr || []).filter((a) => a.slug !== slug).slice(0, 3),
        );
      } catch (err: any) {
        setError(err.message || 'Attraction not found');
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [slug]);

  useEffect(() => {
    if (!slug || !selectedDate) return;
    async function loadSlots() {
      try {
        setSlotsLoading(true);
        const avail = await apiClient<any>(
          `/availability?attraction=${encodeURIComponent(slug)}&date=${encodeURIComponent(
            selectedDate,
          )}`,
        );
        setAvailability(avail);
      } catch {
        setAvailability(null);
      } finally {
        setSlotsLoading(false);
      }
    }
    loadSlots();
  }, [slug, selectedDate]);

  return (
    <div className="flex flex-col min-h-screen bg-oasis-navy">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <Link
          href="/attractions"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-oasis-cyan mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Attractions
        </Link>

        {loading ? (
          <div className="h-96 rounded-3xl bg-oasis-card/60 border border-slate-800 animate-pulse" />
        ) : error || !attraction ? (
          <div className="p-10 rounded-3xl bg-oasis-card border border-red-500/30 text-center space-y-4">
            <h1 className="text-2xl font-black text-white">
              {error || 'Attraction Not Found'}
            </h1>
            <Link
              href="/attractions"
              className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-oasis-purple text-white"
            >
              Browse All Attractions
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Hero Cover & Core Specs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-3xl overflow-hidden border border-slate-800 relative h-72 sm:h-96 shadow-2xl">
                  <img
                    src={attraction.coverImageUrl}
                    alt={attraction.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-bold bg-oasis-navy/90 text-oasis-cyan border border-oasis-cyan/30">
                    {attraction.category?.name}
                  </div>
                </div>

                {/* Bookable Physical Resources */}
                <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-oasis-cyan" />
                    Physical Arena &amp; Bookable Units ({attraction.resources?.length || 1})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {attraction.resources?.map((res: any) => (
                      <span
                        key={res.id}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-oasis-navy border border-slate-700 text-slate-200"
                      >
                        {res.name} (Cap: {res.maxCapacity})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing & Requirements Panel */}
              <div className="lg:col-span-5 p-7 rounded-3xl bg-oasis-card border border-oasis-purple/40 shadow-xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-oasis-yellow">
                    {attraction.accessModel.replace(/_/g, ' ')}
                  </span>
                  <h1 className="text-3xl font-black text-white mt-1">
                    {attraction.name}
                  </h1>
                  <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                    {attraction.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-oasis-navy border border-slate-800">
                    <div className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-oasis-cyan" /> Session Duration
                    </div>
                    <div className="text-base font-black text-white mt-1">
                      {attraction.accessModel === 'PAY_PER_PLAY'
                        ? 'Pay-Per-Play Credits'
                        : `${attraction.sessionDurationMin} Minutes`}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-oasis-navy border border-slate-800">
                    <div className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-oasis-coral" /> Age &amp; Capacity
                    </div>
                    <div className="text-base font-black text-white mt-1">
                      {attraction.minAge ? `${attraction.minAge}+ yrs` : 'All Ages'} • Max{' '}
                      {attraction.maxPlayers}
                    </div>
                  </div>
                </div>

                {/* Pricing Tiers */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Configurable Rate Tiers
                  </div>
                  {attraction.pricingRules?.map((rule: any) => (
                    <div
                      key={rule.id}
                      className="p-3.5 rounded-xl bg-oasis-navy border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-white">{rule.name}</div>
                        {rule.playsPerUnit && (
                          <div className="text-[11px] text-oasis-cyan font-semibold">
                            Grants {rule.playsPerUnit} Play Credit(s)
                          </div>
                        )}
                      </div>
                      <div className="text-lg font-black text-oasis-yellow">
                        {formatCurrency(rule.amountMinor, rule.currency)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Safety & Access Rules */}
                <div className="p-4 rounded-xl bg-oasis-navy/70 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-oasis-coral" /> Safety &amp; Access Guidelines
                  </div>
                  <ul className="space-y-1 text-slate-400">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Arrive at least 10 minutes before your scheduled time slot.
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {attraction.minAge
                        ? `Minimum participant age: ${attraction.minAge} years${
                            attraction.maxAge ? ` (up to ${attraction.maxAge} years)` : ''
                          }.`
                        : 'Suitable for visitors of all ages under marshal supervision.'}
                    </li>
                  </ul>
                </div>

                <Link
                  href={`/book?attraction=${attraction.slug}&date=${selectedDate}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-oasis-coral via-oasis-orange to-oasis-yellow text-oasis-navy shadow-lg hover:scale-[1.01] transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  Book {attraction.name} Now
                </Link>
              </div>
            </div>

            {/* Live Time Slot Availability Inspector */}
            {attraction.accessModel !== 'PAY_PER_PLAY' && (
              <section className="p-7 rounded-3xl bg-oasis-card border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-oasis-cyan">
                      Real-Time Inventory Engine
                    </span>
                    <h2 className="text-2xl font-black text-white mt-0.5">
                      Live Session Availability ({selectedDate})
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-oasis-yellow" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-oasis-cyan"
                    />
                  </div>
                </div>

                {slotsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-20 rounded-xl bg-oasis-navy animate-pulse border border-slate-800"
                      />
                    ))}
                  </div>
                ) : !availability?.slots?.length ? (
                  <div className="p-6 rounded-xl bg-oasis-navy text-xs text-slate-400">
                    No timed sessions scheduled for this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {availability.slots.slice(0, 24).map((slot: any) => {
                      const timeLabel = new Date(slot.startTime).toLocaleTimeString(
                        'en-NG',
                        {
                          timeZone: 'Africa/Lagos',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        },
                      );
                      return (
                        <Link
                          key={slot.id}
                          href={
                            slot.isBookable
                              ? `/book?attraction=${attraction.slug}&date=${selectedDate}&slot=${slot.id}`
                              : '#'
                          }
                          className={`p-3 rounded-xl border text-center transition-all ${
                            slot.isBookable
                              ? 'bg-oasis-navy hover:bg-oasis-purple/20 border-slate-700 hover:border-oasis-cyan cursor-pointer'
                              : 'bg-oasis-navy/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="text-sm font-black text-white">
                            {timeLabel}
                          </div>
                          <div
                            className={`text-[11px] font-semibold mt-1 ${
                              slot.availableCapacity > 5
                                ? 'text-emerald-400'
                                : slot.availableCapacity > 0
                                ? 'text-oasis-yellow'
                                : 'text-red-400'
                            }`}
                          >
                            {slot.availableCapacity > 0
                              ? `${slot.availableCapacity} left`
                              : 'Full'}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Related Attractions */}
            {related.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-2xl font-black text-white">
                  Other Popular Attractions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/attractions/${item.slug}`}
                      className="p-5 rounded-2xl bg-oasis-card border border-slate-800 hover:border-oasis-cyan/50 transition-all flex items-center gap-4"
                    >
                      <img
                        src={item.coverImageUrl}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-oasis-cyan">
                          {item.category?.name}
                        </div>
                        <div className="text-base font-bold text-white">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Explore sessions →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
