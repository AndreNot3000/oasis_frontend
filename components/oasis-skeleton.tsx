import React from 'react';

/**
 * Shape-matched Neon Aurora Skeletons for Oasis Amusement Park.
 * Combines Neon Aurora Shimmer Sweep with silhouettes matched to each view.
 */

export function CarouselSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading attractions carousel">
      <div className="relative flex items-center justify-center gap-6 sm:gap-10 py-6 overflow-hidden">
        {/* Left Crumpled Paper-Ball Silhouette */}
        <div className="hidden md:block w-52 h-52 rounded-full oasis-skeleton opacity-55 flex-shrink-0" />

        {/* Center Flat Poster Card Silhouette */}
        <div className="w-full max-w-[507px] h-[360px] sm:h-[400px] rounded-2xl bg-white/[0.03] border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="h-7 w-36 rounded-full oasis-skeleton" />
            <div className="h-7 w-16 rounded-full oasis-skeleton" />
          </div>

          <div className="space-y-3 mt-auto">
            <div className="h-8 w-3/4 rounded-xl oasis-skeleton" />
            <div className="h-4 w-full rounded-lg oasis-skeleton" />
            <div className="h-4 w-2/3 rounded-lg oasis-skeleton" />
            <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between">
              <div className="h-4 w-28 rounded-lg oasis-skeleton" />
              <div className="h-5 w-24 rounded-lg oasis-skeleton" />
            </div>
          </div>
        </div>

        {/* Right Crumpled Paper-Ball Silhouette */}
        <div className="hidden md:block w-52 h-52 rounded-full oasis-skeleton opacity-55 flex-shrink-0" />
      </div>

      {/* Bottom Caption & CTA Bar Silhouette */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 sm:px-6">
        <div className="space-y-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <div className="h-5 w-28 rounded-full oasis-skeleton" />
            <div className="h-4 w-20 rounded-lg oasis-skeleton" />
          </div>
          <div className="h-6 w-64 rounded-xl oasis-skeleton" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-24 rounded-xl oasis-skeleton" />
          <div className="h-9 w-28 rounded-xl oasis-skeleton" />
        </div>
      </div>
    </div>
  );
}

export function AttractionGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      aria-busy="true"
      aria-label="Loading attractions"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl overflow-hidden bg-oasis-card/70 border border-white/10 flex flex-col"
        >
          {/* Image Banner Silhouette with Top Badges */}
          <div className="relative h-44 oasis-skeleton border-0">
            <div className="absolute top-3 left-3 h-6 w-24 rounded-full bg-black/40" />
            <div className="absolute top-3 right-3 h-5 w-16 rounded-full bg-black/40" />
          </div>
          <div className="p-5 space-y-3 flex-1 flex flex-col">
            <div className="h-5 w-3/4 rounded-lg oasis-skeleton" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-full rounded oasis-skeleton" />
              <div className="h-3.5 w-5/6 rounded oasis-skeleton" />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="h-3.5 w-24 rounded oasis-skeleton" />
              <div className="h-4 w-20 rounded oasis-skeleton" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="h-9 flex-1 rounded-xl oasis-skeleton" />
              <div className="h-9 flex-1 rounded-xl oasis-skeleton" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PackageGridSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      aria-busy="true"
      aria-label="Loading packages"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-3xl p-7 bg-oasis-card/70 border border-white/10 flex flex-col sm:flex-row gap-6 justify-between"
        >
          <div className="space-y-3 flex-1">
            <div className="h-6 w-32 rounded-full oasis-skeleton" />
            <div className="h-7 w-2/3 rounded-xl oasis-skeleton" />
            <div className="h-4 w-full rounded oasis-skeleton" />
            <div className="h-4 w-4/5 rounded oasis-skeleton" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-28 rounded-lg oasis-skeleton" />
              <div className="h-6 w-32 rounded-lg oasis-skeleton" />
            </div>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10">
            <div className="space-y-1.5 sm:text-right">
              <div className="h-3 w-16 rounded oasis-skeleton sm:ml-auto" />
              <div className="h-7 w-28 rounded-xl oasis-skeleton" />
            </div>
            <div className="h-10 w-32 rounded-xl oasis-skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TicketPassSkeleton() {
  return (
    <div
      className="relative p-6 sm:p-8 rounded-3xl bg-oasis-card/75 border border-white/10 flex flex-col md:flex-row items-center gap-7"
      aria-busy="true"
      aria-label="Loading digital QR pass"
    >
      {/* Left QR Code Stub Silhouette */}
      <div className="flex flex-col items-center space-y-3 flex-shrink-0">
        <div className="h-5 w-32 rounded-full oasis-skeleton" />
        <div className="w-48 h-48 rounded-2xl oasis-skeleton" />
        <div className="h-4 w-36 rounded oasis-skeleton" />
      </div>

      {/* Right Included Passes Rows */}
      <div className="flex-1 w-full space-y-3">
        <div className="h-4 w-48 rounded oasis-skeleton" />
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="h-4 w-48 rounded oasis-skeleton" />
              <div className="h-3 w-32 rounded oasis-skeleton" />
            </div>
            <div className="h-6 w-16 rounded-lg oasis-skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-7" aria-busy="true" aria-label="Loading admin dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="space-y-2">
          <div className="h-3.5 w-44 rounded oasis-skeleton" />
          <div className="h-8 w-72 rounded-xl oasis-skeleton" />
          <div className="h-3 w-48 rounded oasis-skeleton" />
        </div>
        <div className="flex gap-2.5">
          <div className="h-9 w-32 rounded-xl oasis-skeleton" />
          <div className="h-9 w-24 rounded-xl oasis-skeleton" />
        </div>
      </div>

      {/* 6-Card KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-oasis-card/70 border border-white/10 space-y-2"
          >
            <div className="h-3 w-20 rounded oasis-skeleton" />
            <div className="h-6 w-24 rounded-lg oasis-skeleton" />
            <div className="h-3 w-16 rounded oasis-skeleton" />
          </div>
        ))}
      </div>

      {/* Tabs Strip */}
      <div className="flex gap-2 overflow-hidden pb-3 border-b border-white/10">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-36 rounded-xl oasis-skeleton flex-shrink-0" />
        ))}
      </div>

      {/* 2-Column Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((col) => (
          <div
            key={col}
            className="p-5 rounded-2xl bg-oasis-card/70 border border-white/10 space-y-3"
          >
            <div className="flex justify-between items-center pb-2">
              <div className="h-5 w-40 rounded-lg oasis-skeleton" />
              <div className="h-4 w-20 rounded oasis-skeleton" />
            </div>
            {[1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex justify-between items-center"
              >
                <div className="space-y-1.5">
                  <div className="h-4 w-36 rounded oasis-skeleton" />
                  <div className="h-3 w-48 rounded oasis-skeleton" />
                </div>
                <div className="space-y-1.5 text-right">
                  <div className="h-4 w-16 rounded oasis-skeleton ml-auto" />
                  <div className="h-3 w-20 rounded oasis-skeleton ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
