'use client';

import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Ticket,
  Calendar,
  Clock,
  User,
  CreditCard,
  Coins,
  CheckCircle2,
  Plus,
  Minus,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  QrCode,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

interface SelectedLine {
  key: string;
  label: string;
  unitPriceMinor: number;
  quantity: number;
  pricingRuleId?: string;
  packageId?: string;
  attractionId?: string;
  attractionSlug?: string;
  attractionName?: string;
  requiresTimedSlot: boolean;
  capacitySlotId?: string;
}

function BookingWizardInner() {
  const searchParams = useSearchParams();
  const initialAttractionSlug = searchParams.get('attraction') || '';
  const initialPackageId = searchParams.get('package') || '';
  const initialDate =
    searchParams.get('date') ||
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const initialSlotId = searchParams.get('slot') || '';

  const [step, setStep] = useState<number>(1);
  const [visitDate, setVisitDate] = useState<string>(initialDate);

  const [gaInfo, setGaInfo] = useState<any | null>(null);
  const [attractions, setAttractions] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedLines, setSelectedLines] = useState<Record<string, SelectedLine>>({});
  const [slotsByAttraction, setSlotsByAttraction] = useState<Record<string, any[]>>({});

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [serverQuote, setServerQuote] = useState<any | null>(null);
  const [activeHold, setActiveHold] = useState<any | null>(null);
  const [payMethod, setPayMethod] = useState<'bachs' | 'stablecoin'>('bachs');
  const [issuedTickets, setIssuedTickets] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial catalog & check if user is logged in
  useEffect(() => {
    async function initBookingData() {
      try {
        setLoading(true);
        const [gaRes, attrRes, pkgRes] = await Promise.all([
          apiClient<any>(
            `/availability/general-admission?date=${encodeURIComponent(visitDate)}`,
          ),
          apiClient<any[]>('/attractions'),
          apiClient<any[]>('/packages'),
        ]);
        setGaInfo(gaRes);
        setAttractions(attrRes || []);
        setPackages(pkgRes || []);

        // Pre-populate logged in user if available
        try {
          const me = await apiClient<any>('/auth/me');
          if (me?.email) {
            setEmail(me.email);
            setFirstName(me.firstName || '');
            setLastName(me.lastName || '');
          }
        } catch {
          // Guest visitor
        }

        // Pre-select from query parameters if provided
        const initialSelection: Record<string, SelectedLine> = {};
        if (initialAttractionSlug && attrRes?.length) {
          const foundAttr = attrRes.find((a) => a.slug === initialAttractionSlug);
          const firstRule = foundAttr?.pricingRules?.[0];
          if (foundAttr && firstRule) {
            const requiresTimed =
              foundAttr.accessModel === 'TIMED_SESSION' ||
              (foundAttr.accessModel === 'TIMED_AND_PAY_PER_PLAY' &&
                !firstRule.playsPerUnit);
            initialSelection[`rule_${firstRule.id}`] = {
              key: `rule_${firstRule.id}`,
              label: `${foundAttr.name} — ${firstRule.name}`,
              unitPriceMinor: firstRule.amountMinor,
              quantity: 1,
              pricingRuleId: firstRule.id,
              attractionId: foundAttr.id,
              attractionSlug: foundAttr.slug,
              attractionName: foundAttr.name,
              requiresTimedSlot: requiresTimed,
              capacitySlotId: initialSlotId || undefined,
            };
          }
        }
        if (initialPackageId && pkgRes?.length) {
          const foundPkg = pkgRes.find(
            (p) => p.id === initialPackageId || p.slug === initialPackageId,
          );
          if (foundPkg) {
            initialSelection[`pkg_${foundPkg.id}`] = {
              key: `pkg_${foundPkg.id}`,
              label: `Package: ${foundPkg.name}`,
              unitPriceMinor: foundPkg.priceMinor,
              quantity: 1,
              packageId: foundPkg.id,
              requiresTimedSlot: false,
            };
          }
        }
        if (Object.keys(initialSelection).length > 0) {
          setSelectedLines(initialSelection);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize booking catalog');
      } finally {
        setLoading(false);
      }
    }
    initBookingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh GA availability when visitDate changes
  useEffect(() => {
    if (!visitDate) return;
    apiClient<any>(
      `/availability/general-admission?date=${encodeURIComponent(visitDate)}`,
    )
      .then((res) => setGaInfo(res))
      .catch(() => {});
  }, [visitDate]);

  const activeItems = useMemo(() => {
    return Object.values(selectedLines).filter((line) => line.quantity > 0);
  }, [selectedLines]);

  const localTotalMinor = useMemo(() => {
    return activeItems.reduce(
      (sum, item) => sum + item.unitPriceMinor * item.quantity,
      0,
    );
  }, [activeItems]);

  const timedItems = useMemo(() => {
    return activeItems.filter((item) => item.requiresTimedSlot && item.attractionSlug);
  }, [activeItems]);

  const updateLineQuantity = (
    line: Omit<SelectedLine, 'quantity'>,
    delta: number,
  ) => {
    setSelectedLines((prev) => {
      const existing = prev[line.key];
      const nextQty = Math.max(0, (existing?.quantity || 0) + delta);
      if (nextQty === 0) {
        const copy = { ...prev };
        delete copy[line.key];
        return copy;
      }
      return {
        ...prev,
        [line.key]: {
          ...(existing || line),
          quantity: nextQty,
        },
      };
    });
  };

  // Load timed slots when advancing to Step 2
  const handleAdvanceToStep2 = async () => {
    setError(null);
    if (activeItems.length === 0) {
      setError('Please select at least one admission pass, attraction, or package.');
      return;
    }

    if (timedItems.length > 0) {
      setSubmitting(true);
      try {
        const map: Record<string, any[]> = {};
        for (const item of timedItems) {
          if (item.attractionSlug) {
            const avail = await apiClient<any>(
              `/availability?attraction=${encodeURIComponent(
                item.attractionSlug,
              )}&date=${encodeURIComponent(visitDate)}`,
            );
            const bookableSlots = (avail?.slots || []).filter(
              (s: any) => s.isBookable,
            );
            map[item.attractionSlug] = bookableSlots;

            // Default to first available slot if none chosen yet
            if (!item.capacitySlotId && bookableSlots.length > 0) {
              setSelectedLines((prev) => ({
                ...prev,
                [item.key]: {
                  ...prev[item.key],
                  capacitySlotId: bookableSlots[0].id,
                },
              }));
            }
          }
        }
        setSlotsByAttraction(map);
      } catch (err: any) {
        setError(err.message || 'Failed to load session time slots');
      } finally {
        setSubmitting(false);
      }
    }
    setStep(2);
  };

  const handleAdvanceToStep3 = () => {
    setError(null);
    for (const item of timedItems) {
      const current = selectedLines[item.key];
      if (!current?.capacitySlotId) {
        setError(`Please select an available time slot for ${item.label}.`);
        return;
      }
    }
    setStep(3);
  };

  // Step 3 -> Step 4: Calculate backend quote
  const handleCalculateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Please enter your first name, last name, and email address.');
      return;
    }

    try {
      setSubmitting(true);
      const quotePayload = {
        visitDate,
        promoCode: promoCode.trim() || undefined,
        items: activeItems.map((it) => ({
          pricingRuleId: it.pricingRuleId,
          packageId: it.packageId,
          attractionId: it.attractionId,
          capacitySlotId: it.capacitySlotId,
          quantity: it.quantity,
        })),
      };
      const quoteRes = await apiClient<any>('/bookings/quote', {
        method: 'POST',
        body: JSON.stringify(quotePayload),
      });
      setServerQuote(quoteRes);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Could not calculate booking quote');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 4 -> Step 5: Lock 15-minute capacity hold & proceed to payment choice
  const handleCreateHoldAndInitPayment = async () => {
    setError(null);
    try {
      setSubmitting(true);
      const holdPayload = {
        visitDate,
        promoCode: promoCode.trim() || undefined,
        notes: notes.trim() || undefined,
        customer: {
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phoneNumber.trim() || undefined,
        },
        items: activeItems.map((it) => ({
          pricingRuleId: it.pricingRuleId,
          packageId: it.packageId,
          attractionId: it.attractionId,
          capacitySlotId: it.capacitySlotId,
          quantity: it.quantity,
        })),
      };

      const holdRes = await apiClient<any>('/bookings/hold', {
        method: 'POST',
        body: JSON.stringify(holdPayload),
      });
      setActiveHold(holdRes);
      setStep(5);
    } catch (err: any) {
      setError(err.message || 'Could not create capacity hold');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 5: Launch hosted checkout for either Bachs (Card / Bank Transfer) or GemRails (USDT / USDC)
  const handleHostedCheckout = async (provider: 'bachs' | 'gemrails') => {
    if (!activeHold?.reference) return;
    setError(null);
    const label = provider === 'bachs' ? 'card / bank transfer' : 'stablecoin';
    try {
      setSubmitting(true);
      const res = await apiClient<any>(`/payments/${provider}/initialize`, {
        method: 'POST',
        body: JSON.stringify({
          bookingReference: activeHold.reference,
          returnOrigin: typeof window !== 'undefined' ? window.location.origin : undefined,
        }),
      });
      if (!res?.checkoutUrl) {
        throw new Error(`Could not start ${label} checkout`);
      }
      // Persist guest email & booking ref so the return page can display lookup links immediately.
      try {
        sessionStorage.setItem('oasis_pay_email', email.trim());
        sessionStorage.setItem('oasis_pay_booking', activeHold.reference);
        if (provider === 'gemrails') {
          sessionStorage.setItem('oasis_gr_email', email.trim());
        }
      } catch {
        // storage can be unavailable in private browsing
      }
      window.location.href = res.checkoutUrl;
    } catch (err: any) {
      setError(err.message || `Could not start ${label} checkout`);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-6 py-10">
      {/* Progress Stepper */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-oasis-purple/15 border border-oasis-purple/40 text-oasis-cyan text-xs font-bold uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Real-Time Reservation Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Book Your Oasis Experience
        </h1>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-6">
          {[
            { num: 1, title: '1. Select Passes' },
            { num: 2, title: '2. Time Slots' },
            { num: 3, title: '3. Guest Info' },
            { num: 4, title: '4. Review Quote' },
            { num: 5, title: '5. Payment' },
            { num: 6, title: '6. QR Tickets' },
          ].map((s) => (
            <div
              key={s.num}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                step === s.num
                  ? 'bg-oasis-cyan text-oasis-navy border-oasis-cyan shadow-lg'
                  : step > s.num
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-oasis-card text-slate-400 border-slate-800'
              }`}
            >
              {s.title}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs sm:text-sm mb-6 flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Step Container */}
        <div className="lg:col-span-8 space-y-6">
          {step === 1 && (
            <>
              {/* Visit Date Picker */}
              <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-oasis-yellow" />
                    Choose Your Visit Date
                  </label>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {gaInfo
                      ? `Park Hours: ${gaInfo.operatingHours?.open || '10:00'} – ${
                          gaInfo.operatingHours?.close || '21:00'
                        } WAT • ${gaInfo.availableCapacity} Daily Admission Spots Available`
                      : 'Checking daily park availability...'}
                  </p>
                </div>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-oasis-navy border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-oasis-cyan"
                />
              </div>

              {/* General Admission Section */}
              <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase text-oasis-cyan">
                    Park Entry
                  </span>
                  <h2 className="text-xl font-black text-white">
                    General Park Admission Passes
                  </h2>
                </div>
                <div className="space-y-3">
                  {(gaInfo?.pricingRules || []).map((rule: any) => {
                    const key = `ga_${rule.id}`;
                    const qty = selectedLines[key]?.quantity || 0;
                    return (
                      <div
                        key={rule.id}
                        className="p-4 rounded-xl bg-oasis-navy border border-slate-800 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="font-bold text-sm text-white">
                            {rule.name}
                          </div>
                          <div className="text-xs font-bold text-oasis-yellow mt-0.5">
                            {formatCurrency(rule.amountMinor, rule.currency)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              updateLineQuantity(
                                {
                                  key,
                                  label: rule.name,
                                  unitPriceMinor: rule.amountMinor,
                                  pricingRuleId: rule.id,
                                  requiresTimedSlot: false,
                                },
                                -1,
                              )
                            }
                            className="w-8 h-8 rounded-lg bg-oasis-card border border-slate-700 flex items-center justify-center text-white hover:border-oasis-cyan"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-black text-sm text-white">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateLineQuantity(
                                {
                                  key,
                                  label: rule.name,
                                  unitPriceMinor: rule.amountMinor,
                                  pricingRuleId: rule.id,
                                  requiresTimedSlot: false,
                                },
                                1,
                              )
                            }
                            className="w-8 h-8 rounded-lg bg-oasis-purple text-white flex items-center justify-center hover:opacity-90"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bundle Packages Section */}
              <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase text-oasis-yellow">
                    Save Up to 25%
                  </span>
                  <h2 className="text-xl font-black text-white">
                    All-In-One Value Packages
                  </h2>
                </div>
                <div className="space-y-3">
                  {packages.map((pkg) => {
                    const key = `pkg_${pkg.id}`;
                    const qty = selectedLines[key]?.quantity || 0;
                    return (
                      <div
                        key={pkg.id}
                        className="p-4 rounded-xl bg-oasis-navy border border-slate-800 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="font-bold text-sm text-white">
                            {pkg.name}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {pkg.description}
                          </p>
                          <div className="text-xs font-bold text-oasis-yellow mt-1">
                            {formatCurrency(pkg.priceMinor, pkg.currency)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              updateLineQuantity(
                                {
                                  key,
                                  label: `Package: ${pkg.name}`,
                                  unitPriceMinor: pkg.priceMinor,
                                  packageId: pkg.id,
                                  requiresTimedSlot: false,
                                },
                                -1,
                              )
                            }
                            className="w-8 h-8 rounded-lg bg-oasis-card border border-slate-700 flex items-center justify-center text-white"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-black text-sm text-white">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateLineQuantity(
                                {
                                  key,
                                  label: `Package: ${pkg.name}`,
                                  unitPriceMinor: pkg.priceMinor,
                                  packageId: pkg.id,
                                  requiresTimedSlot: false,
                                },
                                1,
                              )
                            }
                            className="w-8 h-8 rounded-lg bg-oasis-purple text-white flex items-center justify-center"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Individual Attractions & Play Packs */}
              <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase text-oasis-coral">
                    Timed Sessions &amp; Play Credits
                  </span>
                  <h2 className="text-xl font-black text-white">
                    Individual Attractions &amp; Arcade Packs
                  </h2>
                </div>
                <div className="space-y-4">
                  {attractions.map((attr) => (
                    <div
                      key={attr.id}
                      className="p-4 rounded-xl bg-oasis-navy border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-oasis-cyan">
                            {attr.category?.name}
                          </span>
                          <h3 className="text-base font-bold text-white">
                            {attr.name}
                          </h3>
                        </div>
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-oasis-card text-slate-300 border border-slate-700">
                          {attr.accessModel === 'PAY_PER_PLAY'
                            ? 'Pay-Per-Play'
                            : `${attr.sessionDurationMin} min session`}
                        </span>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        {(attr.pricingRules || []).map((rule: any) => {
                          const key = `rule_${rule.id}`;
                          const qty = selectedLines[key]?.quantity || 0;
                          const requiresTimed =
                            attr.accessModel === 'TIMED_SESSION' ||
                            (attr.accessModel === 'TIMED_AND_PAY_PER_PLAY' &&
                              !rule.playsPerUnit);
                          return (
                            <div
                              key={rule.id}
                              className="flex items-center justify-between gap-3 py-1"
                            >
                              <div>
                                <div className="text-xs sm:text-sm font-semibold text-slate-200">
                                  {rule.name}
                                </div>
                                <div className="text-xs font-bold text-oasis-yellow">
                                  {formatCurrency(rule.amountMinor, rule.currency)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateLineQuantity(
                                      {
                                        key,
                                        label: `${attr.name} — ${rule.name}`,
                                        unitPriceMinor: rule.amountMinor,
                                        pricingRuleId: rule.id,
                                        attractionId: attr.id,
                                        attractionSlug: attr.slug,
                                        attractionName: attr.name,
                                        requiresTimedSlot: requiresTimed,
                                      },
                                      -1,
                                    )
                                  }
                                  className="w-8 h-8 rounded-lg bg-oasis-card border border-slate-700 flex items-center justify-center text-white"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-6 text-center font-black text-sm text-white">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateLineQuantity(
                                      {
                                        key,
                                        label: `${attr.name} — ${rule.name}`,
                                        unitPriceMinor: rule.amountMinor,
                                        pricingRuleId: rule.id,
                                        attractionId: attr.id,
                                        attractionSlug: attr.slug,
                                        attractionName: attr.name,
                                        requiresTimedSlot: requiresTimed,
                                      },
                                      1,
                                    )
                                  }
                                  className="w-8 h-8 rounded-lg bg-oasis-purple text-white flex items-center justify-center"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleAdvanceToStep2}
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-oasis-coral via-oasis-orange to-oasis-yellow text-oasis-navy shadow-xl"
                >
                  {submitting ? 'Loading Time Slots...' : 'Continue to Time Slots'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase text-oasis-cyan">
                  Step 2 of 6 • Visit Date: {visitDate}
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  Select Your Session Time Slots
                </h2>
              </div>

              {timedItems.length === 0 ? (
                <div className="p-6 rounded-xl bg-oasis-navy border border-slate-800 text-sm text-slate-300 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>
                    Your selected passes are flexible Day Passes / Pay-Per-Play
                    credits and do not require a fixed session window. You may
                    proceed directly to Guest Details!
                  </span>
                </div>
              ) : (
                <div className="space-y-6">
                  {timedItems.map((item) => {
                    const slots =
                      (item.attractionSlug &&
                        slotsByAttraction[item.attractionSlug]) ||
                      [];
                    const chosenSlotId = selectedLines[item.key]?.capacitySlotId;
                    return (
                      <div
                        key={item.key}
                        className="p-5 rounded-xl bg-oasis-navy border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-white text-sm">
                            {item.label} (Qty: {item.quantity})
                          </div>
                          <span className="text-xs text-oasis-yellow font-semibold">
                            Choose 1 session window
                          </span>
                        </div>

                        {slots.length === 0 ? (
                          <div className="text-xs text-red-300">
                            No bookable slots found on {visitDate}. Try another date.
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                            {slots.slice(0, 18).map((slot: any) => {
                              const label = new Date(
                                slot.startTime,
                              ).toLocaleTimeString('en-NG', {
                                timeZone: 'Africa/Lagos',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              });
                              const isChosen = chosenSlotId === slot.id;
                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedLines((prev) => ({
                                      ...prev,
                                      [item.key]: {
                                        ...prev[item.key],
                                        capacitySlotId: slot.id,
                                      },
                                    }))
                                  }
                                  className={`p-2.5 rounded-xl border text-center transition-all ${
                                    isChosen
                                      ? 'bg-oasis-cyan text-oasis-navy border-oasis-cyan font-black'
                                      : 'bg-oasis-card text-white border-slate-700 hover:border-oasis-cyan'
                                  }`}
                                >
                                  <div className="text-xs font-bold">{label}</div>
                                  <div className="text-[10px] opacity-80">
                                    {slot.availableCapacity} left
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold bg-oasis-navy text-slate-300 border border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleAdvanceToStep3}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-oasis-coral to-oasis-orange text-oasis-navy"
                >
                  Continue to Visitor Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form
              onSubmit={handleCalculateQuote}
              className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-5"
            >
              <div>
                <span className="text-xs font-bold uppercase text-oasis-cyan">
                  Step 3 of 6 • Guest or Member Checkout
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  Visitor Contact Details
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Your digital QR tickets and booking reference will be linked to
                  this email address.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Ada"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Okonkwo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="visitor@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+234 801 234 5678"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Promo Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="OASIS2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Special Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Birthday celebration, group request..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold bg-oasis-navy text-slate-300 border border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-oasis-coral to-oasis-orange text-oasis-navy"
                >
                  {submitting ? 'Calculating Quote...' : 'Review Verified Quote'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 4 && serverQuote && (
            <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase text-oasis-cyan">
                  Step 4 of 6 • Backend-Verified Quote
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  Review Your Order &amp; Lock Capacity
                </h2>
              </div>

              <div className="space-y-2.5">
                {serverQuote.items?.map((it: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-oasis-navy border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{it.name}</div>
                      <div className="text-xs text-slate-400">
                        Qty: {it.quantity} ×{' '}
                        {formatCurrency(it.unitPriceMinor, serverQuote.currency)}
                        {it.playsPerUnit
                          ? ` • ${it.playsPerUnit * it.quantity} Play Credits`
                          : ''}
                      </div>
                    </div>
                    <div className="font-black text-white">
                      {formatCurrency(it.subtotalMinor, serverQuote.currency)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-oasis-navy/80 border border-oasis-purple/40 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Total Amount Due</div>
                  <div className="text-2xl font-black text-oasis-yellow">
                    {formatCurrency(
                      serverQuote.totalAmountMinor,
                      serverQuote.currency,
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-300">
                  <div>
                    Visitor: {firstName} {lastName}
                  </div>
                  <div className="text-oasis-cyan">{email}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold bg-oasis-navy text-slate-300 border border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" /> Edit Details
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCreateHoldAndInitPayment}
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-oasis-purple via-oasis-coral to-oasis-orange text-white shadow-xl"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {submitting
                    ? 'Reserving Capacity Hold...'
                    : 'Lock 15-Min Hold & Proceed to Payment'}
                </button>
              </div>
            </div>
          )}

          {step === 5 && activeHold && (
            <div className="p-7 rounded-2xl bg-oasis-card border border-oasis-cyan/40 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-400">
                    Step 5 of 6 • Capacity Locked for 15 Minutes
                  </span>
                  <h2 className="text-2xl font-black text-white mt-1">
                    {payMethod === 'stablecoin'
                      ? 'Pay with USDT / USDC'
                      : 'Complete Card / Bank Transfer Checkout'}
                  </h2>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs font-mono text-oasis-yellow">
                  Ref: {activeHold.reference}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-oasis-navy border border-slate-800 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Booking Reference:</span>
                  <span className="font-bold text-white">{activeHold.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hold Expires At:</span>
                  <span className="text-oasis-yellow">
                    {new Date(activeHold.holdExpiresAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-base">
                  <span className="font-bold text-white">Amount to Pay:</span>
                  <span className="font-black text-oasis-yellow">
                    {formatCurrency(activeHold.totalAmountMinor, activeHold.currency)}
                  </span>
                </div>
              </div>

              <div
                role="radiogroup"
                aria-label="Payment method"
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={payMethod === 'bachs'}
                  onClick={() => setPayMethod('bachs')}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    payMethod === 'bachs'
                      ? 'border-oasis-cyan bg-oasis-cyan/10 shadow-[0_0_20px_rgba(0,240,255,0.12)]'
                      : 'border-slate-700 bg-oasis-navy hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <CreditCard className="w-4 h-4 text-oasis-cyan" /> Card / Bank Transfer (Bachs)
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Pay securely with NGN bank transfer, Nigerian cards, or international cards.
                  </p>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={payMethod === 'stablecoin'}
                  onClick={() => setPayMethod('stablecoin')}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    payMethod === 'stablecoin'
                      ? 'border-emerald-400 bg-emerald-400/10 shadow-[0_0_20px_rgba(52,211,153,0.15)]'
                      : 'border-slate-700 bg-oasis-navy hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <Coins className="w-4 h-4 text-emerald-300" /> Stablecoins (USDT / USDC)
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Pay from your crypto wallet via GemRails. No crypto know-how needed.
                  </p>
                </button>
              </div>

              {payMethod === 'stablecoin' ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleHostedCheckout('gemrails')}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-base bg-gradient-to-r from-emerald-400 to-teal-300 text-oasis-navy shadow-xl hover:opacity-95 transition-all disabled:opacity-60"
                >
                  <Coins className="w-5 h-5" />
                  {submitting
                    ? 'Opening secure stablecoin checkout...'
                    : `Pay ${formatCurrency(
                        activeHold.totalAmountMinor,
                        activeHold.currency,
                      )} with USDT / USDC`}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleHostedCheckout('bachs')}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-base bg-gradient-to-r from-emerald-400 to-oasis-cyan text-oasis-navy shadow-xl hover:opacity-95 transition-all disabled:opacity-60"
                >
                  <CreditCard className="w-5 h-5" />
                  {submitting
                    ? 'Opening secure Bachs checkout...'
                    : `Pay ${formatCurrency(
                        activeHold.totalAmountMinor,
                        activeHold.currency,
                      )} via Card / Bank Transfer`}
                </button>
              )}
            </div>
          )}

          {step === 6 && activeHold && (
            <div className="p-7 rounded-3xl bg-oasis-card border border-emerald-500/40 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-400">
                    Booking Confirmed &amp; Paid
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Your Digital QR Tickets Are Ready!
                  </h2>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-oasis-navy border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  Booking Reference:{' '}
                  <span className="font-mono font-black text-oasis-yellow text-sm">
                    {activeHold.reference}
                  </span>
                </div>
                <div>
                  Sent to: <span className="font-bold text-oasis-cyan">{email}</span>
                </div>
              </div>

              {issuedTickets.length > 0 && (() => {
                const masterTicket = issuedTickets[0];
                return (
                  <div className="p-6 rounded-2xl bg-oasis-navy border border-oasis-cyan/30 flex flex-col md:flex-row items-center gap-7">
                    <div className="flex flex-col items-center text-center space-y-2.5 flex-shrink-0">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        All-In-One Master QR Pass
                      </span>
                      {masterTicket.qrDataUrl && (
                        <img
                          src={masterTicket.qrDataUrl}
                          alt={masterTicket.ticketCode}
                          className="w-48 h-48 rounded-2xl border-4 border-white shadow-xl"
                        />
                      )}
                      <div className="font-mono text-sm font-black text-oasis-yellow">
                        {activeHold.reference}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Scan once at the gate to view &amp; admit all passes
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Included Passes ({issuedTickets.length}) • Visitor:{' '}
                        <span className="text-white">
                          {masterTicket.visitorName || `${firstName} ${lastName}`}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {issuedTickets.map((tkt: any) => (
                          <div
                            key={tkt.id}
                            className="p-3.5 rounded-xl bg-oasis-card border border-slate-800 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="font-bold text-white">{tkt.title}</div>
                              <div className="font-mono text-[11px] text-oasis-cyan">
                                {tkt.ticketCode}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-oasis-yellow">
                                {tkt.remainingQuantity} / {tkt.totalQuantity}
                              </span>
                              <div className="text-[10px] text-slate-400">
                                Valid Admissions
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-oasis-purple text-white"
                >
                  Print / Save PDF Passes
                </button>
                <Link
                  href={`/lookup?ref=${encodeURIComponent(
                    activeHold.reference,
                  )}&email=${encodeURIComponent(email)}`}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-oasis-navy text-oasis-cyan border border-slate-700"
                >
                  Open in Ticket Lookup
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Live Order Summary Sidebar */}
        <aside className="lg:col-span-4 p-6 rounded-2xl bg-oasis-card border border-slate-800 sticky top-24 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-black text-white text-base flex items-center gap-2">
              <Ticket className="w-4 h-4 text-oasis-coral" /> Order Summary
            </h3>
            <span className="text-xs font-bold text-oasis-cyan">{visitDate}</span>
          </div>

          {activeItems.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No passes selected yet. Use the + buttons to add General Admission,
              packages, or attraction sessions.
            </p>
          ) : (
            <div className="space-y-3">
              {activeItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-start justify-between gap-2 text-xs border-b border-slate-800/70 pb-2.5"
                >
                  <div>
                    <div className="font-bold text-slate-200">{item.label}</div>
                    <div className="text-slate-400">
                      {item.quantity} × {formatCurrency(item.unitPriceMinor, 'NGN')}
                    </div>
                  </div>
                  <div className="font-bold text-white whitespace-nowrap">
                    {formatCurrency(item.unitPriceMinor * item.quantity, 'NGN')}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Estimated Total</span>
            <span className="text-xl font-black text-oasis-yellow">
              {formatCurrency(
                serverQuote?.totalAmountMinor ?? localTotalMinor,
                'NGN',
              )}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-oasis-navy/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-oasis-cyan" /> Instant Digital Delivery
            </div>
            <p>
              Capacity is locked for 15 minutes at checkout. Partial group
              check-in is supported on all multi-guest passes.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-oasis-navy">
      <SiteHeader />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="h-96 rounded-3xl bg-oasis-card/60 animate-pulse border border-slate-800" />
            </div>
          }
        >
          <BookingWizardInner />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
