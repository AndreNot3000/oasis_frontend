'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  Users,
  Ticket,
  Sparkles,
  Filter,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { AttractionGridSkeleton } from '@/components/oasis-skeleton';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

export default function AttractionsCatalogPage() {
  const [attractions, setAttractions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAccess, setSelectedAccess] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        setLoading(true);
        const [attrRes, catRes] = await Promise.all([
          apiClient<any[]>('/attractions'),
          apiClient<any[]>('/categories'),
        ]);
        setAttractions(attrRes || []);
        setCategories(catRes || []);
      } catch (err: any) {
        setError(err.message || 'Unable to load attractions catalog');
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  const filteredAttractions = useMemo(() => {
    return attractions.filter((item) => {
      const matchesCat =
        selectedCategory === 'ALL' || item.category?.slug === selectedCategory;
      const matchesAccess =
        selectedAccess === 'ALL' || item.accessModel === selectedAccess;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category?.name?.toLowerCase().includes(q);
      return matchesCat && matchesAccess && matchesSearch;
    });
  }, [attractions, selectedCategory, selectedAccess, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-oasis-navy">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-oasis-cyan/10 border border-oasis-cyan/30 text-oasis-cyan text-xs font-bold uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Signature Zones
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Attractions &amp; Game Arenas
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
            Browse every experience at Oasis Amusement Park. Filter by category
            or access model, inspect age and session rules, and reserve your
            timed session or play-credit pass online.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-5 rounded-2xl bg-oasis-card border border-slate-800 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search VR, bumper cars, trampolines, F1 simulators, arcade..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-oasis-cyan"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-oasis-purple flex-shrink-0" />
              <select
                value={selectedAccess}
                onChange={(e) => setSelectedAccess(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-oasis-navy border border-slate-700 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-oasis-cyan"
              >
                <option value="ALL">All Access Models</option>
                <option value="TIMED_SESSION">Timed Sessions Only</option>
                <option value="PAY_PER_PLAY">Pay-Per-Play Credits</option>
                <option value="TIMED_AND_PAY_PER_PLAY">Timed &amp; Pay-Per-Play</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-oasis-cyan text-oasis-navy shadow'
                  : 'bg-oasis-navy text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              All Categories ({attractions.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-oasis-cyan text-oasis-navy shadow'
                    : 'bg-oasis-navy text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <AttractionGridSkeleton count={8} />
        ) : filteredAttractions.length === 0 ? (
          <div className="p-12 rounded-2xl bg-oasis-card border border-slate-800 text-center space-y-3">
            <div className="text-lg font-bold text-white">
              No attractions match your filter
            </div>
            <p className="text-xs text-slate-400">
              Try clearing your search keyword or selecting All Categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedAccess('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-oasis-purple text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAttractions.map((item) => {
              const lowestRule = item.pricingRules?.[0];
              return (
                <div
                  key={item.id}
                  className="rounded-2xl overflow-hidden bg-oasis-card border border-slate-800 hover:border-oasis-cyan/50 transition-all flex flex-col shadow-xl group"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={item.coverImageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-oasis-navy/90 text-oasis-cyan border border-oasis-cyan/30">
                      {item.category?.name}
                    </div>
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-oasis-navy/90 text-oasis-yellow border border-oasis-yellow/30">
                      {item.accessModel.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-xl font-black text-white mb-2 group-hover:text-oasis-cyan transition-colors">
                      {item.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mb-5 flex-1 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-oasis-navy/70 p-3 rounded-xl border border-slate-800 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-oasis-cyan" />
                        <span>
                          {item.accessModel === 'PAY_PER_PLAY'
                            ? 'Credit Pass'
                            : `${item.sessionDurationMin} mins`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-oasis-coral" />
                        <span>
                          {item.minAge ? `Ages ${item.minAge}+` : 'All Ages'} • Up to {item.maxPlayers}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-[11px] text-slate-400">Starting Rate</div>
                        <div className="text-lg font-black text-white">
                          {lowestRule
                            ? formatCurrency(lowestRule.amountMinor, lowestRule.currency)
                            : 'Configurable'}
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-400">
                        {item._count?.resources || 1} Bookable Unit(s)
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Link
                        href={`/attractions/${item.slug}`}
                        className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold bg-oasis-navy hover:bg-oasis-navyLight text-white border border-slate-700 transition-colors"
                      >
                        View Details &amp; Slots
                      </Link>
                      <Link
                        href={`/book?attraction=${item.slug}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-oasis-coral to-oasis-orange text-oasis-navy hover:opacity-95 transition-opacity"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
