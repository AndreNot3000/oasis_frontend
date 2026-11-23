'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  User,
  Ticket,
  Gamepad2,
  LogOut,
  AlertCircle,
  QrCode,
  Sparkles,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import {
  OasisAuthScreen,
  OasisAuthLoginPayload,
  OasisAuthRegisterPayload,
} from '@/components/oasis-auth-screen';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

export default function CustomerAccountPage() {
  const [user, setUser] = useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [entitlements, setEntitlements] = useState<any[]>([]);
  const [selectedTicketBooking, setSelectedTicketBooking] = useState<any | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [backupPassword, setBackupPassword] = useState<string>('');
  const [savingPassword, setSavingPassword] = useState<boolean>(false);
  const [passwordSavedMsg, setPasswordSavedMsg] = useState<string | null>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const loadAccountData = async () => {
    try {
      setLoading(true);
      const profile = await apiClient<any>('/auth/me');
      setUser(profile);

      const [myBookings, myEntitlements] = await Promise.all([
        apiClient<any[]>('/bookings/my-bookings'),
        apiClient<any[]>('/play/entitlements'),
      ]);
      setBookings(myBookings || []);
      setEntitlements(myEntitlements || []);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccountData();
  }, []);

  const handleLogin = async ({ email, password }: OasisAuthLoginPayload) => {
    const res = await apiClient<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res?.accessToken && typeof window !== 'undefined') {
      window.localStorage.setItem('oasis_access_token', res.accessToken);
    }
    await loadAccountData();
  };

  const handleRegister = async ({
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
  }: OasisAuthRegisterPayload) => {
    const res = await apiClient<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
      }),
    });
    if (res?.accessToken && typeof window !== 'undefined') {
      window.localStorage.setItem('oasis_access_token', res.accessToken);
    }
    await loadAccountData();
  };

  const handleGoogleCredential = async (credential: string) => {
    const res = await apiClient<any>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    if (res?.accessToken && typeof window !== 'undefined') {
      window.localStorage.setItem('oasis_access_token', res.accessToken);
    }
    await loadAccountData();
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
    setUser(null);
    setBookings([]);
    setEntitlements([]);
    setSelectedTicketBooking(null);
  };

  const handleViewQrTickets = async (bookingRef: string) => {
    try {
      const res = await apiClient<any>(
        `/tickets/${encodeURIComponent(bookingRef)}`,
      );
      setSelectedTicketBooking(res);
    } catch (err: any) {
      setError(err.message || 'Could not load QR tickets');
    }
  };

  if (!loading && !user) {
    return (
      <OasisAuthScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGoogleCredential={handleGoogleCredential}
        googleClientId={googleClientId}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-oasis-navy">
      <SiteHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        {loading ? (
          <div className="h-72 rounded-3xl oasis-skeleton" />
        ) : (
          <div className="space-y-8">
            {/* Profile Banner */}
            <div className="p-6 rounded-3xl bg-oasis-card border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-oasis-purple to-oasis-cyan flex items-center justify-center text-white font-black text-xl">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-oasis-cyan">
                    {user.role} Account
                  </span>
                  <h1 className="text-2xl font-black text-white">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/book"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-oasis-purple to-oasis-coral text-white"
                >
                  + New Booking
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-oasis-navy text-slate-300 border border-slate-700 hover:text-white"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>

            {/* Optional: Let Google-authenticated users set a backup password */}
            {user.hasPassword === false && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (backupPassword.length < 8) return;
                  setError(null);
                  setPasswordSavedMsg(null);
                  try {
                    setSavingPassword(true);
                    const res = await apiClient<any>('/auth/set-password', {
                      method: 'POST',
                      body: JSON.stringify({ password: backupPassword }),
                    });
                    setPasswordSavedMsg(
                      res?.message ||
                        'Password saved! You can now sign in with email & password as well.',
                    );
                    setBackupPassword('');
                    setUser((prev: any) => (prev ? { ...prev, hasPassword: true } : prev));
                  } catch (err: any) {
                    setError(err?.message || 'Could not save password');
                  } finally {
                    setSavingPassword(false);
                  }
                }}
                className="p-5 rounded-2xl bg-oasis-card border border-oasis-purple/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="text-sm font-black text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-oasis-cyan" />
                    Set a Backup Password (Optional)
                  </div>
                  <p className="text-xs text-slate-400">
                    You signed in with Google. Add a password if you also want to sign in manually with your email.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={backupPassword}
                    onChange={(e) => setBackupPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="flex-1 sm:w-52 px-3.5 py-2 rounded-xl bg-oasis-navy border border-slate-700 text-xs text-white"
                  />
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-oasis-purple hover:bg-oasis-purple/90 text-white whitespace-nowrap"
                  >
                    {savingPassword ? 'Saving...' : 'Save Password'}
                  </button>
                </div>
              </form>
            )}

            {passwordSavedMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{passwordSavedMsg}</span>
              </div>
            )}

            {/* Active Play-Per-Play Credit Balances */}
            <section className="p-6 rounded-3xl bg-oasis-card border border-slate-800 space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-oasis-yellow" />
                Active Pay-Per-Play Credit Passes ({entitlements.length})
              </h2>
              {entitlements.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No active play-credit passes yet. Purchase an Arcade or Air
                  Hockey pack to see your live credit balance here.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {entitlements.map((ent) => (
                    <div
                      key={ent.id}
                      className="p-4 rounded-2xl bg-oasis-navy border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-oasis-cyan">
                          {ent.attraction?.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Purchased: {ent.totalPurchased} plays
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-oasis-yellow">
                          {ent.remainingPlays}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          Plays Left
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Booking History */}
            <section className="p-6 rounded-3xl bg-oasis-card border border-slate-800 space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-oasis-coral" />
                My Bookings &amp; Digital Tickets ({bookings.length})
              </h2>

              {bookings.length === 0 ? (
                <div className="text-xs text-slate-400 py-4">
                  You have no bookings under this account yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-oasis-navy border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-oasis-yellow">
                            {b.reference}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-oasis-card text-oasis-cyan border border-slate-700">
                            {b.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1">
                          {(b.items || [])
                            .map((i: any) => `${i.quantity}× ${i.itemName}`)
                            .join(' • ')}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-black text-white">
                          {formatCurrency(b.totalAmountMinor, b.currency)}
                        </span>
                        {b.tickets?.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleViewQrTickets(b.reference)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-oasis-purple text-white"
                          >
                            <QrCode className="w-3.5 h-3.5" /> View QR Passes
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {selectedTicketBooking && (
              <section className="p-6 rounded-3xl bg-oasis-card border border-oasis-cyan/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white">
                    Digital QR Passes for {selectedTicketBooking.bookingReference}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedTicketBooking(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(selectedTicketBooking.tickets || []).map((tkt: any) => (
                    <div
                      key={tkt.id}
                      className="p-5 rounded-2xl bg-oasis-navy border border-slate-700 flex flex-col items-center text-center space-y-2"
                    >
                      <div className="font-bold text-white text-sm">
                        {tkt.title}
                      </div>
                      {tkt.qrDataUrl && (
                        <img
                          src={tkt.qrDataUrl}
                          alt={tkt.ticketCode}
                          className="w-40 h-40 rounded-xl border-4 border-white"
                        />
                      )}
                      <div className="font-mono text-xs font-bold text-oasis-yellow">
                        {tkt.ticketCode}
                      </div>
                      <div className="text-xs text-slate-400">
                        Remaining Admissions: {tkt.remainingQuantity} /{' '}
                        {tkt.totalQuantity}
                      </div>
                    </div>
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
