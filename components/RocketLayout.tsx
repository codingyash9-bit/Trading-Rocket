'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore, useUserStore } from '../store';
import type { NavigationSection } from '../types';

// ─── Icon Library ────────────────────────────────────────────────────────────
const Icons = {
  Logo: () => (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path d="M16 3L6 9v14l10 6 10-6V9L16 3Z" stroke="url(#logo-g)" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
      <path d="M16 8L11 11v10l5 3 5-3V11L16 8Z" fill="url(#logo-g)" opacity="0.85"/>
    </svg>
  ),

  Settings: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.1.543.56.941 1.11.941H17.025c.55 0 1.02-.398 1.11-.941l.213-1.281c.09-.543.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.1.543.56.941 1.11.941h1.55c.33 0 .61.232.74.574l1.587 3.161c.133.275.08.616-.107.878l-.826 1.233c-.195.292-.195.657 0 .949l3.826 2.309c.187.293.187.657-.107.878l-.826 1.233c-.195.292-.195.657 0 .949l1.587 3.161c.13.342.41.574.74.574h1.55c.55 0 1.02-.398 1.11-.941l.213-1.281c.09-.543.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.1.543.56.94 1.11.94h1.55c.33 0 .61-.232.74-.574l1.587-3.161c.133-.275.08-.616-.107-.878l-.826-1.233c-.195-.292-.195-.657 0-.949l.826-1.233c.195-.292.195-.657 0-.949l-1.587-3.161c-.13-.342-.41-.574-.74-.574h-1.55c-.55 0-1.02.398-1.11.94l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.1-.543-.56-.941-1.11-.941H6.96c-.55 0-1.02.398-1.11.94l-.213 1.281c-.09.543-.56.94-1.11.94H4.13c-.33 0-.61-.232-.74-.574L2.32 9.703c-.133-.275-.08-.616.107-.878l.826-1.233c.195-.292.195-.657 0-.949l-.826-1.233c-.195-.292-.195-.657 0-.949l1.587-3.161c.13-.342.41-.574.74-.574h1.55zM11.27 16.08c.29.29.77.29 1.06 0l2.594-2.593c.29-.29.29-.77 0-1.06l-2.594-2.593c-.29-.29-.77-.29-1.06 0l-2.593 2.593c-.29.29-.29.77 0 1.06l2.593 2.593z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),

  ChevronLeft: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>
  ),
  Bell: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
    </svg>
  ),
  Close: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  ),

  Logout: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
    </svg>
  ),

  // Nav icons
  StockIntelligence: () => (
    <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/>
    </svg>
  ),
  MarketPulse: () => (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"/>
    </svg>
  ),
  MarketIntelligence: () => (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"/>
    </svg>
  ),
  CompanyRadar: () => (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"/>
    </svg>
  ),
  RocketAI: () => (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
    </svg>
  ),
  PaperPortfolio: () => (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
    </svg>
  ),

  Aether: () => (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
      <circle cx="12" cy="12" r="2.5" strokeWidth={1.4} fill="none"/>
    </svg>
  ),
  Wargame: () => (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Graveyard: () => (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
};

// ─── Navigation config ────────────────────────────────────────────────────────
const navItems: Array<{
  id: NavigationSection;
  label: string;
  abbr: string;
  icon: React.FC;
  description: string;
  href?: string;
}> = [
  { id: 'stock-intelligence',  label: 'Stock Intelligence',  abbr: 'SI', icon: Icons.StockIntelligence,  description: 'AI equity analysis', href: '/analytics' },
  { id: 'market-pulse',        label: 'Market Pulse',        abbr: 'MP', icon: Icons.MarketPulse,        description: 'Real-time data', href: '/markets' },
  { id: 'market-intelligence', label: 'Market Intelligence', abbr: 'MI', icon: Icons.MarketIntelligence, description: 'News & signals', href: '/signals' },
  { id: 'company-radar',       label: 'Company Radar',       abbr: 'CR', icon: Icons.CompanyRadar,       description: 'Watchlist tracker', href: '/portfolio' },
  { id: 'rocket-ai',           label: 'Rocket AI',           abbr: 'AI', icon: Icons.RocketAI,           description: 'Markets assistant', href: '/ai' },
  { id: 'paper-portfolio',     label: 'Paper Portfolio',     abbr: 'PP', icon: Icons.PaperPortfolio,     description: 'AI-gen reports', href: '/alerts' },
  { id: 'chart-analysis',      label: 'Chart Analysis',      abbr: 'CA', icon: Icons.Aether,             description: 'Stock predictions', href: '/chart-analysis' },
  { id: 'wargame',             label: 'Earnings Wargame',    abbr: 'WG', icon: Icons.Wargame,            description: 'Scenario analysis', href: '/wargame' },
  { id: 'graveyard',           label: 'Signal Graveyard',    abbr: 'SG', icon: Icons.Graveyard,          description: 'Failed signals',    href: '/graveyard' },
];

// ease helper — plain array for Framer Motion
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar: React.FC = () => {
  const { sidebar, setActiveSection, toggleSidebar } = useUIStore();
  const { user } = useUserStore();
  const collapsed = sidebar.isCollapsed;
  const sidebarRouter = useRouter();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 232 }}
      transition={{ duration: 0.38, ease: EASE }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col glass-sidebar"
      style={{ willChange: 'width' }}
    >
      {/* Logo row */}
      <div className="flex items-center h-16 px-4 shrink-0"
           style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 flex items-center justify-center w-8 h-8">
            <Icons.Logo />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="min-w-0 overflow-hidden"
              >
                <p className="font-montserrat font-bold text-sm text-white leading-none whitespace-nowrap tracking-tight">
                  Trading Rocket
                </p>
                <p className="text-[10px] font-mono tracking-widest mt-0.5 whitespace-nowrap"
                   style={{ color: 'rgba(96,165,250,0.70)' }}>
                  INDIAN MARKETS
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <motion.button
          onClick={toggleSidebar}
          className="ml-auto shrink-0 w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-200"
          style={{ color: 'rgba(255,255,255,0.30)' }}
          whileHover={{ color: 'rgba(255,255,255,0.70)', backgroundColor: 'rgba(255,255,255,0.06)' }}
          whileTap={{ scale: 0.90 }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
        </motion.button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto scrollbar-hide" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Standard items */}
        {navItems.filter(i => !i.href).map((item) => {
          const active = sidebar.activeSection === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className="relative w-full flex items-center rounded-xl transition-colors duration-200"
              style={{
                height: 40,
                padding: collapsed ? '0' : '0 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : 10,
                background: active ? 'rgba(59,130,246,0.08)' : 'transparent',
                border: active ? '1px solid rgba(59,130,246,0.14)' : '1px solid transparent',
              }}
              whileHover={{
                background: active ? 'rgba(59,130,246,0.10)' : 'rgba(255,255,255,0.04)',
                transition: { duration: 0.15 },
              }}
              whileTap={{ scale: 0.97 }}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: 'linear-gradient(180deg, #60a5fa, #3b82f6)', boxShadow: '0 0 8px rgba(59,130,246,0.55)' }}
                  transition={{ duration: 0.35, ease: EASE }}
                />
              )}
              <span className="shrink-0 flex items-center justify-center w-[18px] h-[18px] transition-all duration-200"
                    style={{ color: active ? '#60a5fa' : 'rgba(255,255,255,0.35)' }}>
                <Icon />
              </span>
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="flex-1 text-left min-w-0 overflow-hidden"
                  >
                    <span className="block font-inter font-medium text-[13px] whitespace-nowrap leading-none"
                          style={{ color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.45)' }}>
                      {item.label}
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        {/* ── AETHER divider + special item ──────────────────────── */}
        <div style={{ height: 1, margin: '8px 4px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.25), transparent)' }} />
        {navItems.filter(i => !!i.href).map((item) => {
          const active = sidebar.activeSection === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => { setActiveSection(item.id); sidebarRouter.push(item.href!); }}
              className="relative w-full flex items-center rounded-xl transition-colors duration-200"
              style={{
                height: 40,
                padding: collapsed ? '0' : '0 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: collapsed ? 0 : 10,
                background: active
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.14), rgba(79,70,229,0.10))'
                  : 'transparent',
                border: active ? '1px solid rgba(124,58,237,0.28)' : '1px solid transparent',
                boxShadow: active ? '0 0 16px rgba(124,58,237,0.10)' : 'none',
              }}
              whileHover={{
                background: active
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(79,70,229,0.14))'
                  : 'rgba(124,58,237,0.07)',
                transition: { duration: 0.15 },
              }}
              whileTap={{ scale: 0.97 }}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.span
                  layoutId="nav-indicator-aether"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: 'linear-gradient(180deg, #a78bfa, #7c3aed)', boxShadow: '0 0 10px rgba(124,58,237,0.70)' }}
                  transition={{ duration: 0.35, ease: EASE }}
                />
              )}
              <span className="shrink-0 flex items-center justify-center w-[18px] h-[18px] transition-all duration-200"
                    style={{ color: active ? '#a78bfa' : 'rgba(167,139,250,0.40)' }}>
                <Icon />
              </span>
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="flex-1 text-left min-w-0 overflow-hidden"
                  >
                    <span style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono), monospace',
                      fontWeight: 600,
                      fontSize: 11.5,
                      letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                      lineHeight: 1,
                      color: active ? '#c4b5fd' : 'rgba(167,139,250,0.55)',
                    }}>
                      {item.label}
                    </span>
                    {!collapsed && (
                      <span style={{ display: 'block', fontSize: 9, color: 'rgba(124,58,237,0.55)', letterSpacing: '0.04em', marginTop: 1 }}>
                        {item.description.toUpperCase()}
                      </span>
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* User row */}
      {user && (
        <div className="shrink-0 px-2 pb-3 pt-2"
             style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl"
               style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
                 style={{ background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)' }}>
              {user.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="min-w-0 flex-1 overflow-hidden"
                >
                  <p className="text-[12px] font-semibold text-white/80 truncate leading-none">
                    {user.displayName}
                  </p>
                  <p className="text-[10.5px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    {user.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

// ─── Search Modal ─────────────────────────────────────────────────────────────
const SearchModal: React.FC = () => {
  const { search, setSearchQuery, setSearchOpen } = useUIStore();
  const [q, setQ] = useState('');

  useEffect(() => { setQ(search.query); }, [search.query]);

  if (!search.isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="search-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-28 px-4"
        onClick={() => setSearchOpen(false)}
      >
        {/* Backdrop */}
        <div className="absolute inset-0"
             style={{ background: 'rgba(5,8,16,0.72)', backdropFilter: 'blur(8px)' }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -16 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="relative w-full max-w-xl glass-elevated overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top border highlight */}
          <div className="absolute top-0 left-8 right-8 h-px"
               style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }} />

          {/* Search input row */}
          <div className="flex items-center gap-3 px-5 py-4"
               style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: 'rgba(255,255,255,0.30)' }}>
              <Icons.Search />
            </span>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setSearchQuery(q); }}
              placeholder="Search NSE / BSE stocks…"
              className="flex-1 bg-transparent text-white placeholder-white/25 outline-none text-[14px] font-inter"
              autoFocus
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150"
              style={{ color: 'rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.05)' }}
            >
              <Icons.Close />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto">
            {search.isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : search.results.length > 0 ? (
              <div className="p-2 space-y-0.5">
                {search.results.map((r) => (
                  <button
                    key={`${r.ticker}-${r.exchange}`}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
                    style={{ background: 'transparent' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                         style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.15)' }}>
                      <span className="text-[11px] font-mono font-bold text-blue-400">
                        {r.ticker.slice(0, 3)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-white/85 truncate">{r.name}</p>
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.30)' }}>
                        {r.exchange} · {r.sector}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono shrink-0"
                          style={{ color: 'rgba(255,255,255,0.28)' }}>
                      {r.exchange}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {q.length > 0 ? `No results for "${q}"` : 'Start typing to search stocks'}
                </p>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-5 py-3 flex items-center justify-between"
               style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.22)' }}>ESC to close</span>
            <span className="text-[11px] font-mono" style={{ color: 'rgba(59,130,246,0.60)' }}>NSE / BSE</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Top Navigation Bar ───────────────────────────────────────────────────────
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';

const TopNav: React.FC = () => {
  const { sidebar, setSearchOpen, notifications, showNotifs, toggleShowNotifs } = useUIStore();
  const { user, setUser } = useUserStore();
  const [showUser, setShowUser] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const unread = notifications.filter((n) => !n.isRead).length;
  const sidebarW = sidebar.isCollapsed ? 64 : 232;
  const isLandingPage = pathname === '/';

  return (
    <motion.div
      role="banner"
      initial={false}
      animate={{ x: 0 }}
      transition={{ duration: 0.38, ease: EASE }}
      className="fixed top-0 left-0 right-0 h-16 z-30 glass-topbar"
      style={{ left: 0, paddingLeft: sidebarW }}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search trigger */}
        <motion.button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-200"
          style={{
            minWidth: 240,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          whileHover={{
            background: 'rgba(255,255,255,0.06)',
            borderColor: 'rgba(255,255,255,0.09)',
          }}
          whileTap={{ scale: 0.99 }}
        >
          <span style={{ color: 'rgba(255,255,255,0.28)' }}><Icons.Search /></span>
          <span className="text-[13px] font-inter flex-1 text-left" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Search stocks…
          </span>
          <kbd className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono"
               style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
            Ctrl K
          </kbd>
        </motion.button>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {/* User menu */}
          {user && (
            <div className="relative">
              <motion.button
                onClick={() => { setShowUser(!showUser); toggleShowNotifs(); }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                whileHover={{ background: 'rgba(255,255,255,0.07)' }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
                     style={{ background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)' }}>
                  {user.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <span className="hidden md:block text-[13px] font-medium text-white/70">
                  {user.displayName}
                </span>
                <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>

              <AnimatePresence>
                {showUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: EASE }}
                    className="absolute right-0 top-full mt-2 w-56 dropdown-glass overflow-hidden z-50"
                    style={{ 
                      boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1), 0 0 30px rgba(99,102,241,0.15)',
                      borderRadius: '16px',
                    }}
                  >
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-[13px] font-semibold text-white/90 truncate">{user.displayName}</p>
                      <p className="text-[11.5px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{user.email}</p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <button 
                        onClick={() => { router.push('/settings'); setShowUser(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] transition-all duration-150"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.12)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.3-.3.3-.8 0-1.1l-.6-.6c-.3-.3-.8-.3-1.1 0l-.7.7.7c-.3.3-.3.8 0 1.1l1.4 1.4c.3.3.8.3 1.1 0l.7-.7c.3-.3.3-.8 0-1.1l-.6-.6c-.3-.3-.8-.3-1.1 0L10 6.7c-.3-.3-.3-.8 0-1.1l1.4-1.4c.3-.3.8-.3 1.1 0l.7.7c.3.3.3.8 0 1.1l-1.4 1.4c-.3.3-.3.8 0 1.1l.6.6c.3.3.8.3 1.1 0l.7-.7c.3-.3.3-.8 0-1.1l-1.4-1.4z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await signOut(auth);
                            setUser(null);
                            router.replace('/');
                          } catch (e) {
                            console.error('Logout failed:', e);
                          }
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] transition-all duration-150"
                        style={{ color: '#f87171' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244,63,94,0.12)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign out</span>
                      </button>
                    </div>
                    <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-[10px] text-white/25">Trading Rocket v1.0</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Ambient Background ───────────────────────────────────────────────────────
const AmbientBackground: React.FC = () => (
  <div className="bg-mesh" aria-hidden="true" />
);

// ─── Root Layout ──────────────────────────────────────────────────────────────
interface RocketLayoutProps { children: React.ReactNode; }

const RocketLayout: React.FC<RocketLayoutProps> = ({ children }) => {
  const { sidebar } = useUIStore();
  const sidebarW = sidebar.isCollapsed ? 64 : 232;
  const router = useRouter();
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <div className="flex h-screen overflow-hidden">
      <AmbientBackground />
      <Sidebar />
      <TopNav />
      <SearchModal />

      {/* Floating Hub Shortcut (Bottom Right) */}
      {pathname !== '/features' && (
        <motion.button
          onClick={() => router.push('/features')}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 shadow-2xl group"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
            border: '1px solid rgba(59,130,246,0.3)',
            backdropFilter: 'blur(16px)',
          }}
          whileHover={{ 
            scale: 1.1,
            borderColor: 'rgba(59,130,246,0.6)',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.25))',
          }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <svg className="w-6 h-6 text-blue-400 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </motion.button>
      )}

      <main
        className="flex-1 overflow-y-auto"
        style={{
          marginLeft: sidebarW,
          marginTop: 64,
          height: 'calc(100vh - 64px)',
          transition: `margin-left 0.38s cubic-bezier(0.16,1,0.3,1)`,
        }}
      >
        <div className="p-8 min-h-full relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default RocketLayout;
