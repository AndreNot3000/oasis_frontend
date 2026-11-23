'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SocialLinks } from '@/components/social-links';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('General Enquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-oasis-navy">
      <SiteHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-oasis-cyan">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white mt-1">
            Contact &amp; Park Directions
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
            Have questions about group bookings, birthday packages, school
            excursions, or corporate tournaments? Reach our guest relations team
            below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-oasis-coral flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Physical Venue Address</div>
                  <div className="text-slate-400 mt-0.5">
                    Plot 8, Lagere, Ile-Ife, Osun State
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-oasis-cyan flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Guest Support Line</div>
                  <div className="text-slate-400 mt-0.5">+2348035382620</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-oasis-yellow flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Email Enquiries</div>
                  <div className="text-slate-400 mt-0.5">
                    hello@oasisamusement.com
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-oasis-purple flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Operating Hours (WAT)</div>
                  <div className="text-slate-400 mt-0.5">
                    Mon–Thu: 11:00 – 20:00 • Fri: 10:00 – 22:00 • Sat: 09:00 –
                    22:00 • Sun: 10:00 – 21:00
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-3">
              <div className="font-bold text-white text-sm">
                Connect &amp; Chat With Us
              </div>
              <p className="text-xs text-slate-400">
                Follow Oasis Amusement Park for park highlights, promos, and live
                events — or message us directly on WhatsApp.
              </p>
              <SocialLinks showLabels />
            </div>
          </div>

          <div className="lg:col-span-7 p-7 rounded-3xl bg-oasis-card border border-slate-800">
            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-black text-base text-white">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Enquiry Received!
                </div>
                <p className="text-xs sm:text-sm">
                  Thank you, <strong>{name}</strong>. Our Ile-Ife guest
                  relations desk will respond to <strong>{email}</strong> shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-black text-white">
                  Send Us an Enquiry
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Topic
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
                  >
                    <option>General Enquiry</option>
                    <option>Birthday &amp; Private Celebrations</option>
                    <option>Corporate Team Events</option>
                    <option>School Excursion Booking</option>
                    <option>Ticketing &amp; Payment Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-oasis-navy border border-slate-700 text-sm text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-oasis-purple to-oasis-coral text-white shadow-lg"
                >
                  <Send className="w-4 h-4" /> Send Enquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
