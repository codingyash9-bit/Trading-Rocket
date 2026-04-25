'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, UserPreferences } from '../types';

interface UserStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  logout: () => void;
}

const defaultUserPreferences: UserPreferences = {
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
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      updatePreferences: (preferences) => set((state) => ({
        user: state.user 
          ? { 
              ...state.user, 
              preferences: { ...state.user.preferences, ...preferences } 
            }
          : null,
      })),
      
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'trading-rocket-user',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export const useDefaultPreferences = () => defaultUserPreferences;
