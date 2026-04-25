'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('Trading Rocket Error:', error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cream-50 via-warm-50 to-cream-100">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl"
          >
            <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-warm-200/50 shadow-warm-xl">
              {/* Animated background grid */}
              <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(rgba(139, 90, 43, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(139, 90, 43, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }} />
              </div>

              {/* Warm glow effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-b from-amber-200/20 to-transparent blur-3xl" />

              <div className="relative p-8">
                {/* Terminal Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-rose-400 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-sm font-mono text-warm-400/70">Terminal Failure</span>
                </div>

                {/* Warning Icon */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-amber-200/30 blur-xl rounded-full" />
                    <svg
                      className="w-20 h-20 text-amber-500 relative"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </motion.div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-montserrat font-bold text-center text-warm-800 mb-2">
                  Terminal Failure
                </h1>
                <p className="text-center text-warm-500/70 font-inter mb-6">
                  An unexpected error has occurred in the Trading Rocket system
                </p>

                {/* Error Details */}
                <AnimatePresence mode="wait">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-warm-50/50 rounded-2xl p-5 mb-6 border border-warm-200/30"
                  >
                    <p className="text-amber-700 font-mono text-sm break-all">
                      {this.state.error?.message || 'Unknown error occurred'}
                    </p>
                    {this.state.errorInfo?.componentStack && (
                      <details className="mt-4">
                        <summary className="text-warm-400/60 text-xs cursor-pointer hover:text-warm-500 transition-colors">
                          Stack Trace
                        </summary>
                        <pre className="mt-2 text-xs text-warm-400/50 overflow-auto max-h-32 font-mono">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Recovery Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={this.resetError}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-amber-100 to-gold-100 text-warm-800 font-inter font-semibold rounded-2xl hover:from-amber-200 hover:to-gold-200 transition-all duration-300 shadow-warm hover:shadow-warm-lg border border-amber-200/50"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Restart Terminal
                    </span>
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex-1 px-6 py-3.5 bg-white/60 backdrop-blur-sm text-warm-700 font-inter font-semibold rounded-2xl border border-warm-200/50 hover:bg-white/80 transition-all duration-300"
                  >
                    Return to Dashboard
                  </button>
                </div>

                {/* System Status */}
                <div className="mt-6 pt-6 border-t border-warm-200/30">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-warm-400/60">System Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                      <span className="text-rose-600 font-mono font-semibold">ERROR</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-warm-400/60">Timestamp</span>
                    <span className="text-warm-500 font-mono">
                      {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;

// Functional wrapper for components
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <GlobalErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </GlobalErrorBoundary>
    );
  };
}
