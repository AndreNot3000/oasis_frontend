'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

export function BookingsPaymentsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const qParams = new URLSearchParams();
      if (statusFilter) qParams.set('status', statusFilter);
      if (searchQuery.trim()) qParams.set('search', searchQuery.trim());

      const [bData, pData] = await Promise.all([
        apiClient<any[]>(`/admin/bookings?${qParams.toString()}`),
        apiClient<any[]>('/admin/payments'),
      ]);
      setBookings(bData || []);
      setPayments(pData || []);
    } catch (err: any) {
      setError(err.message || 'Unable to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleVerifyOfflinePayment = async (booking: any) => {
    const receiptNote = window.prompt(
      `Enter verified receipt/POS slip or bank transfer session ID for ${booking.reference}:`,
      'Verified Bank Transfer / POS Slip',
    );
    if (!receiptNote) return;
    setError(null);
    setMessage(null);
    try {
      await apiClient('/payments/admin/offline', {
        method: 'POST',
        body: JSON.stringify({
          bookingReference: booking.reference,
          channel: 'OFFLINE_BANK_TRANSFER',
          amountMinor: booking.totalAmountMinor,
          receiptNote,
        }),
      });
      setMessage(`Offline payment verified and tickets issued for ${booking.reference}`);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Offline payment verification failed');
    }
  };

  const handleCancelBooking = async (booking: any) => {
    const reason = window.prompt(
      `Enter cancellation reason for ${booking.reference}:`,
      'Customer requested cancellation',
    );
    if (!reason) return;
    setError(null);
    setMessage(null);
    try {
      await apiClient(`/admin/bookings/${encodeURIComponent(booking.id)}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      setMessage(`Booking ${booking.reference} cancelled and capacity released.`);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Could not cancel booking');
    }
  };

  const handleRefundBooking = async (booking: any) => {
    const reason = window.prompt(
      `Enter refund reason for ${booking.reference} (${formatCurrency(
        booking.totalAmountMinor,
        booking.currency,
      )}):`,
      'Approved refund per park policy',
    );
    if (!reason) return;
    setError(null);
    setMessage(null);
    try {
      await apiClient(`/admin/bookings/${encodeURIComponent(booking.id)}/refund`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      setMessage(`Refund recorded and capacity released for ${booking.reference}.`);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Could not process refund');
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Bookings Management Table */}
      <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase text-oasis-cyan">
              Reservations &amp; Refunds
            </span>
            <h2 className="text-xl font-black text-white">
              All Bookings ({bookings.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                placeholder="Ref, name, or email..."
                className="pl-8 pr-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs font-bold text-white"
            >
              <option value="">All Statuses</option>
              <option value="AWAITING_PAYMENT">Awaiting Payment</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PARTIALLY_CHECKED_IN">Partially Checked In</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <button
              type="button"
              onClick={loadData}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-oasis-purple text-white"
            >
              Search
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase">
                <th className="py-3 pr-3">Reference</th>
                <th className="py-3 pr-3">Customer</th>
                <th className="py-3 pr-3">Items</th>
                <th className="py-3 pr-3">Amount</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading bookings...
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const custEmail =
                    b.customer?.guestEmail || b.customer?.user?.email || 'Walk-in';
                  const custName = `${
                    b.customer?.guestFirstName || b.customer?.user?.firstName || ''
                  } ${
                    b.customer?.guestLastName || b.customer?.user?.lastName || ''
                  }`.trim();
                  return (
                    <tr key={b.id} className="hover:bg-oasis-navy/40">
                      <td className="py-3 pr-3 font-mono font-bold text-oasis-yellow whitespace-nowrap">
                        {b.reference}
                        {b.isWalkIn && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-oasis-purple/20 text-oasis-cyan text-[10px] font-sans">
                            POS
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <div className="font-bold text-white">
                          {custName || 'Guest'}
                        </div>
                        <div className="text-[11px] text-slate-400">{custEmail}</div>
                      </td>
                      <td className="py-3 pr-3 text-slate-300 max-w-xs truncate">
                        {(b.items || [])
                          .map((i: any) => `${i.quantity}× ${i.itemName}`)
                          .join(', ')}
                      </td>
                      <td className="py-3 pr-3 font-bold text-white whitespace-nowrap">
                        {formatCurrency(b.totalAmountMinor, b.currency)}
                      </td>
                      <td className="py-3 pr-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-oasis-navy text-oasis-cyan border border-slate-700">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                        {b.status === 'AWAITING_PAYMENT' && (
                          <button
                            type="button"
                            onClick={() => handleVerifyOfflinePayment(b)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold hover:bg-emerald-500/30"
                          >
                            Verify Payment
                          </button>
                        )}
                        {(b.status === 'AWAITING_PAYMENT' ||
                          b.status === 'CONFIRMED') && (
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(b)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/15 text-red-300 border border-red-500/30 font-bold hover:bg-red-500/25"
                          >
                            <XCircle className="w-3 h-3" /> Cancel
                          </button>
                        )}
                        {(b.status === 'CONFIRMED' ||
                          b.status === 'PARTIALLY_CHECKED_IN') && (
                          <button
                            type="button"
                            onClick={() => handleRefundBooking(b)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold hover:bg-amber-500/25"
                          >
                            <RotateCcw className="w-3 h-3" /> Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Ledger & Reconciliation */}
      <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-4">
        <div>
          <span className="text-xs font-bold uppercase text-oasis-yellow">
            Financial Ledger
          </span>
          <h3 className="text-lg font-black text-white">
            Recent Payment &amp; Reconciliation Records ({payments.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase">
                <th className="py-2.5 pr-3">Provider Ref</th>
                <th className="py-2.5 pr-3">Booking</th>
                <th className="py-2.5 pr-3">Channel</th>
                <th className="py-2.5 pr-3">Amount</th>
                <th className="py-2.5 pr-3">Status</th>
                <th className="py-2.5">Receipt / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {payments.slice(0, 20).map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5 pr-3 font-mono text-oasis-cyan">
                    {p.providerReference}
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-oasis-yellow font-bold">
                    {p.booking?.reference}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-300">{p.channel}</td>
                  <td className="py-2.5 pr-3 font-bold text-white">
                    {formatCurrency(p.amountMinor, p.currency)}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        p.status === 'SUCCESS'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : p.status === 'REQUIRES_REVIEW'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-400">
                    {p.offlineReceiptNote || 'Online Paystack Gateway'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
