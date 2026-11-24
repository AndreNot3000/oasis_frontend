'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function LocalBridgeInner() {
  const params = useParams<{ port?: string }>();
  const searchParams = useSearchParams();
  const rawPort = String(params?.port || '');
  const isValidPort = /^\d{2,5}$/.test(rawPort);
  const cancelled = searchParams.get('cancelled') === '1';
  const checkoutId = searchParams.get('checkout_id') || searchParams.get('pay') || '';

  const targetUrl = !isValidPort
    ? null
    : cancelled
    ? `http://localhost:${rawPort}/book`
    : checkoutId
    ? `http://localhost:${rawPort}/payment/bachs/return?checkout_id=${encodeURIComponent(checkoutId)}`
    : `http://localhost:${rawPort}/lookup`;

  const [manualReady, setManualReady] = useState(false);

  useEffect(() => {
    if (!targetUrl) return;
    window.location.replace(targetUrl);
    const t = setTimeout(() => setManualReady(true), 1200);
    return () => clearTimeout(t);
  }, [targetUrl]);

  return (
    <div className="min-h-screen bg-oasis-navy text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full p-8 rounded-3xl bg-oasis-card border border-slate-800 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h1 className="text-xl font-black">Returning to Localhost</h1>
        <p className="text-sm text-slate-300">
          {targetUrl
            ? `Redirecting your sandbox checkout back to http://localhost:${rawPort}...`
            : 'Invalid localhost port.'}
        </p>
        {manualReady && targetUrl && (
          <a
            href={targetUrl}
            className="inline-flex px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-400 text-oasis-navy"
          >
            Continue to localhost:{rawPort}
          </a>
        )}
      </div>
    </div>
  );
}

export default function BachsLocalBridgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-oasis-navy" />}>
      <LocalBridgeInner />
    </Suspense>
  );
}
