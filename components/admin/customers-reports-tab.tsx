'use client';

import React, { useEffect, useState } from 'react';
import {
  Gamepad2,
  BarChart3,
  Settings,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

export function CustomersReportsTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [reports, setReports] = useState<any | null>(null);
  const [settings, setSettings] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [dailyCap, setDailyCap] = useState<number>(500);
  const [holdMinutes, setHoldMinutes] = useState<number>(15);
  const [contactPhone, setContactPhone] = useState<string>('');

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAll = async () => {
    try {
      const [custRes, repRes, setRes, logRes] = await Promise.all([
        apiClient<any[]>('/admin/customers'),
        apiClient<any>('/admin/reports'),
        apiClient<any>('/admin/settings'),
        apiClient<any[]>('/admin/audit-logs'),
      ]);
      setCustomers(custRes || []);
      setReports(repRes);
      setSettings(setRes);
      setAuditLogs(logRes || []);
      if (setRes) {
        setDailyCap(setRes.dailyAdmissionCapacity || 500);
        setHoldMinutes(setRes.holdDurationMinutes || 15);
        setContactPhone(setRes.contactPhone || '');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load reports and settings');
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleRedeemPlay = async (entitlementId: string) => {
    const station = window.prompt(
      'Enter machine / station identifier:',
      'Arcade Cabinet #04',
    );
    if (!station) return;
    setError(null);
    setMessage(null);
    try {
      const res = await apiClient<any>('/play/redeem', {
        method: 'POST',
        body: JSON.stringify({
          entitlementId,
          playsToRedeem: 1,
          stationIdentifier: station,
        }),
      });
      setMessage(
        `Redeemed 1 play at ${res.stationIdentifier}. Remaining balance: ${res.remainingPlays}`,
      );
      await loadAll();
    } catch (err: any) {
      setError(err.message || 'Could not redeem play credit');
    }
  };

  const handleAdjustPlayBalance = async (entitlementId: string) => {
    const deltaStr = window.prompt(
      'Enter credit adjustment delta (e.g. +2 for bonus or -1 for deduction):',
      '2',
    );
    if (!deltaStr) return;
    const reason = window.prompt(
      'Enter mandatory audit reason for balance adjustment:',
      'Courtesy bonus play adjustment',
    );
    if (!reason) return;
    setError(null);
    setMessage(null);
    try {
      await apiClient('/play/admin/adjust', {
        method: 'POST',
        body: JSON.stringify({
          entitlementId,
          deltaPlays: Number(deltaStr),
          reason,
        }),
      });
      setMessage('Play-credit balance adjusted and recorded in AuditLog.');
      await loadAll();
    } catch (err: any) {
      setError(err.message || 'Balance adjustment failed');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await apiClient('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          dailyAdmissionCapacity: Number(dailyCap),
          holdDurationMinutes: Number(holdMinutes),
          contactPhone,
        }),
      });
      setMessage('Venue operational settings updated and logged in AuditLog.');
      await loadAll();
    } catch (err: any) {
      setError(err.message || 'Could not save venue settings');
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

      {/* Revenue, Channel & Item Performance Reports */}
      {reports && (
        <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-6">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-oasis-cyan" /> Revenue &amp;
            Operational Performance Reports
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-oasis-navy border border-slate-800">
              <div className="text-xs text-slate-400">Today&apos;s Revenue</div>
              <div className="text-xl font-black text-emerald-400 mt-1">
                {formatCurrency(reports.revenuePeriods.dailyMinor, 'NGN')}
              </div>
              <div className="text-[11px] text-slate-500">
                {reports.revenuePeriods.dailyTransactions} verified payment(s)
              </div>
            </div>
            <div className="p-4 rounded-xl bg-oasis-navy border border-slate-800">
              <div className="text-xs text-slate-400">7-Day Revenue</div>
              <div className="text-xl font-black text-oasis-cyan mt-1">
                {formatCurrency(reports.revenuePeriods.weeklyMinor, 'NGN')}
              </div>
              <div className="text-[11px] text-slate-500">
                {reports.revenuePeriods.weeklyTransactions} verified payment(s)
              </div>
            </div>
            <div className="p-4 rounded-xl bg-oasis-navy border border-slate-800">
              <div className="text-xs text-slate-400">30-Day Revenue</div>
              <div className="text-xl font-black text-oasis-yellow mt-1">
                {formatCurrency(reports.revenuePeriods.monthlyMinor, 'NGN')}
              </div>
              <div className="text-[11px] text-slate-500">
                Online Confirmed: {reports.channelSplit.onlineConfirmedBookings} •
                Walk-In Confirmed: {reports.channelSplit.walkInConfirmedBookings}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-oasis-navy border border-slate-800 space-y-2.5">
              <div className="text-xs font-bold uppercase text-oasis-cyan">
                Revenue by Payment Channel
              </div>
              {(() => {
                const maxChan = Math.max(
                  1,
                  ...(reports.paymentChannels || []).map((x: any) => x.totalAmountMinor || 0),
                );
                return (reports.paymentChannels || []).map((c: any) => {
                  const pct = Math.min(100, Math.round(((c.totalAmountMinor || 0) / maxChan) * 100));
                  return (
                    <div key={c.channel} className="space-y-1 py-1 border-b border-slate-800/60 last:border-b-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">
                          {c.channel} ({c.transactionCount} tx)
                        </span>
                        <span className="font-bold text-white">
                          {formatCurrency(c.totalAmountMinor, 'NGN')}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-oasis-card overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-oasis-purple to-oasis-cyan transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="p-4 rounded-xl bg-oasis-navy border border-slate-800 space-y-2.5">
              <div className="text-xs font-bold uppercase text-oasis-yellow">
                Top Performing Attractions &amp; Passes
              </div>
              {(() => {
                const topItems = (reports.itemPerformance || []).slice(0, 6);
                const maxItem = Math.max(
                  1,
                  ...topItems.map((x: any) => x.totalRevenueMinor || 0),
                );
                return topItems.map((it: any, i: number) => {
                  const pct = Math.min(100, Math.round(((it.totalRevenueMinor || 0) / maxItem) * 100));
                  return (
                    <div key={i} className="space-y-1 py-1 border-b border-slate-800/60 last:border-b-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 truncate max-w-xs">
                          {it.itemName} ({it.totalUnitsSold} sold)
                        </span>
                        <span className="font-bold text-oasis-yellow">
                          {formatCurrency(it.totalRevenueMinor, 'NGN')}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-oasis-card overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-oasis-coral to-oasis-yellow transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Customers & Play-Credit Terminal */}
      <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-oasis-yellow" /> Customers &amp;
          Pay-Per-Play Credit Terminal ({customers.length})
        </h3>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {customers.map((c) => {
            const name = `${c.guestFirstName || c.user?.firstName || ''} ${
              c.guestLastName || c.user?.lastName || ''
            }`.trim();
            const email = c.guestEmail || c.user?.email || 'Walk-in';
            return (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-oasis-navy border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-white text-sm">
                    {name || 'Visitor'}
                  </div>
                  <div className="text-slate-400">
                    {email} • {c._count?.bookings || 0} booking(s)
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(c.playEntitlements || []).map((ent: any) => (
                    <div
                      key={ent.id}
                      className="px-3 py-1.5 rounded-xl bg-oasis-card border border-slate-700 flex items-center gap-2"
                    >
                      <span className="text-oasis-cyan font-bold">
                        {ent.attraction?.name}:
                      </span>
                      <span className="font-black text-oasis-yellow">
                        {ent.remainingPlays} plays
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRedeemPlay(ent.id)}
                        className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold"
                      >
                        -1 Redeem
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustPlayBalance(ent.id)}
                        className="px-2 py-0.5 rounded bg-oasis-purple/30 text-white font-bold"
                      >
                        ± Adjust
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Park Settings & Immutable Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSaveSettings}
          className="lg:col-span-5 p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-4"
        >
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-oasis-cyan" /> Configurable Park
            Settings
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Daily General Admission Visitor Limit
            </label>
            <input
              type="number"
              min={10}
              value={dailyCap}
              onChange={(e) => setDailyCap(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Checkout Hold Duration (Minutes)
            </label>
            <input
              type="number"
              min={5}
              max={60}
              value={holdMinutes}
              onChange={(e) => setHoldMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Venue Contact Phone
            </label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-oasis-purple to-oasis-coral text-white"
          >
            Save Operational Settings
          </button>
        </form>

        <div className="lg:col-span-7 p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-oasis-coral" /> Immutable
            Administrative Audit Logs ({auditLogs.length})
          </h3>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-oasis-navy border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-oasis-yellow">
                    {log.action}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-slate-300">
                  Entity: <strong>{log.entityType}</strong> • Actor:{' '}
                  <span className="text-oasis-cyan">
                    {log.user?.email || 'System / Webhook'}
                  </span>
                </div>
                {log.detailsJson && (
                  <div className="font-mono text-[11px] text-slate-400 truncate">
                    {log.detailsJson}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
