import { RiskTolerance, TimeHorizon } from './common';

export interface UserPreferences {
  investmentBudget: number; // Strictly positive number in INR
  riskTolerance: RiskTolerance;
  timeHorizon: TimeHorizon;
  watchlist: string[];
  theme: 'dark' | 'light';
  notifications: {
    priceAlerts: boolean;
    sentimentChanges: boolean;
    portfolioUpdates: boolean;
  };
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  preferences: UserPreferences;
  createdAt: string;
  lastLogin: string;
}
