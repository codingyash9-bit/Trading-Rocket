'use client';

import { useEffect, useRef } from 'react';
import { auth, db, isMockMode } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useUserStore } from '@/store';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, user } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    if (isMockMode) {
      if (initialized.current) return;
      initialized.current = true;
      
      if (user) {
        return;
      }
      
      const mockUserStr = typeof window !== 'undefined' ? localStorage.getItem('mock_user') : null;
      if (mockUserStr) {
        try {
          setUser(JSON.parse(mockUserStr));
        } catch {}
      }
      return;
    }
    
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            setUser(docSnap.data() as any);
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Trader',
              photoURL: firebaseUser.photoURL || null,
              preferences: {
                investmentBudget: 1000000,
                riskTolerance: 'Moderate',
                timeHorizon: 'Medium-term',
                watchlist: [],
                theme: 'dark',
                notifications: { priceAlerts: true, sentimentChanges: true, portfolioUpdates: true },
              },
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            } as any);
          }
        } catch (err) {
          console.error("Error fetching user data", err);
        }
      } else {
        setUser(null);
        const protectedRoutes = ['/analytics', '/portfolio', '/signals', '/ai', '/alerts', '/settings', '/features'];
        if (protectedRoutes.some(p => pathname.startsWith(p))) {
          router.push('/login');
        }
      }
    });

    return () => unsub();
  }, [setUser, pathname, router, user]);

  return <>{children}</>;
}
