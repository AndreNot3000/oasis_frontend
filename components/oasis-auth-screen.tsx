'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Check,
  Sparkles,
  Ticket,
  Gamepad2,
  QrCode,
  Globe,
  AlertCircle,
  User as UserIcon,
  Phone,
} from 'lucide-react';

export interface OasisAuthLoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface OasisAuthRegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface OasisAuthScreenProps {
  backgroundVideoUrl?: string;
  onLogin: (payload: OasisAuthLoginPayload) => Promise<void>;
  onRegister: (payload: OasisAuthRegisterPayload) => Promise<void>;
  onGoogleCredential?: (credential: string) => Promise<void>;
  googleClientId?: string;
}

type SubmitState = 'idle' | 'loading' | 'success';

export function OasisAuthScreen({
  backgroundVideoUrl = 'https://videos.pexels.com/video-files/35300435/14956208_1920_1080_30fps.mp4',
  onLogin,
  onRegister,
  onGoogleCredential,
  googleClientId = '',
}: OasisAuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const googleBtnContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize Google Identity Services when client ID is available
  useEffect(() => {
    if (!googleClientId || !onGoogleCredential) return;

    const initGsi = () => {
      const g = (window as any).google;
      if (!g?.accounts?.id) return;

      g.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (res: { credential?: string }) => {
          if (!res?.credential) return;
          setError(null);
          setInfoNotice(null);
          try {
            setSubmitState('loading');
            await onGoogleCredential(res.credential);
            setSubmitState('success');
          } catch (err: any) {
            setSubmitState('idle');
            setError(err?.message || 'Google sign-in failed');
          }
        },
      });

      if (googleBtnContainerRef.current) {
        googleBtnContainerRef.current.innerHTML = '';
        g.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'filled_black',
          size: 'large',
          type: 'icon',
          shape: 'circle',
        });
      }
    };

    if ((window as any).google?.accounts?.id) {
      initGsi();
      return;
    }

    const scriptId = 'oasis-google-gsi';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = initGsi;
      document.head.appendChild(s);
    }
  }, [googleClientId, onGoogleCredential]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitState === 'loading') return;

    setError(null);
    setInfoNotice(null);
    setSubmitState('loading');

    try {
      if (mode === 'login') {
        await onLogin({
          email: email.trim(),
          password,
          rememberMe,
        });
      } else {
        await onRegister({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phoneNumber: phoneNumber.trim() || undefined,
        });
      }
      setSubmitState('success');
      setTimeout(() => {
        setSubmitState('idle');
      }, 1400);
    } catch (err: any) {
      setSubmitState('idle');
      setError(err?.message || 'Authentication failed. Please try again.');
    }
  };

  const handleGoogleFallbackClick = () => {
    setError(null);
    if (googleClientId) {
      const g = (window as any).google;
      if (g?.accounts?.id) {
        g.accounts.id.prompt();
        return;
      }
    }
    setInfoNotice(
      'Google Sign-In is ready — add NEXT_PUBLIC_GOOGLE_CLIENT_ID in apps/web/.env.local to activate one-tap Google login.',
    );
  };

  return (
    <div className="relative w-full min-h-[100svh] overflow-x-hidden overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-[#05030d]">
      {/* 1. Fallback Radial Gradient Backdrop (Dark Purple, Blue & Black) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(88, 28, 135, 0.45), transparent 52%), radial-gradient(circle at 82% 80%, rgba(29, 78, 216, 0.35), transparent 55%), linear-gradient(160deg, #070312 0%, #050816 55%, #020308 100%)',
        }}
      />

      {/* 2. Full-Viewport Cinematic Abstract Video Background */}
      {!videoFailed && backgroundVideoUrl && (
        <video
          aria-hidden="true"
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoFailed(true)}
          className="fixed inset-0 w-full h-full object-cover pointer-events-none"
        >
          <source src={backgroundVideoUrl} type="video/mp4" />
        </video>
      )}

      {/* 3. Dark Transparent Readability Overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[#05030d]/65 backdrop-blur-[2px] pointer-events-none"
      />

      {/* 4. Ambient Floating Light Orbs (Purple Upper-Left, Blue Lower-Right) */}
      <div
        aria-hidden="true"
        className="oasis-auth-orb-purple fixed -top-28 -left-24 w-[420px] h-[420px] sm:w-[540px] sm:h-[540px] rounded-full bg-purple-600/30 blur-[130px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="oasis-auth-orb-blue fixed -bottom-28 -right-24 w-[420px] h-[420px] sm:w-[540px] sm:h-[540px] rounded-full bg-blue-600/25 blur-[130px] pointer-events-none"
      />

      {/* 5. Faint Geometric Grid Faded with Radial Edge Mask */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none opacity-[0.14]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          WebkitMaskImage:
            'radial-gradient(circle at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 78%)',
          maskImage:
            'radial-gradient(circle at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 78%)',
        }}
      />

      {/* 6. Centered Dark Glassmorphism Authentication Card */}
      <div className="relative z-10 w-full max-w-[430px] my-auto">
        {/* Subtle Purple-to-Blue Edge Highlight Rim */}
        <div
          aria-hidden="true"
          className="absolute -inset-[1px] rounded-[25px] bg-gradient-to-br from-purple-500/40 via-white/10 to-blue-500/35 opacity-80 pointer-events-none"
        />

        <div
          className="relative rounded-[24px] bg-[#090714]/82 backdrop-blur-2xl backdrop-saturate-150 border border-white/10 p-6 sm:p-8 shadow-[0_28px_80px_rgba(0,0,0,0.85)]"
          style={{
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.12), 0 28px 80px rgba(0,0,0,0.85)',
          }}
        >
          {/* Brand Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="relative inline-block">
              <div
                aria-hidden="true"
                className="oasis-auth-brand-glow absolute -inset-x-6 -inset-y-2 rounded-full bg-gradient-to-r from-purple-600/45 via-pink-500/35 to-blue-500/45 blur-xl pointer-events-none"
              />
              <Link
                href="/"
                className="relative inline-block text-2xl sm:text-3xl font-black tracking-tight text-white"
              >
                OASIS{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300">
                  PARK
                </span>
              </Link>
            </div>

            <p className="text-sm font-medium text-slate-200">
              Your digital park pass awaits
            </p>
            <p className="text-[11px] text-slate-400">
              Press Enter to begin your adventure
            </p>

            {/* 3 Decorative Gaming/Park Icons (Hidden from Screen Readers) */}
            <div
              aria-hidden="true"
              className="flex items-center justify-center gap-4 pt-1 text-purple-300/75"
            >
              <Ticket className="w-3.5 h-3.5 oasis-auth-icon-1" />
              <Gamepad2 className="w-3.5 h-3.5 text-blue-300/75 oasis-auth-icon-2" />
              <Sparkles className="w-3.5 h-3.5 text-pink-300/75 oasis-auth-icon-3" />
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-400/30 text-red-200 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {infoNotice && (
            <div className="mb-4 p-3 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-100 text-xs">
              {infoNotice}
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative group">
                  <label htmlFor="oasis-first-name" className="sr-only">
                    First Name
                  </label>
                  <UserIcon className="w-4 h-4 text-white/40 group-focus-within:text-purple-300 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="oasis-first-name"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    autoComplete="given-name"
                    className="w-full h-12 pl-10 pr-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/30 transition-all"
                  />
                </div>

                <div className="relative group">
                  <label htmlFor="oasis-last-name" className="sr-only">
                    Last Name
                  </label>
                  <UserIcon className="w-4 h-4 text-white/40 group-focus-within:text-purple-300 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="oasis-last-name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    autoComplete="family-name"
                    className="w-full h-12 pl-10 pr-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/30 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="relative group">
              <label htmlFor="oasis-auth-email" className="sr-only">
                Email Address
              </label>
              <Mail className="w-4 h-4 text-white/40 group-focus-within:text-purple-300 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="oasis-auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/30 transition-all"
              />
            </div>

            {mode === 'register' && (
              <div className="relative group">
                <label htmlFor="oasis-phone" className="sr-only">
                  Phone Number (Optional)
                </label>
                <Phone className="w-4 h-4 text-white/40 group-focus-within:text-purple-300 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="oasis-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone number (optional)"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/30 transition-all"
                />
              </div>
            )}

            {/* Password Field with Visibility Toggle */}
            <div className="relative group">
              <label htmlFor="oasis-auth-password" className="sr-only">
                Password
              </label>
              <Lock className="w-4 h-4 text-white/40 group-focus-within:text-purple-300 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="oasis-auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-12 pl-10 pr-11 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/[0.08] focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/40 hover:text-white focus:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Remember Me Toggle + Forgot Password Link */}
            {mode === 'login' && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={rememberMe}
                    aria-label="Remember me"
                    onClick={() => setRememberMe((prev) => !prev)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/60 ${
                      rememberMe
                        ? 'bg-purple-600 shadow-[0_0_12px_rgba(147,51,234,0.6)]'
                        : 'bg-white/15'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                        rememberMe ? 'translate-x-[18px]' : 'translate-x-[3px]'
                      }`}
                    />
                  </button>
                  <span className="text-xs text-white/75 group-hover:text-white transition-colors">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setInfoNotice(
                      'Password reset? Contact support on WhatsApp (+2348035382620) or retrieve your QR passes via Ticket Lookup.',
                    )
                  }
                  className="text-xs text-white/60 hover:text-purple-300 focus:text-purple-300 focus:outline-none transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Primary Login / Register Submit Button (Idle / Loading / Success) */}
            <button
              type="submit"
              disabled={submitState === 'loading'}
              className={`oasis-auth-primary-btn w-full h-12 mt-1 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400/60 ${
                submitState === 'success'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-[0_10px_28px_rgba(16,185,129,0.45)]'
                  : 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:brightness-110 hover:-translate-y-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_28px_rgba(124,58,237,0.45)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_14px_34px_rgba(124,58,237,0.6)]'
              } disabled:opacity-75 disabled:cursor-not-allowed`}
            >
              {submitState === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'login' ? 'Entering...' : 'Creating...'}</span>
                </>
              ) : submitState === 'success' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Access granted.</span>
                </>
              ) : (
                <span>
                  {mode === 'login' ? 'Enter Oasis' : 'Create Oasis Account'}
                </span>
              )}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="relative flex items-center my-5">
            <div className="flex-grow border-t border-white/10" />
            <span className="flex-shrink mx-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              quick access via
            </span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          {/* 3 Equal-Width Quick Access Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* 1. Google Account */}
            {googleClientId ? (
              <div
                ref={googleBtnContainerRef}
                aria-label="Sign in with Google account"
                className="h-11 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-purple-400/45 flex items-center justify-center transition-all hover:-translate-y-0.5"
              />
            ) : (
              <button
                type="button"
                onClick={handleGoogleFallbackClick}
                aria-label="Continue with Google account"
                title="Google account"
                className="h-11 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-purple-400/45 text-white/70 hover:text-white flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                <span className="text-[11px] font-semibold hidden sm:inline">
                  Google
                </span>
              </button>
            )}

            {/* 2. QR Pass Lookup */}
            <Link
              href="/lookup"
              aria-label="Retrieve Digital QR Pass"
              title="QR Pass Lookup"
              className="h-11 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-purple-400/45 text-white/70 hover:text-white flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            >
              <QrCode className="w-4 h-4" />
              <span className="text-[11px] font-semibold hidden sm:inline">
                QR Pass
              </span>
            </Link>

            {/* 3. Guest Park Booking */}
            <Link
              href="/book"
              aria-label="Quick Guest Booking"
              title="Book Attractions"
              className="h-11 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-purple-400/45 text-white/70 hover:text-white flex items-center justify-center gap-1.5 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="text-[11px] font-semibold hidden sm:inline">
                Book Pass
              </span>
            </Link>
          </div>

          {/* Bottom Signup / Signin Toggle Prompt */}
          <p className="mt-5 text-center text-xs text-white/55">
            {mode === 'login' ? (
              <>
                New to Oasis?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setInfoNotice(null);
                  }}
                  className="font-semibold text-white/90 hover:text-purple-300 focus:text-purple-300 focus:outline-none transition-colors"
                >
                  Create account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setInfoNotice(null);
                  }}
                  className="font-semibold text-white/90 hover:text-purple-300 focus:text-purple-300 focus:outline-none transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
