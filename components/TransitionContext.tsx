'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface TransitionContextType {
  isTransitioning: boolean;
  transitionMessage: string;
  startTransition: (message?: string) => void;
  endTransition: () => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

const messages = [
  'Initializing Intelligence...',
  'Analyzing Market Signals...',
  'Activating Module...',
  'Loading Neural Network...',
  'Preparing Analytics...',
  'Establishing Connection...',
];

export const TransitionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');

  const startTransition = useCallback((message?: string) => {
    const msg = message || messages[Math.floor(Math.random() * messages.length)];
    setTransitionMessage(msg);
    setIsTransitioning(true);
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
    setTransitionMessage('');
  }, []);

  return (
    <TransitionContext.Provider value={{ isTransitioning, transitionMessage, startTransition, endTransition }}>
      {children}
    </TransitionContext.Provider>
  );
};

export const useTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within TransitionProvider');
  }
  return context;
};