'use client';

import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  Calendar,
  Mail,
  Phone,
  Gamepad2,
  Camera,
  CameraOff,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

export function ScannerCheckInTab() {
  const [qrInput, setQrInput] = useState('');
  const [validatedTicket, setValidatedTicket] = useState<any | null>(null);
  const [quantitiesByTicket, setQuantitiesByTicket] = useState<Record<string, number>>({});
  const [locationNote, setLocationNote] = useState<string>('Main Turnstile Gate A');
  const [checkInReceipt, setCheckInReceipt] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live Camera QR Scanner State
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const validatePayload = async (rawPayload: string) => {
    const trimmed = rawPayload.trim();
    if (!trimmed) return;
    setError(null);
    setCheckInReceipt(null);
    try {
      setLoading(true);
      const res = await apiClient<any>('/tickets/validate', {
        method: 'POST',
        body: JSON.stringify({ qrPayload: trimmed }),
      });
      setValidatedTicket(res);
      const initialQty: Record<string, number> = {};
      (res.allTickets || []).forEach((t: any) => {
        initialQty[t.ticketId] = 1;
      });
      if (res.ticketId && !initialQty[res.ticketId]) {
        initialQty[res.ticketId] = 1;
      }
      setQuantitiesByTicket(initialQty);
    } catch (err: any) {
      setValidatedTicket(null);
      setError(err.message || 'Invalid or unrecognised QR token / ticket code');
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  useEffect(() => {
    if (!cameraOpen) return;
    let active = true;
    let frameId = 0;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError('Camera access requires HTTPS (e.g. your Cloudflare Tunnel URL) or localhost.');
          setCameraOpen(false);
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const scanLoop = () => {
          if (!active) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const decoded = jsQR(imgData.data, imgData.width, imgData.height, {
                inversionAttempts: 'dontInvert',
              });
              if (decoded?.data) {
                setQrInput(decoded.data);
                stopCamera();
                void validatePayload(decoded.data);
                return;
              }
            }
          }
          frameId = requestAnimationFrame(scanLoop);
        };
        frameId = requestAnimationFrame(scanLoop);
      } catch (err: any) {
        setError(
          err?.message || 'Unable to access camera. Check browser camera permissions.',
        );
        stopCamera();
      }
    }

    void startCamera();

    return () => {
      active = false;
      cancelAnimationFrame(frameId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [cameraOpen]);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    await validatePayload(qrInput);
  };

  const handleExecuteCheckIn = async (targetTicketId: string) => {
    if (!validatedTicket) return;
    const qty = Number(quantitiesByTicket[targetTicketId] || 1);
    setError(null);
    try {
      setLoading(true);
      const res = await apiClient<any>('/check-ins', {
        method: 'POST',
        body: JSON.stringify({
          ticketId: targetTicketId,
          quantityIn: qty,
          locationNote: locationNote.trim() || 'Main Turnstile Gate A',
        }),
      });
      setCheckInReceipt(res);
      setValidatedTicket((prev: any) => {
        if (!prev) return null;
        const updatedTickets = (prev.allTickets || []).map((t: any) =>
          t.ticketId === targetTicketId
            ? {
                ...t,
                admittedCount: res.totalAdmittedSoFar,
                remainingAdmissions: res.remainingQuantity,
                status: res.ticketStatus,
              }
            : t,
        );
        return {
          ...prev,
          allTickets: updatedTickets,
          admittedCount:
            prev.ticketId === targetTicketId
              ? res.totalAdmittedSoFar
              : prev.admittedCount,
          remainingAdmissions:
            prev.ticketId === targetTicketId
              ? res.remainingQuantity
              : prev.remainingAdmissions,
          status:
            prev.ticketId === targetTicketId ? res.ticketStatus : prev.status,
        };
      });
    } catch (err: any) {
      setError(err.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="p-6 rounded-2xl bg-oasis-card border border-slate-800 space-y-4">
        <div>
          <span className="text-xs font-bold uppercase text-oasis-cyan">
            Turnstile &amp; Attraction Gate Validation
          </span>
          <h2 className="text-xl font-black text-white mt-0.5 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-oasis-yellow" />
            QR Ticket Scanner &amp; Partial Group Check-In
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Scan a visitor&apos;s QR code (or enter their ticket code{' '}
            <code className="text-oasis-yellow">TKT-2026-...</code>) to verify
            authenticity and admit all or part of their group.
          </p>
        </div>

        <form onSubmit={handleValidate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder="Scan QR or enter Booking Ref (OAS-2026-...) / Ticket Code (TKT-2026-...)"
            className="flex-1 px-4 py-3 rounded-xl bg-oasis-navy border border-slate-700 text-xs sm:text-sm font-mono text-white"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (cameraOpen ? stopCamera() : setCameraOpen(true))}
              className={`px-4 py-3 rounded-xl font-black text-xs sm:text-sm inline-flex items-center gap-1.5 whitespace-nowrap border transition-colors ${
                cameraOpen
                  ? 'bg-red-500/20 text-red-200 border-red-500/40'
                  : 'bg-oasis-navy text-oasis-cyan border-oasis-cyan/40 hover:bg-oasis-navyLight'
              }`}
            >
              {cameraOpen ? (
                <>
                  <CameraOff className="w-4 h-4" /> Close Camera
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" /> Scan with Camera
                </>
              )}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-oasis-purple to-oasis-cyan text-white whitespace-nowrap"
            >
              {loading ? 'Validating...' : 'Validate Pass'}
            </button>
          </div>
        </form>

        {cameraOpen && (
          <div className="relative rounded-2xl overflow-hidden bg-black border border-oasis-cyan/40 max-w-md mx-auto">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-44 h-44 rounded-2xl border-2 border-oasis-cyan shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
            </div>
            <div className="absolute bottom-2 inset-x-0 text-center text-[11px] font-bold text-oasis-cyan drop-shadow">
              Point camera at the guest&apos;s QR code
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {validatedTicket && (
        <div className="p-6 rounded-2xl bg-oasis-card border border-oasis-cyan/40 space-y-6">
          {/* Header: Guest, Reference & Amount */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Cryptographic Master QR Pass Verified
              </div>
              <h3 className="text-xl font-black text-white">
                {validatedTicket.visitorName || 'Guest'}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                <span>
                  Ref:{' '}
                  <strong className="font-mono text-oasis-yellow">
                    {validatedTicket.bookingReference}
                  </strong>
                </span>
                {validatedTicket.visitDate && (
                  <span className="inline-flex items-center gap-1 text-oasis-cyan">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(validatedTicket.visitDate).toLocaleDateString('en-NG', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
                {validatedTicket.customer?.email && (
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Mail className="w-3.5 h-3.5" /> {validatedTicket.customer.email}
                  </span>
                )}
                {validatedTicket.customer?.phoneNumber && (
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Phone className="w-3.5 h-3.5" /> {validatedTicket.customer.phoneNumber}
                  </span>
                )}
              </div>
            </div>
            <div className="sm:text-right space-y-1">
              {validatedTicket.totalAmountMinor !== undefined && (
                <div className="text-lg font-black text-oasis-yellow">
                  {formatCurrency(
                    validatedTicket.totalAmountMinor,
                    validatedTicket.currency || 'NGN',
                  )}
                </div>
              )}
              <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {validatedTicket.bookingStatus || validatedTicket.status}
              </span>
            </div>
          </div>

          {/* Gate Station Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-oasis-navy border border-slate-800">
            <span className="text-xs font-bold text-slate-300">
              Active Check-In Station / Gate:
            </span>
            <input
              type="text"
              value={locationNote}
              onChange={(e) => setLocationNote(e.target.value)}
              className="sm:w-72 px-3 py-1.5 rounded-lg bg-oasis-card border border-slate-700 text-xs text-white"
            />
          </div>

          {/* All Booked Passes & Admissions Included in This QR */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              All Included Passes ({(validatedTicket.allTickets || [validatedTicket]).length})
            </div>

            {(validatedTicket.allTickets || [validatedTicket]).map((tkt: any) => {
              const qtyVal = quantitiesByTicket[tkt.ticketId] ?? 1;
              return (
                <div
                  key={tkt.ticketId}
                  className="p-4 rounded-xl bg-oasis-navy border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {tkt.title}
                      </span>
                      <span className="font-mono text-[11px] text-oasis-cyan">
                        {tkt.ticketCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          tkt.remainingAdmissions > 0
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {tkt.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Purchased: <strong className="text-white">{tkt.totalQuantity}</strong> •
                      Admitted: <strong className="text-oasis-cyan">{tkt.admittedCount}</strong> •
                      Remaining: <strong className="text-oasis-yellow">{tkt.remainingAdmissions}</strong>
                    </div>
                  </div>

                  {tkt.remainingAdmissions > 0 ? (
                    <div className="flex items-center gap-2.5">
                      <input
                        type="number"
                        min={1}
                        max={tkt.remainingAdmissions}
                        value={qtyVal}
                        onChange={(e) =>
                          setQuantitiesByTicket((prev) => ({
                            ...prev,
                            [tkt.ticketId]: Number(e.target.value),
                          }))
                        }
                        className="w-20 px-3 py-2 rounded-xl bg-oasis-card border border-slate-700 text-sm font-black text-white text-center"
                      />
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleExecuteCheckIn(tkt.ticketId)}
                        className="py-2 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-400 to-oasis-cyan text-oasis-navy flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Admit {qtyVal}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400">
                      ✓ Fully Checked In
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pay-Per-Play Credits if any */}
          {validatedTicket.playPasses?.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-oasis-coral" />
                Included Play-Per-Play Credits
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {validatedTicket.playPasses.map((pp: any) => (
                  <div
                    key={pp.id}
                    className="p-3 rounded-xl bg-oasis-navy border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-white">Arcade / Play Credits</span>
                    <span className="font-black text-oasis-yellow">
                      {pp.remainingPlays} / {pp.totalPlays} plays left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {checkInReceipt && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>
                Admitted <strong>{checkInReceipt.quantityAdmittedNow}</strong>{' '}
                visitor(s) at <strong>{checkInReceipt.locationNote}</strong>.
                Total Admitted: {checkInReceipt.totalAdmittedSoFar} • Remaining:{' '}
                {checkInReceipt.remainingQuantity} • Status:{' '}
                <strong>{checkInReceipt.ticketStatus}</strong>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
