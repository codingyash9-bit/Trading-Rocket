'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store';
import PageTransition from '@/components/PageTransition';
import NeuralBackground from '@/components/NeuralBackground';

export default function AetherLayout({ children }: { children: React.ReactNode }) {
  const { setUser, isAuthenticated } = useUserStore();

  // Ensure demo user is populated if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setUser({
        uid: 'demo-user-001',
        email: 'investor@tradingrocket.in',
        displayName: 'Demo Investor',
        photoURL: null,
        preferences: {
          investmentBudget: 5000000,
          riskTolerance: 'Moderate',
          timeHorizon: 'Medium-term',
          watchlist: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'],
          theme: 'dark',
          notifications: {
            priceAlerts: true,
            sentimentChanges: true,
            portfolioUpdates: true,
          },
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });
    }
  }, [isAuthenticated, setUser]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white">
      <NeuralBackground subtle blurred />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80 pointer-events-none z-[1]" />
      
      <main className="relative z-10 w-full h-full overflow-y-auto">
        <PageTransition>
          <div className="flex items-center justify-center min-h-full px-4 md:px-6 pt-16 pb-24">
            <div className="w-full max-w-7xl">
              {children}
            </div>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
