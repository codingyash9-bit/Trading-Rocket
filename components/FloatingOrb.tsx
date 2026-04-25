'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from './TransitionContext';

const navItems = [
  { id: 'market-analysis', label: 'Market Analysis', icon: '📊', path: '/analytics' },
  { id: 'portfolio',        label: 'Portfolio',        icon: '💼', path: '/portfolio' },
  { id: 'signals',          label: 'Signals',          icon: '⚡', path: '/signals'   },
  { id: 'rocket-ai',        label: 'Rocket AI',        icon: '🚀', path: '/ai'        },
  { id: 'wargame',          label: 'Wargame',          icon: '🛡️', path: '/wargame'   },
  { id: 'graveyard',        label: 'Graveyard',        icon: '🪦', path: '/graveyard' },
  { id: 'settings',         label: 'Settings',         icon: '⚙️', path: '/settings'  },
  { id: 'autopsy',          label: 'Autopsy',          icon: '🕵️', path: '/autopsy'   },
];

const SHOW_ON_PATHS = new Set(['/analytics', '/markets', '/signals', '/portfolio', '/ai', '/alerts', '/settings', '/chart-analysis', '/autopsy', '/wargame', '/graveyard']);

const GalaxyParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isActiveRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 120;
    canvas.height = 120;
    
    isActiveRef.current = true;
    
    const particles = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.6 + 0.3,
      hue: Math.random() * 50 + 190,
    }));
    
    let animationId: number;
    const animate = () => {
      if (!isActiveRef.current) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `hsla(${p.hue}, 85%, 65%, ${p.alpha})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 85%, 65%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      isActiveRef.current = false;
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 rounded-full pointer-events-none opacity-80"
    />
  );
};

const FloatingOrb: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router   = useRouter();
  const pathname = usePathname();
  const { startTransition, endTransition } = useTransition();

  const isVisible = useMemo(() => SHOW_ON_PATHS.has(pathname), [pathname]);

  if (!isVisible) return null;

  const handleNavigate = (path: string) => {
    if (path === pathname) { 
      setIsOpen(false); 
      return; 
    }
    const label = navItems.find(i => i.path === path)?.label ?? 'Module';
    startTransition(`Loading ${label}...`);
    setIsOpen(false);
    setTimeout(() => {
      router.push(path);
      endTransition();
    }, 300);
  };

  return (
    <div className="fixed z-[9999]" style={{ bottom: 24, right: 24 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="orb-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="nav-items"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute right-full top-0 z-50 flex items-center gap-2 mr-4"
            style={{ transform: 'translateY(-12px)' }}
          >
            {[...navItems].reverse().map((item, index) => {
              const isActive = pathname === item.path;

              return (
                <motion.button
                key={item.id}
                onClick={() => handleNavigate(item.path)}
                initial={{ opacity: 0, scale: 0.5, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5, x: -20 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: index * 0.05,
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                aria-label={item.label}
                >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200"
                  style={{
                    background: isActive
                      ? 'rgba(6, 182, 212, 0.3)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: isActive
                      ? '2px solid rgba(6, 182, 212, 0.8)'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: isActive
                      ? '0 0 25px rgba(6,182,212,0.4)'
                      : '0 4px 15px rgba(0,0,0,0.3)',
                  }}
                >
                  <span className="text-xl">{item.icon}</span>
                </div>
                </motion.button>              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <GalaxyParticleCanvas />
        
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full flex items-center justify-center relative z-50 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            boxShadow: isOpen
              ? '0 0 40px rgba(6,182,212,0.9), 0 0 80px rgba(139,92,246,0.6)'
              : '0 0 25px rgba(6,182,212,0.4), 0 0 50px rgba(139,92,246,0.2)',
          }}
          animate={{ 
            scale: isOpen ? 1 : [1, 1.03, 1],
            y: isOpen ? 0 : [0, -4, 0],
          }}
          transition={{
            scale: isOpen ? { duration: 0.2 } : { duration: 5, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
          }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Navigation menu"
          aria-expanded={isOpen}
        >
          <div 
            className="absolute inset-[2px] rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)',
            }}
          />
          
          <motion.span
            className="text-2xl text-white relative z-20 select-none font-bold"
            animate={{ rotate: isOpen ? 135 : 0, scale: isOpen ? 0.85 : 1 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {isOpen ? '✕' : '☰'}
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
};

export default FloatingOrb;