import React from 'react';

export const OASIS_SOCIALS = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/oasisamusementpark',
    hoverClass:
      'hover:border-pink-400 hover:text-pink-300 hover:shadow-[0_0_16px_rgba(244,114,182,0.35)]',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com/@oasisamusementpark',
    hoverClass:
      'hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_16px_rgba(0,240,255,0.35)]',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
      >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/oasisamusementpark',
    hoverClass:
      'hover:border-blue-400 hover:text-blue-300 hover:shadow-[0_0_16px_rgba(96,165,250,0.35)]',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
      >
        <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/2348035382620?text=Hello%20Oasis%20Amusement%20Park!%20I%20would%20like%20to%20make%20an%20enquiry.',
    hoverClass:
      'hover:border-emerald-400 hover:text-emerald-300 hover:shadow-[0_0_16px_rgba(52,211,153,0.35)]',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
      >
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.82 14.12c-.24.68-1.42 1.31-1.97 1.39-.51.07-1.15.1-1.86-.12-.43-.14-.98-.32-1.69-.63-2.97-1.28-4.91-4.27-5.06-4.47-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.24.59.84 2.05.91 2.2.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.17-.31.38-.45.51-.15.15-.3.31-.13.61.17.3.77 1.27 1.65 2.06 1.13 1.01 2.09 1.32 2.39 1.47.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.96.3.15.49.22.57.34.07.12.07.72-.17 1.4z" />
      </svg>
    ),
  },
];

export function SocialLinks({
  showLabels = false,
  className = '',
}: {
  showLabels?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {OASIS_SOCIALS.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          aria-label={`Oasis Amusement Park on ${social.name}`}
          title={social.name}
          className={`inline-flex items-center gap-2 ${
            showLabels ? 'px-3.5 py-2 rounded-xl' : 'p-2.5 rounded-full'
          } bg-white/5 border border-white/15 text-white/85 transition-all ${social.hoverClass}`}
        >
          {social.icon}
          {showLabels && (
            <span className="text-xs font-bold">{social.name}</span>
          )}
        </a>
      ))}
    </div>
  );
}
