'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

interface TransitionOverlayProps {
  isVisible: boolean;
  message?: string;
  onComplete?: () => void;
}

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { y: '-100%', transition: { duration: 0.32, ease: [0.76, 0, 0.24, 1] } }
};

const TransitionOverlay: React.FC<TransitionOverlayProps> = ({ isVisible, message, onComplete }) => {
  const [typedText, setTypedText] = useState('');
  const targetText = message || 'Initializing neural analysis...';

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isVisible) {
      setTypedText('');
      
      let i = 0;
      const typeWriter = setInterval(() => {
        setTypedText(targetText.slice(0, i + 1));
        i++;
        if (i >= targetText.length) clearInterval(typeWriter);
      }, 40);

      // min 600ms, max 3000ms. Defaulting here to close via timeout if an external source didn't close it,
      // but realistically `isVisible` tracks the loading state. We use a 800ms minimum artificial delay in the context below if needed.
      timeout = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => {
        clearInterval(typeWriter);
        clearTimeout(timeout);
      };
    }
  }, [isVisible, targetText, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="transition-root"
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none"
          style={{
            background: 'rgba(5, 7, 15, 0.92)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Logo Mark */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mb-8"
          >
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="logoGlow" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <path
                d="M16 3L6 9v14l10 6 10-6V9L16 3Z"
                stroke="url(#logoGlow)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M16 8L11 11v10l5 3 5-3V11L16 8Z"
                fill="url(#logoGlow)"
                opacity="0.8"
              />
            </svg>
          </motion.div>

          {/* Typewriter Text */}
          <div className="h-6 mb-6">
            <p className="text-sm font-mono text-cyan-400 tracking-wide">
              {typedText}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-2 bg-cyan-400 ml-1 h-3"
              />
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-48 h-[1.5px] bg-white/10 rounded-full overflow-hidden relative">
            <motion.div
              className="absolute top-0 bottom-0 left-0 w-1/3 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)',
              }}
              animate={{
                x: ['-100%', '300%'],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Global state hook for managing transition
const useTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string>();

  const startTransition = useCallback((message?: string) => {
    setTransitionMessage(message);
    setIsTransitioning(true);
  }, []);

  const endTransition = useCallback(() => {
    // Artificial min delay
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionMessage(undefined);
    }, 600);
  }, []);

  return { isTransitioning, transitionMessage, startTransition, endTransition };
};

export default TransitionOverlay;
export { useTransition };