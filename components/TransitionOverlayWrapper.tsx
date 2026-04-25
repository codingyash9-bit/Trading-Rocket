'use client';

import { useTransition } from './TransitionContext';
import TransitionOverlay from './TransitionOverlay';

export default function TransitionOverlayWrapper() {
  const { isTransitioning, transitionMessage, endTransition } = useTransition();
  return <TransitionOverlay isVisible={isTransitioning} message={transitionMessage} onComplete={endTransition} />;
}