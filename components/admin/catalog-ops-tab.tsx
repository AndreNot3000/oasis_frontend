'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Plus,
  Clock,
  Tag,
  Power,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function CatalogOpsTab() {
  const [attractions, setAttractions] = useState<any[]>([]);
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [operatingHours, setOperatingHours] = useState<any[]>([]);
  const [closures, setClosures] = useState<any[]>([]);

  // New Pricing Rule Form
  const [ruleName, setRuleName] = useState('');
  const [ruleAmountNgn, setRuleAmountNgn] = useState<number>(3500);
  const [ruleAttractionId, setRuleAttractionId] = useState<string>('');
  const [rulePlaysPerUnit, setRulePlaysPerUnit] = useState<string>('');
  const [ruleIsAdmission, setRuleIsAdmission] = useState<boolean>(false);

  // New Closure Form
  const [closureName, setClosureName] = useState('');
  const [closureStart, setClosureStart] = useState('');
  const [closureEnd, setClosureEnd] = useState('');

  // New Resource Form
  const [resAttractionId, setResAttractionId] = useState('');
  const [resName, setResName] = useState('');
  const [resCapacity, setResCapacity] = useState<number>(6);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCatalogData = async () => {
    try {
      const [attrRes, rulesRes, hoursRes, closuresRes] = await Promise.all([
        apiClient<any[]>('/attractions'),
        apiClient<any[]>('/pricing-rules'),
        apiClient<any[]>('/scheduling/operating-hours'),
        apiClient<any[]>('/scheduling/closures'),
      ]);
      setAttractions(attrRes || []);
      setPricingRules(rulesRes || []);
      setOperatingHours(hoursRes || []);
      setClosures(closuresRes || []);
      if (attrRes?.length && !resAttractionId) {
        setResAttractionId(attrRes[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Could not load catalog');
    }
  };

  useEffect(() => {
    loadCatalogData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleAttractionActive = async (attr: any) => {
    setError(null);
    setMessage(null);
    try {
      await apiClient(
        `/attractions/admin/${encodeURIComponent(attr.id)}/toggle-active`,
        {
          method: 'PATCH',
          body: JSON.stringify({ isActive: !attr.isActive }),
        },
      );
      setMessage(`Updated status for ${attr.name}`);
      await loadCatalogData();
    } catch (err: any) {
      setError(err.message || 'Could not toggle attraction status');
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resAttractionId || !resName.trim()) return;
    setError(null);
    setMessage(null);
    try {
      await apiClient('/resources/admin', {
        method: 'POST',
        body: JSON.stringify({
          attractionId: resAttractionId,
          name: resName.trim(),
          maxCapacity: Number(resCapacity),
        }),
      });
      setResName('');
      setMessage('Bookable resource added to attraction.');
      await loadCatalogData();
    } catch (err: any) {
      setError(err.message || 'Could not add resource');
    }
  };

  const handleCreatePricingRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || ruleAmountNgn <= 0) return;
    setError(null);
    setMessage(null);
    try {
      await apiClient('/pricing-rules/admin', {
        method: 'POST',
        body: JSON.stringify({
          name: ruleName.trim(),
          amountMinor: Math.round(Number(ruleAmountNgn) * 100),
          attractionId: ruleIsAdmission ? undefined : ruleAttractionId || undefined,
          isAdmission: ruleIsAdmission,
          playsPerUnit: rulePlaysPerUnit ? Number(rulePlaysPerUnit) : null,
        }),
      });
      setRuleName('');
      setRulePlaysPerUnit('');
      setMessage('Pricing rule created and logged in AuditLog.');
      await loadCatalogData();
    } catch (err: any) {
      setError(err.message || 'Could not create pricing rule');
    }
  };

  const handleUpdateDayHours = async (
    dayOfWeek: number,
    openTime: string,
    closeTime: string,
    isClosed: boolean,
  ) => {
    setError(null);
    setMessage(null);
    try {
      await apiClient('/scheduling/admin/operating-hours', {
        method: 'POST',
        body: JSON.stringify({ dayOfWeek, openTime, closeTime, isClosed }),
      });
      setMessage(`Operating hours updated for ${dayNames[dayOfWeek]}.`);
      await loadCatalogData();
    } catch (err: any) {
      setError(err.message || 'Could not update operating hours');
    }
  };

  const handleCreateClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closureName.trim() || !closureStart || !closureEnd) return;
    setError(null);
    setMessage(null);
    try {
      await apiClient('/scheduling/admin/closures', {
        method: 'POST',
        body: JSON.stringify({
          name: closureName.trim(),
          startDate: closureStart,
          endDate: closureEnd,
          isFullPark: true,
        }),
      });
      setClosureName('');
      setMessage('Maintenance / holiday closure scheduled.');
      await loadCatalogData();
    } catch (err: any) {
      setError(err.message || 'Could not schedule closure');
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

      {/* Attractions & Bookable Units */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-4">
          <h2 className="text-lg font-black text-white">
            Attractions &amp; Access Models ({attractions.length})
          </h2>
          <div className="space-y-2.5">
            {attractions.map((attr) => (
              <div
                key={attr.id}
                className="p-4 rounded-xl bg-oasis-navy border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-xs font-bold text-oasis-cyan">
                    {attr.category?.name} • {attr.accessModel}
                  </div>
                  <div className="font-bold text-sm text-white">{attr.name}</div>
                  <div className="text-xs text-slate-400">
                    Duration: {attr.sessionDurationMin} min • Max Players:{' '}
                    {attr.maxPlayers} • Units: {attr._count?.resources || 1}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleAttractionActive(attr)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                >
                  <Power className="w-3.5 h-3.5" /> Active
                </button>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleAddResource}
          className="lg:col-span-4 p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-4"
        >
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-oasis-cyan" /> Add Bookable Physical Unit
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Target Attraction
            </label>
            <select
              value={resAttractionId}
              onChange={(e) => setResAttractionId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
            >
              {attractions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Resource / Machine Name *
            </label>
            <input
              type="text"
              required
              value={resName}
              onChange={(e) => setResName(e.target.value)}
              placeholder="e.g. VR Pod Eta / Sim Rig 6"
              className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Unit Capacity
            </label>
            <input
              type="number"
              min={1}
              value={resCapacity}
              onChange={(e) => setResCapacity(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-black text-xs bg-oasis-purple text-white"
          >
            Add Physical Unit
          </button>
        </form>
      </div>

      {/* Pricing Rules Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-oasis-yellow" /> Active Pricing Rules (
            {pricingRules.length})
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {pricingRules.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-xl bg-oasis-navy border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{r.name}</div>
                  <div className="text-slate-400">
                    {r.isAdmission
                      ? 'General Park Admission'
                      : r.attraction?.name || 'Activity'}
                    {r.playsPerUnit ? ` • Grants ${r.playsPerUnit} Plays` : ''}
                  </div>
                </div>
                <div className="font-black text-oasis-yellow text-sm">
                  {formatCurrency(r.amountMinor, r.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleCreatePricingRule}
          className="lg:col-span-5 p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-3.5"
        >
          <h3 className="text-base font-black text-white">
            Create Configurable Pricing Rule
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Rule Name *
            </label>
            <input
              type="text"
              required
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="e.g. Weekend Teen Pass / 10-Play Pack"
              className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Price (NGN Major) *
              </label>
              <input
                type="number"
                min={100}
                required
                value={ruleAmountNgn}
                onChange={(e) => setRuleAmountNgn(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Plays Granted (Optional)
              </label>
              <input
                type="number"
                min={1}
                value={rulePlaysPerUnit}
                onChange={(e) => setRulePlaysPerUnit(e.target.value)}
                placeholder="Timed if empty"
                className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              id="isAdmissionChk"
              checked={ruleIsAdmission}
              onChange={(e) => setRuleIsAdmission(e.target.checked)}
            />
            <label htmlFor="isAdmissionChk">
              Is General Park Admission Tier?
            </label>
          </div>
          {!ruleIsAdmission && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Link to Attraction
              </label>
              <select
                value={ruleAttractionId}
                onChange={(e) => setRuleAttractionId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
              >
                <option value="">Select Attraction...</option>
                {attractions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-oasis-coral to-oasis-orange text-oasis-navy"
          >
            Save Pricing Rule
          </button>
        </form>
      </div>

      {/* Operating Hours & Closures */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-oasis-cyan" /> Weekly Operating Hours
            (Africa/Lagos WAT)
          </h3>
          <div className="space-y-2">
            {operatingHours.map((h) => (
              <div
                key={h.id}
                className="p-3 rounded-xl bg-oasis-navy border border-slate-800 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-white w-28">
                  {dayNames[h.dayOfWeek]}
                </span>
                <span className="text-oasis-cyan font-mono">
                  {h.isClosed ? 'CLOSED' : `${h.openTime} – ${h.closeTime}`}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateDayHours(
                      h.dayOfWeek,
                      h.openTime,
                      h.closeTime,
                      !h.isClosed,
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-oasis-card border border-slate-700 text-slate-300 hover:text-white"
                >
                  {h.isClosed ? 'Re-Open Day' : 'Mark Closed'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleCreateClosure}
          className="lg:col-span-5 p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-3.5"
        >
          <h3 className="text-base font-black text-white">
            Schedule Maintenance / Holiday Closure ({closures.length})
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Closure Reason *
            </label>
            <input
              type="text"
              required
              value={closureName}
              onChange={(e) => setClosureName(e.target.value)}
              placeholder="e.g. Annual Safety Inspection"
              className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={closureStart}
                onChange={(e) => setClosureStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={closureEnd}
                onChange={(e) => setClosureEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-black text-xs bg-oasis-purple text-white"
          >
            Schedule Park Closure
          </button>
        </form>
      </div>
    </div>
  );
}
