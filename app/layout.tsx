import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Oasis Amusement Park | Unleash The Fun',
  description:
    'Experience the ultimate physical entertainment destination: High-speed Bumper Cars, VR Arenas, Trampolines, Arcade Games, and Child Zones in Lagos.',
  keywords: ['amusement park', 'arcade', 'virtual reality', 'trampoline park', 'oasis', 'lagos'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-oasis-navy text-foreground antialiased selection:bg-oasis-purple selection:text-white"
      >
        {children}
      </body>
    </html>
  );
}
