'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import GlobalErrorBoundary from '@/components/GlobalErrorBoundary';
import NeuralBackground from '@/components/NeuralBackground';
import PageTransition from '@/components/PageTransition';
import { useUIStore, useUserStore } from '@/store';
import MarketPulse from '@/components/pages/MarketPulse';
import StockIntelligence from '@/components/pages/StockIntelligence';
import CompanyRadar from '@/components/pages/CompanyRadarNew';
import RocketAI from '@/components/pages/RocketAI';
import PaperPortfolio from '@/components/pages/PaperPortfolio';
import MarketIntelligence from '@/components/pages/MarketIntelligence';
import type { NavigationSection } from '@/types';

const AetherRedirect: React.FC = () => { const r = useRouter(); useEffect(() => { r.push('/aether'); }, [r]); return null; };

import ChartAnalysisPage from '@/app/chart-analysis/page';
import WargamePage from '@/app/wargame/page';
import GraveyardPage from '@/app/graveyard/page';

const pageComponents: Record<NavigationSection, React.FC> = {
  'stock-intelligence': StockIntelligence,
  'market-pulse': MarketPulse,
  'market-intelligence': MarketIntelligence,
  'company-radar': CompanyRadar,
  'rocket-ai': RocketAI,
  'paper-portfolio': PaperPortfolio,
  'aether': AetherRedirect,
  'chart-analysis': ChartAnalysisPage,
  'wargame': WargamePage,
  'graveyard': GraveyardPage,
};

const pathToSection: Record<string, NavigationSection> = {
  '/analytics': 'stock-intelligence',
  '/markets': 'market-pulse',
  '/signals': 'market-intelligence',
  '/portfolio': 'company-radar',
  '/ai': 'rocket-ai',
  '/alerts': 'paper-portfolio',
  '/features': 'stock-intelligence',
  '/aether': 'aether',
  '/chart-analysis': 'chart-analysis',
  '/wargame': 'wargame',
  '/graveyard': 'graveyard',
};

const BackButton: React.FC = () => {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.push('/features')}
      className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span className="text-sm font-medium">Back</span>
    </button>
  );
};

const FeatureWrapper: React.FC = () => {
  const { sidebar, setActiveSection } = useUIStore();
  const { setUser, isAuthenticated } = useUserStore();
  const pathname = usePathname();
  
  useEffect(() => {
    const section = pathToSection[pathname];
    if (section && sidebar.activeSection !== section) {
      setActiveSection(section);
    }
  }, [pathname, setActiveSection, sidebar.activeSection]);

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
  }, []);

  const ActivePage = pageComponents[sidebar.activeSection];
  
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white">
      <BackButton />
      <NeuralBackground subtle blurred />
      
      <main className="relative z-10 w-full h-full overflow-y-auto">
        <PageTransition>
          <div className="flex items-center justify-center min-h-full px-4 md:px-6 pt-16 pb-24">
            <div className="w-full max-w-7xl">
              <GlobalErrorBoundary>
                <ActivePage />
              </GlobalErrorBoundary>
            </div>
          </div>
        </PageTransition>
      </main>
    </div>
  );
};

export default function PortfolioPage() {
  return <FeatureWrapper />;
}