import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Console — Oasis Amusement Park',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
