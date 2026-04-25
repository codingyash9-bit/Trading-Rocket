import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter:      ['var(--font-inter)', 'system-ui', 'sans-serif'],
        montserrat: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
        mono:       ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        // ── Surface palette ─────────────────────────────────
        surface: {
          0:  '#080c14',
          1:  '#0c1120',
          2:  '#101828',
          3:  '#151f30',
          4:  '#1a2540',
        },
        // ── Accent ──────────────────────────────────────────
        accent: {
          blue:   '#3b82f6',
          cyan:   '#06b6d4',
          indigo: '#6366f1',
          purple: '#8b5cf6',
        },
        // ── Semantic ────────────────────────────────────────
        profit: {
          DEFAULT: '#10b981',
          dim:     'rgba(16,185,129,0.12)',
          glow:    'rgba(16,185,129,0.25)',
        },
        loss: {
          DEFAULT: '#f43f5e',
          dim:     'rgba(244,63,94,0.12)',
          glow:    'rgba(244,63,94,0.25)',
        },
        // ── Legacy colour maps kept for backward compat ─────
        warm:    { 50:'#f8f8f8', 100:'rgba(255,255,255,0.08)', 200:'rgba(255,255,255,0.06)', 300:'rgba(255,255,255,0.40)', 400:'rgba(255,255,255,0.28)', 500:'rgba(255,255,255,0.50)', 600:'rgba(255,255,255,0.70)', 700:'rgba(255,255,255,0.82)', 800:'rgba(255,255,255,0.90)', 900:'rgba(255,255,255,0.95)' },
        cream:   { 50:'rgba(255,255,255,0.04)', 100:'rgba(255,255,255,0.06)', 200:'rgba(255,255,255,0.08)', 300:'rgba(255,255,255,0.12)', 400:'rgba(255,255,255,0.18)', 500:'rgba(255,255,255,0.28)' },
        sand:    { 50:'rgba(255,255,255,0.03)', 100:'rgba(255,255,255,0.05)', 200:'rgba(255,255,255,0.07)', 300:'rgba(255,255,255,0.10)', 400:'rgba(255,255,255,0.16)', 500:'rgba(255,255,255,0.24)', 600:'rgba(255,255,255,0.40)' },
        gold:    { 50:'rgba(251,191,36,0.06)', 100:'rgba(251,191,36,0.10)', 200:'rgba(251,191,36,0.16)', 300:'rgba(251,191,36,0.24)', 400:'#fbbf24', 500:'#f59e0b', 600:'#d97706' },
        twilight:{ 50:'rgba(255,255,255,0.04)', 100:'rgba(255,255,255,0.07)', 200:'rgba(255,255,255,0.10)', 300:'rgba(255,255,255,0.18)', 400:'rgba(255,255,255,0.28)', 500:'rgba(255,255,255,0.42)', 600:'rgba(255,255,255,0.58)', 700:'rgba(255,255,255,0.72)', 800:'rgba(255,255,255,0.82)', 900:'rgba(255,255,255,0.92)' },
        sunset:  { 50:'rgba(59,130,246,0.05)', 100:'rgba(59,130,246,0.08)', 200:'rgba(59,130,246,0.12)', 300:'rgba(59,130,246,0.18)', 400:'#60a5fa', 500:'#3b82f6', 600:'#1d4ed8' },
        lavender:{ 50:'rgba(139,92,246,0.05)', 100:'rgba(139,92,246,0.08)', 200:'rgba(139,92,246,0.12)', 300:'rgba(139,92,246,0.18)', 400:'#a78bfa', 500:'#8b5cf6', 600:'#6d28d9' },
        amber:   { 50:'rgba(251,191,36,0.05)', 100:'rgba(251,191,36,0.09)', 200:'rgba(251,191,36,0.14)', 300:'rgba(251,191,36,0.22)', 400:'#fbbf24', 500:'#f59e0b', 600:'#d97706', 700:'#b45309' },
        rose:    { 50:'rgba(244,63,94,0.05)', 100:'rgba(244,63,94,0.09)', 200:'rgba(244,63,94,0.14)', 300:'rgba(244,63,94,0.22)', 400:'#fb7185', 500:'#f43f5e', 600:'#e11d48', 700:'#be123c' },
        emerald: { 50:'rgba(16,185,129,0.05)', 100:'rgba(16,185,129,0.09)', 200:'rgba(16,185,129,0.14)', 300:'rgba(16,185,129,0.22)', 400:'#34d399', 500:'#10b981', 600:'#059669' },
      },
      animation: {
        'mesh-drift': 'mesh-drift 45s ease-in-out infinite alternate',
        'live-pulse': 'live-pulse 2s ease-in-out infinite',
        'fade-up':    'fade-up 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'shimmer':    'shimmer 1.8s ease-in-out infinite',
        'float':      'float 4s ease-in-out infinite',
        'spin-smooth':'spin-smooth 1.2s linear infinite',
        // legacy names kept
        'warm-aurora':'mesh-drift 45s ease-in-out infinite alternate',
        'soft-pulse': 'live-pulse 2.5s ease-in-out infinite',
        'spin-warm':  'spin-smooth 1.5s linear infinite',
      },
      backdropBlur: {
        xs:   '2px',
        '2xl':'40px',
        '3xl':'64px',
      },
      boxShadow: {
        'glass-sm': 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.30)',
        'glass':    'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.40)',
        'glass-lg': 'inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 40px rgba(0,0,0,0.50)',
        'glass-xl': 'inset 0 1px 0 rgba(255,255,255,0.07), 0 20px 60px rgba(0,0,0,0.60)',
        // legacy
        'warm':     'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.35)',
        'warm-lg':  'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.45)',
        'inner-twilight': 'inset 0 1px 0 rgba(255,255,255,0.05)',
        'glow-sunset': '0 0 20px rgba(59,130,246,0.15)',
        'glow-twilight':'0 0 20px rgba(139,92,246,0.15)',
      },
      backgroundImage: {
        'gradient-blue':   'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #2563eb 100%)',
        'gradient-purple': 'linear-gradient(135deg, #3b1f7a 0%, #6d28d9 100%)',
        'gradient-mesh':   'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(37,99,235,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(109,40,217,0.06) 0%, transparent 60%)',
        // legacy
        'gradient-sunset': 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)',
        'gradient-twilight':'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'gradient-lavender':'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(109,40,217,0.06) 100%)',
        'gradient-sand':   'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128':'32rem',
      },
      transitionTimingFunction: {
        'out-expo':   'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring':     'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'warm':       'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
