'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Gift,
  CheckCircle2,
  Ticket,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { PackageGridSkeleton } from '@/components/oasis-skeleton';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient<any[]>('/packages')
      .then((res) => setPackages(res || []))
      .catch((err) => setError(err.message || 'Unable to load packages'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-oasis-navy">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-oasis-yellow/10 border border-oasis-yellow/30 text-oasis-yellow text-xs font-bold uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Bundle &amp; Save
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Park Packages &amp; Value Bundles
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
            Combine General Admission, timed attractions, and pay-per-play arcade
            credits in a single pass. Every confirmed booking locks in your snapshot
            bundle rate.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-200 text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <PackageGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-3xl overflow-hidden bg-oasis-card border border-oasis-purple/40 shadow-2xl flex flex-col"
              >
                {pkg.coverImageUrl && (
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={pkg.coverImageUrl}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-oasis-navy/90 text-oasis-yellow border border-oasis-yellow/30">
                      <Gift className="w-3.5 h-3.5" /> Official Oasis Bundle
                    </div>
                  </div>
                )}

                <div className="p-7 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-2xl font-black text-white">{pkg.name}</h2>
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400">Bundle Price</div>
                        <div className="text-2xl font-black text-oasis-yellow">
                          {formatCurrency(pkg.priceMinor, pkg.currency)}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      {pkg.description}
                    </p>

                    {pkg.items?.length > 0 && (
                      <div className="p-4 rounded-2xl bg-oasis-navy border border-slate-800 space-y-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-oasis-cyan">
                          Included Attractions &amp; Entitlements
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-200">
                          {pkg.items.map((it: any) => (
                            <li key={it.id} className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              <span>
                                <strong>{it.quantity}×</strong> {it.attraction?.name}{' '}
                                {it.isPayPerPlay
                                  ? '(Pay-Per-Play Credits automatically loaded)'
                                  : `(${it.attraction?.sessionDurationMin || 15} min session)`}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-oasis-cyan" /> Instant QR
                      Pass + Play Credits
                    </span>
                    <Link
                      href={`/book?package=${pkg.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-oasis-coral via-oasis-orange to-oasis-yellow text-oasis-navy shadow-lg"
                    >
                      <Ticket className="w-4 h-4" />
                      Book This Package
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
