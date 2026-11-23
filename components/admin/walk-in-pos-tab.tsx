'use client';

import React, { useEffect, useState } from 'react';
import {
  Ticket,
  Plus,
  Minus,
  CheckCircle2,
  Printer,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

export function WalkInPosTab({ onBookingCreated }: { onBookingCreated?: () => void }) {
  const [visitDate, setVisitDate] = useState<string>(
    () => new Date().toISOString().split('T')[0],
  );
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [attractions, setAttractions] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [slotsByAttraction, setSlotsByAttraction] = useState<Record<string, any[]>>({});

  const [firstName, setFirstName] = useState('Walk-In');
  const [lastName, setLastName] = useState('Guest');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentChannel, setPaymentChannel] = useState<string>('OFFLINE_POS');
  const [receiptNote, setReceiptNote] = useState('Counter Terminal #1 - Approved');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedReceipt, setConfirmedReceipt] = useState<any | null>(null);
  const [issuedTickets, setIssuedTickets] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      apiClient<any[]>('/pricing-rules'),
      apiClient<any[]>('/attractions'),
    ])
      .then(([rules, attrs]) => {
        setPricingRules(rules || []);
        setAttractions(attrs || []);
      })
      .catch(() => {});
  }, []);

  const loadSlotsForAttraction = async (attractionId: string) => {
    try {
      const avail = await apiClient<any>(
        `/availability?attraction=${encodeURIComponent(
          attractionId,
        )}&date=${encodeURIComponent(visitDate)}`,
      );
      const bookable = (avail?.slots || []).filter((s: any) => s.isBookable);
      setSlotsByAttraction((prev) => ({ ...prev, [attractionId]: bookable }));
      if (bookable.length > 0 && !selectedSlots[attractionId]) {
        setSelectedSlots((prev) => ({ ...prev, [attractionId]: bookable[0].id }));
      }
    } catch {
      // ignore
    }
  };

  const changeRuleQty = (rule: any, delta: number) => {
    const next = Math.max(0, (quantities[rule.id] || 0) + delta);
    setQuantities((prev) => {
      const copy = { ...prev };
      if (next === 0) delete copy[rule.id];
      else copy[rule.id] = next;
      return copy;
    });
    if (next > 0 && rule.attractionId && !rule.playsPerUnit) {
      loadSlotsForAttraction(rule.attractionId);
    }
  };

  const selectedRules = pricingRules.filter((r) => (quantities[r.id] || 0) > 0);
  const totalMinor = selectedRules.reduce(
    (sum, r) => sum + r.amountMinor * (quantities[r.id] || 0),
    0,
  );

  const handleProcessWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (selectedRules.length === 0) {
      setError('Select at least one admission or attraction pass.');
      return;
    }
    if (!receiptNote.trim()) {
      setError('Enter the POS slip number, cash register receipt, or transfer reference.');
      return;
    }

    try {
      setSubmitting(true);
      const items = selectedRules.map((r) => {
        const attr = attractions.find((a) => a.id === r.attractionId);
        const needsSlot =
          attr &&
          (attr.accessModel === 'TIMED_SESSION' ||
            (attr.accessModel === 'TIMED_AND_PAY_PER_PLAY' && !r.playsPerUnit));
        return {
          pricingRuleId: r.id,
          attractionId: r.attractionId || undefined,
          capacitySlotId: needsSlot ? selectedSlots[r.attractionId] : undefined,
          quantity: quantities[r.id],
        };
      });

      const res = await apiClient<any>('/admin/walk-ins', {
        method: 'POST',
        body: JSON.stringify({
          visitDate,
          items,
          customer: {
            firstName: firstName.trim() || 'Walk-In',
            lastName: lastName.trim() || 'Guest',
            email: email.trim() || undefined,
            phoneNumber: phoneNumber.trim() || undefined,
          },
          paymentChannel,
          receiptNote: receiptNote.trim(),
        }),
      });

      setConfirmedReceipt(res);
      const tktRes = await apiClient<any>(
        `/tickets/${encodeURIComponent(res.bookingReference)}`,
      );
      setIssuedTickets(tktRes?.tickets || []);
      setQuantities({});
      if (onBookingCreated) onBookingCreated();
    } catch (err: any) {
      setError(err.message || 'Walk-in transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase text-oasis-cyan">
              Unified Inventory Terminal
            </span>
            <h2 className="text-xl font-black text-white">
              Walk-In Point-Of-Sale Counter
            </h2>
          </div>
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs font-bold text-white"
          />
        </div>

        <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
          {pricingRules.map((rule) => {
            const qty = quantities[rule.id] || 0;
            const attr = attractions.find((a) => a.id === rule.attractionId);
            const needsSlot =
              qty > 0 &&
              attr &&
              (attr.accessModel === 'TIMED_SESSION' ||
                (attr.accessModel === 'TIMED_AND_PAY_PER_PLAY' &&
                  !rule.playsPerUnit));
            const slots = (rule.attractionId && slotsByAttraction[rule.attractionId]) || [];

            return (
              <div
                key={rule.id}
                className="p-3.5 rounded-xl bg-oasis-navy border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-oasis-cyan">
                      {rule.isAdmission
                        ? 'General Admission'
                        : rule.attraction?.name || 'Activity'}
                    </div>
                    <div className="text-sm font-bold text-white">{rule.name}</div>
                    <div className="text-xs font-bold text-oasis-yellow">
                      {formatCurrency(rule.amountMinor, rule.currency)}
                      {rule.playsPerUnit
                        ? ` (${rule.playsPerUnit} Play Credits)`
                        : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeRuleQty(rule, -1)}
                      className="w-8 h-8 rounded-lg bg-oasis-card border border-slate-700 flex items-center justify-center text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-black text-sm text-white">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeRuleQty(rule, 1)}
                      className="w-8 h-8 rounded-lg bg-oasis-purple text-white flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {needsSlot && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400">Select Session Slot:</span>
                    <select
                      value={selectedSlots[rule.attractionId] || ''}
                      onChange={(e) =>
                        setSelectedSlots((prev) => ({
                          ...prev,
                          [rule.attractionId]: e.target.value,
                        }))
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-oasis-card border border-slate-700 text-xs text-white"
                    >
                      {slots.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {new Date(s.startTime).toLocaleTimeString('en-NG', {
                            timeZone: 'Africa/Lagos',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}{' '}
                          ({s.availableCapacity} left)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Payment Recording & Instant Ticket Output */}
      <div className="lg:col-span-5 space-y-6">
        <form
          onSubmit={handleProcessWalkIn}
          className="p-6 rounded-2xl bg-oasis-card border border-oasis-purple/40 space-y-4"
        >
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Ticket className="w-4 h-4 text-oasis-coral" /> Walk-In Checkout &amp;
            Offline Payment
          </h3>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Visitor First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Visitor Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Payment Method *
              </label>
              <select
                value={paymentChannel}
                onChange={(e) => setPaymentChannel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs font-bold text-white"
              >
                <option value="OFFLINE_POS">Venue POS Terminal</option>
                <option value="OFFLINE_CASH">Physical Cash</option>
                <option value="OFFLINE_BANK_TRANSFER">Verified Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Visitor Phone / Email
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="optional@email.com"
                className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Staff Verification / Receipt Note *
            </label>
            <input
              type="text"
              required
              value={receiptNote}
              onChange={(e) => setReceiptNote(e.target.value)}
              placeholder="POS Slip # / Bank Transfer Session ID / Cash Drawer #"
              className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-oasis-navy border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">
              Total Collected ({selectedRules.length} item types)
            </span>
            <span className="text-xl font-black text-oasis-yellow">
              {formatCurrency(totalMinor, 'NGN')}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-oasis-coral via-oasis-orange to-oasis-yellow text-oasis-navy shadow-lg"
          >
            {submitting
              ? 'Confirming Walk-In & Generating Tickets...'
              : `Confirm Walk-In Sale (${formatCurrency(totalMinor, 'NGN')})`}
          </button>
        </form>

        {confirmedReceipt && (
          <div className="p-6 rounded-2xl bg-oasis-card border border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                <CheckCircle2 className="w-5 h-5" />
                Walk-In Confirmed: {confirmedReceipt.bookingReference}
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-oasis-purple text-white"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {issuedTickets.map((tkt) => (
                <div
                  key={tkt.id}
                  className="p-4 rounded-xl bg-oasis-navy border border-slate-700 flex items-center gap-4"
                >
                  {tkt.qrDataUrl && (
                    <img
                      src={tkt.qrDataUrl}
                      alt={tkt.ticketCode}
                      className="w-24 h-24 rounded-lg border-2 border-white flex-shrink-0"
                    />
                  )}
                  <div className="text-xs space-y-1">
                    <div className="font-black text-white text-sm">
                      {tkt.title}
                    </div>
                    <div className="font-mono text-oasis-yellow font-bold">
                      {tkt.ticketCode}
                    </div>
                    <div className="text-slate-400">
                      Valid Admissions: {tkt.totalQuantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
