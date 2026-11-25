import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';
import { SocialLinks } from '@/components/social-links';

export function SiteFooter() {
  return (
    <footer className="border-t border-oasis-navyLight/60 bg-oasis-navy pt-14 pb-10 px-6 text-sm text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-oasis-purple via-oasis-coral to-oasis-cyan flex items-center justify-center font-black text-sm text-white">
              O
            </div>
            <span className="font-black text-lg text-white">
              OASIS AMUSEMENT PARK
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400 mb-4">
            Osun State&apos;s premier physical entertainment &amp; arcade destination in
            Ile-Ife. Experience multi-player VR arenas, electric drift bumper cars,
            trampolines, F1 hydraulic simulators, and family adventure zones.
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs text-oasis-cyan font-semibold mb-4">
            <ShieldCheck className="w-4 h-4" />
            Verified Capacity &amp; Secure QR Passes
          </div>
          <SocialLinks />
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-4">
            Explore Oasis
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/attractions" className="hover:text-oasis-cyan transition-colors">
                All 8 Attraction Zones
              </Link>
            </li>
            <li>
              <Link href="/packages" className="hover:text-oasis-cyan transition-colors">
                Thrill &amp; Family Packages
              </Link>
            </li>
            <li>
              <Link href="/events" className="hover:text-oasis-cyan transition-colors">
                Birthdays, Schools &amp; Corporate Events
              </Link>
            </li>
            <li>
              <Link href="/book" className="hover:text-oasis-cyan transition-colors">
                Online Booking Portal
              </Link>
            </li>
            <li>
              <Link href="/lookup" className="hover:text-oasis-cyan transition-colors">
                Retrieve Digital Tickets
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-4">
            Visitor Information
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/about" className="hover:text-oasis-cyan transition-colors">
                About Oasis &amp; Safety Rules
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-oasis-cyan transition-colors">
                Directions &amp; Parking
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-oasis-cyan transition-colors">
                Customer Account &amp; Play Credits
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-oasis-cyan transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-oasis-cyan transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-4">
            Park Location &amp; Hours
          </h4>
          <ul className="space-y-3 text-xs">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-oasis-coral flex-shrink-0 mt-0.5" />
              <span>Plot 8, Lagere, Ile-Ife, Osun State</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-oasis-cyan flex-shrink-0" />
              <span>+2348035382620</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-oasis-yellow flex-shrink-0" />
              <span>bookings@oasisamusementhub.com</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-oasis-purple flex-shrink-0 mt-0.5" />
              <span>Mon–Thu: 11:00–20:00 | Fri: 10:00–22:00 | Sat: 09:00–22:00 | Sun: 10:00–21:00 (WAT)</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <span>© {new Date().getFullYear()} Oasis Amusement Park Ltd. All rights reserved.</span>
        <div className="flex flex-wrap gap-6">
          <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
          <Link href="/about" className="hover:text-slate-300">Safety Policy</Link>
          <Link href="/contact" className="hover:text-slate-300">Support</Link>
        </div>
      </div>
    </footer>
  );
}
