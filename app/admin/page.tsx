'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Ticket,
  QrCode,
  CreditCard,
  Sliders,
  BarChart3,
  LogOut,
  RefreshCw,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { WalkInPosTab } from '@/components/admin/walk-in-pos-tab';
import { ScannerCheckInTab } from '@/components/admin/scanner-checkin-tab';
import { BookingsPaymentsTab } from '@/components/admin/bookings-payments-tab';
import { CatalogOpsTab } from '@/components/admin/catalog-ops-tab';
import { CustomersReportsTab } from '@/components/admin/customers-reports-tab';
import { AdminDashboardSkeleton } from '@/components/oasis-skeleton';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

type AdminTab =
  | 'overview'
  | 'walkin'
  | 'scanner'
  | 'bookings'
  | 'catalog'
  | 'reports';

export default function AdminDashboardPage() {
  const [staffUser, setStaffUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [dashboard, setDashboard] = useState<any | null>(null);

  const [email, setEmail] = useState('admin@oasisamusement.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const me = await apiClient<any>('/auth/me');
      if (me?.role !== 'ADMIN' && me?.role !== 'STAFF') {
        setStaffUser(null);
        setError('Access denied: ADMIN or STAFF role required.');
        return;
      }
      setStaffUser(me);
      const data = await apiClient<any>('/admin/dashboard');
      setDashboard(data);
    } catch {
      setStaffUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      const res = await apiClient<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (res?.user?.role !== 'ADMIN' && res?.user?.role !== 'STAFF') {
        throw new Error('This account does not have ADMIN or STAFF permissions.');
      }
      if (res?.accessToken && typeof window !== 'undefined') {
        window.localStorage.setItem('oasis_access_token', res.accessToken);
      }
      await loadDashboard();
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('oasis_access_token');
    }
    setStaffUser(null);
    setDashboard(null);
  };

  const kpis = dashboard?.kpis;

  return (
    <div className="flex flex-col min-h-screen bg-oasis-navy">
      <SiteHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {loading ? (
          <AdminDashboardSkeleton />
        ) : !staffUser ? (
          <div className="max-w-md mx-auto p-7 rounded-3xl bg-oasis-card border border-oasis-purple/40 shadow-2xl space-y-5">
            <div className="text-center space-y-1">
              <div className="h-12 w-12 rounded-2xl bg-oasis-purple/20 border border-oasis-purple/40 flex items-center justify-center text-oasis-cyan mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-white">
                Oasis Staff &amp; Admin Operations
              </h1>
              <p className="text-xs text-slate-400">
                Sign in with an authorized Administrator or Venue Staff account
                to access POS, QR turnstiles, capacity, and financial controls.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Administrator Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-3.5 py-2.5 pr-11 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-oasis-cyan transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-oasis-purple via-oasis-coral to-oasis-orange text-white shadow-lg"
              >
                {submitting ? 'Authenticating...' : 'Sign In to Operations Console'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Admin Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-oasis-cyan">
                  Centralized Park Operations • {staffUser.role}
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-white mt-0.5">
                  Oasis Management Dashboard
                </h1>
                <p className="text-xs text-slate-400">
                  Signed in as <strong>{staffUser.email}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={loadDashboard}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-oasis-card text-slate-200 border border-slate-700 hover:border-oasis-cyan"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-oasis-cyan" /> Refresh
                  Metrics
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-oasis-card text-slate-300 border border-slate-700 hover:text-white"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>

            {/* KPI Summary Strip */}
            {kpis && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 rounded-2xl bg-oasis-card border border-slate-800">
                  <div className="text-[11px] font-bold uppercase text-slate-400">
                    Total Revenue
                  </div>
                  <div className="text-lg font-black text-emerald-400 mt-1">
                    {formatCurrency(kpis.totalRevenueMinor, kpis.currency)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Today: {formatCurrency(kpis.todayRevenueMinor, kpis.currency)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-oasis-card border border-slate-800">
                  <div className="text-[11px] font-bold uppercase text-slate-400">
                    Visitors Ticketed
                  </div>
                  <div className="text-lg font-black text-white mt-1">
                    {kpis.totalVisitorsTicketed}
                  </div>
                  <div className="text-[11px] text-oasis-cyan">
                    Checked In: {kpis.totalVisitorsCheckedIn} (Today:{' '}
                    {kpis.todayVisitorsCheckedIn})
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-oasis-card border border-slate-800">
                  <div className="text-[11px] font-bold uppercase text-slate-400">
                    Total Bookings
                  </div>
                  <div className="text-lg font-black text-white mt-1">
                    {kpis.totalBookings}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Online: {kpis.onlineBookings} • Walk-In: {kpis.walkInBookings}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-oasis-card border border-slate-800">
                  <div className="text-[11px] font-bold uppercase text-slate-400">
                    Confirmed Orders
                  </div>
                  <div className="text-lg font-black text-oasis-yellow mt-1">
                    {kpis.confirmedBookingsCount}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Pending Holds: {kpis.pendingPaymentsCount}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-oasis-card border border-slate-800">
                  <div className="text-[11px] font-bold uppercase text-slate-400">
                    Active Attractions
                  </div>
                  <div className="text-lg font-black text-oasis-cyan mt-1">
                    {kpis.activeAttractionsCount} / {kpis.totalAttractionsCount}
                  </div>
                  <div className="text-[11px] text-emerald-400">
                    All Zones Operational
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-oasis-card border border-slate-800">
                  <div className="text-[11px] font-bold uppercase text-slate-400">
                    Payment Exceptions
                  </div>
                  <div className="text-lg font-black text-oasis-coral mt-1">
                    {kpis.requiresReviewPaymentsCount}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Late Payment Review Queue
                  </div>
                </div>
              </div>
            )}

            {/* Module Navigation Tabs (Horizontal Scrollable Pill Strip on Mobile, Wrap on Desktop) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-slate-800 sm:flex-wrap no-scrollbar">
              {[
                {
                  id: 'overview' as AdminTab,
                  label: 'Overview',
                  icon: LayoutDashboard,
                },
                {
                  id: 'walkin' as AdminTab,
                  label: 'Walk-In POS',
                  icon: Ticket,
                },
                {
                  id: 'scanner' as AdminTab,
                  label: 'QR Scanner',
                  icon: QrCode,
                },
                {
                  id: 'bookings' as AdminTab,
                  label: 'Bookings & Payments',
                  icon: CreditCard,
                },
                {
                  id: 'catalog' as AdminTab,
                  label: 'Attractions & Pricing',
                  icon: Sliders,
                },
                {
                  id: 'reports' as AdminTab,
                  label: 'Customers & Reports',
                  icon: BarChart3,
                },
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                      active
                        ? 'bg-oasis-purple text-white shadow-lg shadow-oasis-purple/30'
                        : 'bg-oasis-card text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Active Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-4 sm:p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-4 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base sm:text-lg font-black text-white">
                      Recent Bookings
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('bookings')}
                      className="text-xs font-bold text-oasis-cyan hover:underline whitespace-nowrap"
                    >
                      Manage All →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {(dashboard?.recentBookings || []).length === 0 ? (
                      <div className="p-6 rounded-xl bg-oasis-navy/60 border border-slate-800/80 text-center text-xs text-slate-400">
                        No bookings yet. New customer bookings will appear here in real time.
                      </div>
                    ) : (
                      (dashboard?.recentBookings || []).map((b: any) => (
                        <div
                          key={b.id}
                          className="p-3.5 rounded-xl bg-oasis-navy border border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="font-mono font-bold text-oasis-yellow truncate">
                              {b.reference}{' '}
                              {b.isWalkIn && (
                                <span className="text-[10px] text-oasis-cyan font-sans">
                                  (Walk-In)
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 truncate">
                              {b.customer?.guestEmail ||
                                b.customer?.user?.email ||
                                'Guest'}{' '}
                              • {(b.items || []).length} item(s)
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 space-y-0.5">
                            <div className="font-bold text-white whitespace-nowrap">
                              {formatCurrency(b.totalAmountMinor, b.currency)}
                            </div>
                            <div className="text-[10px] font-bold text-emerald-400 whitespace-nowrap">
                              {b.status}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-4 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base sm:text-lg font-black text-white">
                      Recent Transactions
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('bookings')}
                      className="text-xs font-bold text-oasis-cyan hover:underline whitespace-nowrap"
                    >
                      Reconcile →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {(dashboard?.recentPayments || []).length === 0 ? (
                      <div className="p-6 rounded-xl bg-oasis-navy/60 border border-slate-800/80 text-center text-xs text-slate-400">
                        No payment transactions recorded yet.
                      </div>
                    ) : (
                      (dashboard?.recentPayments || []).map((p: any) => (
                        <div
                          key={p.id}
                          className="p-3.5 rounded-xl bg-oasis-navy border border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="font-mono text-oasis-cyan font-bold truncate">
                              {p.providerReference}
                            </div>
                            <div className="text-slate-400 truncate">
                              Booking: {p.booking?.reference} • {p.channel}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 space-y-0.5">
                            <div className="font-bold text-white whitespace-nowrap">
                              {formatCurrency(p.amountMinor, p.currency)}
                            </div>
                            <div className="text-[10px] font-bold text-oasis-yellow whitespace-nowrap">
                              {p.status}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'walkin' && (
              <WalkInPosTab onBookingCreated={loadDashboard} />
            )}

            {activeTab === 'scanner' && <ScannerCheckInTab />}

            {activeTab === 'bookings' && <BookingsPaymentsTab />}

            {activeTab === 'catalog' && <CatalogOpsTab />}

            {activeTab === 'reports' && <CustomersReportsTab />}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
