import './globals.css';
import type { Metadata } from 'next';
import { SiteHeader } from '../components/site-header';

export const metadata: Metadata = {
  title: 'Nexus Agent Model Hub',
  description: 'Deployable multi-tenant platform with model catalog, leaderboard, docs center, and Agent workspace'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
