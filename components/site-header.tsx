'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Ticket,
  LayoutDashboard,
  Menu,
  X,
  User,
  Sparkles,
} from 'lucide-react';

const navLinks = [
  { href: '/', label: 'HOME' },
  { href: '/about', label: 'ABOUT US' },
  { href: '/attractions', label: 'ATTRACTIONS' },
  { href: '/packages', label: 'PRICING & PROMOS' },
  { href: '/events', label: 'EVENTS' },
  { href: '/lookup', label: 'TICKETS' },
  { href: '/contact', label: 'CONTACT' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#040611]/80 border-b border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.45)] px-4 sm:px-6 lg:px-8 py-3">
      {/* Subtle Top Neon Hairline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Emblem + "Oasis Amusement Park" Logo (Always Single Line) */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] via-[#FF2A85] to-[#00F0FF] p-0.5 shadow-lg shadow-fuchsia-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
            <div className="h-full w-full rounded-[10px] bg-black/85 flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            </div>
          </div>
          <div className="leading-none whitespace-nowrap">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300">
              Oasis
            </div>
            <div className="text-sm sm:text-base font-serif font-bold tracking-tight text-amber-300">
              Amusement Park
            </div>
          </div>
        </Link>

        {/* Center: Glass Pill Navigation Links (Single Line, No Wrapping) */}
        <nav className="hidden xl:flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          {navLinks.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.12em] whitespace-nowrap transition-all ${
                  active
                    ? 'bg-cyan-400/15 text-cyan-300 shadow-[inset_0_0_12px_rgba(0,240,255,0.2)]'
                    : 'text-white/85 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Single-Line Book Now Pill + Compact Phone/Location + Account/Admin */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          <Link
            href="/book"
            className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-white text-slate-950 font-extrabold text-xs tracking-wide whitespace-nowrap shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-amber-300 hover:scale-[1.03] transition-all flex-shrink-0"
          >
            Book Now
          </Link>

          <div className="hidden lg:block text-right leading-tight whitespace-nowrap">
            <a
              href="tel:+2348035382620"
              className="block text-xs font-extrabold text-white tracking-wide hover:text-cyan-300 transition-colors"
            >
              +2348035382620
            </a>
            <span className="block text-[10px] text-slate-400">
              10:00–22:00 • Lagere, Ile-Ife
            </span>
          </div>

          <div className="flex items-center gap-1.5 pl-2.5 border-l border-white/15 flex-shrink-0">
            <Link
              href="/account"
              title="Customer Account"
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white border border-white/10 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
            </Link>
            <Link
              href="/admin"
              title="Staff & Admin Operations Console"
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white border border-white/10 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-fuchsia-400" />
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          className="xl:hidden inline-flex items-center justify-center p-2 rounded-xl bg-white/10 border border-white/15 text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="xl:hidden mt-3 pt-3 border-t border-white/10 space-y-2 pb-2">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-bold tracking-wider bg-white/5 text-white hover:text-cyan-300 border border-white/10"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center py-2.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/15"
            >
              My Account
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center py-2.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/15"
            >
              Staff Console
            </Link>
            <Link
              href="/book"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center py-2.5 rounded-full text-xs font-bold bg-white text-slate-950"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
