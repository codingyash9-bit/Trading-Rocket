'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { auth, googleProvider, db, isMockMode } from '@/lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useUserStore } from '@/store';
import NeuralBackground from '@/components/NeuralBackground';
import PageTransition from '@/components/PageTransition';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync with Firestore
  const syncUserToStore = async (firebaseUser: any) => {
    if (isMockMode) {
      const mockProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || email || 'demo@tradingrocket.app',
        displayName: firebaseUser.displayName || email.split('@')[0] || 'Demo User',
        photoURL: firebaseUser.photoURL || null,
        preferences: {
          investmentBudget: 1000000,
          riskTolerance: 'Moderate',
          timeHorizon: 'Medium-term',
          watchlist: [],
          theme: 'dark',
          notifications: {
            priceAlerts: true,
            sentimentChanges: true,
            portfolioUpdates: true,
          },
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      } as any;
      setUser(mockProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_user', JSON.stringify(mockProfile));
      }
      return;
    }
    
    const userRef = doc(db, 'users', firebaseUser.uid);
    let userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      const newUserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || email.split('@')[0],
        photoURL: firebaseUser.photoURL || null,
        preferences: {
          investmentBudget: 1000000,
          riskTolerance: 'Moderate',
          timeHorizon: 'Medium-term',
          watchlist: [],
          theme: 'dark',
          notifications: {
            priceAlerts: true,
            sentimentChanges: true,
            portfolioUpdates: true,
          },
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      } as any;
      await setDoc(userRef, newUserProfile);
      setUser(newUserProfile);
    } else {
      await setDoc(userRef, { lastLogin: new Date().toISOString() }, { merge: true });
      setUser(userDoc.data() as any);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (isMockMode) {
        const mockUser = { 
          uid: 'mock-' + Date.now(), 
          email: email,
          displayName: email.split('@')[0] || 'Demo User',
          photoURL: null 
        };
        await syncUserToStore(mockUser);
      } else {
        if (isLogin) {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          await syncUserToStore(cred.user);
        } else {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await syncUserToStore(cred.user);
        }
      }
      setTimeout(() => router.push('/features'), 500);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (isMockMode) {
        const mockUser = { 
          uid: 'mock-google-' + Date.now(), 
          email: 'demo@tradingrocket.app',
          displayName: 'Demo User',
          photoURL: null 
        };
        await syncUserToStore(mockUser);
      } else {
        const cred = await signInWithPopup(auth, googleProvider);
        await syncUserToStore(cred.user);
      }
      setTimeout(() => router.push('/features'), 500);
    } catch (err: any) {
      setError(err.message || 'Google Auth failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <NeuralBackground subtle />
      
      <main className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {/* Overlay block for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/90 via-[#080c14]/70 to-[#080c14]/90 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md"
        >
          {/* Form Card */}
          <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-2xl bg-[#0b101d]/80 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600" />
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold font-montserrat text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-400 text-sm font-inter">
                {isLogin ? 'Sign in to access your intelligence dashboard' : 'Join Trading Rocket today'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-cyan-500/50 focus:bg-white-[0.03] transition-all"
                  placeholder="name@domain.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-cyan-500/50 focus:bg-white-[0.03] transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 mt-4 rounded-xl font-bold font-inter text-sm text-white relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </button>
            </form>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Or</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full mt-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-3 disabled:opacity-70"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors"
                disabled={isLoading}
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </PageTransition>
  );
}
