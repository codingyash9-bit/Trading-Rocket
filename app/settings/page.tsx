'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store';
import { auth, db, isMockMode } from '@/lib/firebase';
import { updateEmail, updatePassword, updateProfile, signOut } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import type { RiskTolerance, TimeHorizon } from '@/types';

interface DisplaySettings {
  displayCurrency: string;
  chartStyle: string;
  defaultView: string;
  enableAnimations: boolean;
  compactMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  showVolume: boolean;
  showNews: boolean;
}

const defaultDisplaySettings: DisplaySettings = {
  displayCurrency: 'INR',
  chartStyle: 'candlestick',
  defaultView: 'home',
  enableAnimations: true,
  compactMode: false,
  autoRefresh: true,
  refreshInterval: 30,
  showVolume: true,
  showNews: true,
};

async function saveToFirestore(uid: string, data: any, isMock: boolean) {
  if (isMock) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`user_prefs_${uid}`, JSON.stringify(data));
    }
    return;
  }
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
}

async function loadFromFirestore(uid: string, isMock: boolean): Promise<any> {
  if (isMock) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`user_prefs_${uid}`);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? docSnap.data() : null;
}

async function loadDisplaySettings(uid: string, isMock: boolean): Promise<DisplaySettings> {
  const prefs = await loadFromFirestore(uid, isMock);
  if (prefs?.displaySettings) {
    return { ...defaultDisplaySettings, ...prefs.displaySettings } as DisplaySettings;
  }
  return defaultDisplaySettings;
}

async function saveDisplaySettings(uid: string, settings: DisplaySettings, isMock: boolean) {
  await saveToFirestore(uid, { displaySettings: settings }, isMock);
}

const BackButton: React.FC = () => {
  const router = useRouter();
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push('/features')}
      className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back
    </motion.button>
  );
};

export default function SettingsPage() {
  const { user, updatePreferences, setUser } = useUserStore();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  
  const [budget, setBudget] = useState(user?.preferences?.investmentBudget || 1000000);
  const [risk, setRisk] = useState<RiskTolerance>(user?.preferences?.riskTolerance || 'Moderate');
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>(user?.preferences?.timeHorizon || 'Medium-term');
  const [theme, setTheme] = useState<'dark' | 'light'>(user?.preferences?.theme || 'dark');
  
  const [notifications, setNotifications] = useState({
    priceAlerts: user?.preferences?.notifications?.priceAlerts ?? true,
    sentimentChanges: user?.preferences?.notifications?.sentimentChanges ?? true,
    portfolioUpdates: user?.preferences?.notifications?.portfolioUpdates ?? true,
  });
  
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(defaultDisplaySettings);

  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    loadDisplaySettings(user?.uid || '', isMockMode).then(setDisplaySettings).catch(() => {});
  }, [user?.uid]);

  const handleShowMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    setSavingKey('profile');
    setMessage({ text: '', type: '' });
    
    try {
      if (isMockMode) {
        const updatedUser = { ...user, displayName, email } as any;
        setUser(updatedUser);
        await saveToFirestore(user?.uid || '', { displayName, email }, true);
        handleShowMessage('Profile updated successfully!', 'success');
        setNewPassword('');
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');

      const updates: any = {};
      const fbUpdates: any = {};

      if (displayName !== user?.displayName) {
        await updateProfile(currentUser, { displayName });
        updates.displayName = displayName;
        fbUpdates.displayName = displayName;
      }

      if (email !== user?.email) {
        await updateEmail(currentUser, email);
        updates.email = email;
        fbUpdates.email = email;
      }

      if (newPassword) {
        await updatePassword(currentUser, newPassword);
      }

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, fbUpdates);

      if (Object.keys(updates).length > 0) {
        setUser({ ...user, ...updates } as any);
      }

      handleShowMessage('Profile updated successfully!', 'success');
      setNewPassword('');
    } catch (err: any) {
      handleShowMessage(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
      setSavingKey(null);
    }
  };

  const handleUpdateTradingPrefs = async () => {
    setIsLoading(true);
    setSavingKey('trading');
    setMessage({ text: '', type: '' });
    
    try {
      const dbPrefs = { investmentBudget: budget, riskTolerance: risk, timeHorizon };
      
      if (isMockMode) {
        const updatedUser = { 
          ...user, 
          preferences: { 
            ...user?.preferences,
            investmentBudget: budget,
            riskTolerance: risk,
            timeHorizon,
          } 
        } as any;
        setUser(updatedUser);
        updatePreferences(dbPrefs as any);
        await saveToFirestore(user?.uid || '', { preferences: dbPrefs }, true);
        handleShowMessage('Trading preferences saved!', 'success');
        setIsLoading(false);
        setSavingKey(null);
        return;
      }
      
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          'preferences.investmentBudget': budget,
          'preferences.riskTolerance': risk,
          'preferences.timeHorizon': timeHorizon,
        });
      }

      updatePreferences(dbPrefs as any);
      handleShowMessage('Trading preferences saved!', 'success');
    } catch (err: any) {
      handleShowMessage(err.message || 'Failed to save preferences', 'error');
    } finally {
      setIsLoading(false);
      setSavingKey(null);
    }
  };

  const handleUpdateAppearance = async () => {
    setIsLoading(true);
    setSavingKey('appearance');
    setMessage({ text: '', type: '' });
    
    try {
      const appearanceData = { theme, preferences: { theme, notifications } };
      
      if (isMockMode) {
        const updatedUser = { 
          ...user, 
          preferences: { 
            ...user?.preferences,
            theme,
            notifications
          } 
        } as any;
        setUser(updatedUser);
        updatePreferences({ theme } as any);
        await saveToFirestore(user?.uid || '', appearanceData, true);
        handleShowMessage('Appearance saved!', 'success');
        setIsLoading(false);
        setSavingKey(null);
        return;
      }
      
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          'preferences.theme': theme,
          'preferences.notifications': notifications,
        });
      }

      updatePreferences({ theme } as any);
      handleShowMessage('Appearance saved!', 'success');
    } catch (err: any) {
      handleShowMessage(err.message || 'Failed to save appearance', 'error');
    } finally {
      setIsLoading(false);
      setSavingKey(null);
    }
  };

  const handleUpdateNotifications = async () => {
    setIsLoading(true);
    setSavingKey('notifications');
    setMessage({ text: '', type: '' });
    
    try {
      if (isMockMode) {
        const updatedUser = { 
          ...user, 
          preferences: { 
            ...user?.preferences,
            notifications
          } 
        } as any;
        setUser(updatedUser);
        await saveToFirestore(user?.uid || '', { preferences: { notifications } }, true);
        handleShowMessage('Notification settings saved!', 'success');
        setIsLoading(false);
        setSavingKey(null);
        return;
      }
      
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { 'preferences.notifications': notifications });
      }
      
      handleShowMessage('Notification settings saved!', 'success');
    } catch (err: any) {
      handleShowMessage(err.message || 'Failed to save notifications', 'error');
    } finally {
      setIsLoading(false);
      setSavingKey(null);
    }
  };

  const handleUpdateDisplay = async () => {
    setIsLoading(true);
    setSavingKey('display');
    setMessage({ text: '', type: '' });
    
    try {
      await saveDisplaySettings(user?.uid || '', displaySettings, isMockMode);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('displaySettings', JSON.stringify(displaySettings));
      }
      
      handleShowMessage('Display settings saved!', 'success');
    } catch (err: any) {
      handleShowMessage(err.message || 'Failed to save display settings', 'error');
    } finally {
      setIsLoading(false);
      setSavingKey(null);
    }
  };

  const handleLogout = async () => {
    if (isMockMode) {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock_user');
      }
      router.replace('/');
      return;
    }
    await signOut(auth);
    setUser(null);
    router.replace('/');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/50 animate-pulse font-inter">Please login to access settings...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'trading', label: 'Trading', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'appearance', label: 'Appearance', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { id: 'display', label: 'Display', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  ];

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full p-1 transition-all ${checked ? 'bg-cyan-500' : 'bg-slate-600'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 overflow-y-auto">
      <BackButton />
      <div className="max-w-6xl w-full pt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-montserrat text-white">Settings</h1>
          <p className="text-slate-400 mt-1 font-inter">Customize your platform experience</p>
        </div>
      </div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center gap-3 ${
            message.type === 'error' 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
          
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 px-4 py-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)' }}
              >
                {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.displayName}</p>
                <p className="text-slate-500 text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 text-sm font-medium hover:bg-rose-500/10 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-panel p-6 rounded-3xl border border-white/5"
              >
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile & Security
                </h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500/50 focus:bg-white-[0.03] transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500/50 focus:bg-white-[0.03] transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password (leave blank to keep)</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500/50 focus:bg-white-[0.03] transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="mt-4 px-6 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingKey === 'profile' && isLoading && (
                      <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                    )}
                    Save Profile
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'trading' && (
              <motion.div
                key="trading"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-panel p-6 rounded-3xl border border-white/5"
              >
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Trading Preferences
                </h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Investment Budget (INR)</label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500/50 focus:bg-white-[0.03] transition-all"
                      min="0"
                    />
                    <p className="text-slate-500 text-xs mt-1">Your available capital for paper trading</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Risk Tolerance</label>
                    <select
                      value={risk}
                      onChange={(e) => setRisk(e.target.value as RiskTolerance)}
                      className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500/50"
                    >
                      <option value="Conservative">Conservative - Low risk, stable returns</option>
                      <option value="Moderate">Moderate - Balanced risk and reward</option>
                      <option value="Aggressive">Aggressive - High risk, high potential</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Time Horizon</label>
                    <select
                      value={timeHorizon}
                      onChange={(e) => setTimeHorizon(e.target.value as TimeHorizon)}
                      className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500/50"
                    >
                      <option value="Short-term">Short-term (Days to Weeks)</option>
                      <option value="Medium-term">Medium-term (Weeks to Months)</option>
                      <option value="Long-term">Long-term (Months to Years)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleUpdateTradingPrefs}
                    disabled={isLoading}
                    className="mt-4 px-6 py-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-semibold hover:bg-purple-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingKey === 'trading' && isLoading && (
                      <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                    )}
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-panel p-6 rounded-3xl border border-white/5"
              >
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Appearance
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Theme</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                          theme === 'dark'
                            ? 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                            : 'bg-[#131b2e] border-white/5 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <svg className="w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        Dark
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                          theme === 'light'
                            ? 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                            : 'bg-[#131b2e] border-white/5 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <svg className="w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Light
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#131b2e] border border-white/5">
                    <div>
                      <p className="text-white text-sm font-medium">Enable UI Animations</p>
                      <p className="text-slate-500 text-xs">Smooth transitions and effects</p>
                    </div>
                    <Toggle checked={displaySettings.enableAnimations} onChange={() => setDisplaySettings(s => ({ ...s, enableAnimations: !s.enableAnimations }))} />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#131b2e] border border-white/5">
                    <div>
                      <p className="text-white text-sm font-medium">Compact Mode</p>
                      <p className="text-slate-500 text-xs">Smaller data display</p>
                    </div>
                    <Toggle checked={displaySettings.compactMode} onChange={() => setDisplaySettings(s => ({ ...s, compactMode: !s.compactMode }))} />
                  </div>

                  <button
                    onClick={handleUpdateAppearance}
                    disabled={isLoading}
                    className="mt-2 px-6 py-2.5 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-400 text-sm font-semibold hover:bg-pink-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingKey === 'appearance' && isLoading && (
                      <div className="w-4 h-4 border-2 border-pink-400/30 border-t-pink-400 rounded-full animate-spin" />
                    )}
                    Save Appearance
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-panel p-6 rounded-3xl border border-white/5"
              >
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notification Preferences
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#131b2e] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white">Price Alerts</p>
                        <p className="text-slate-500 text-xs">Get notified of significant price changes</p>
                      </div>
                    </div>
                    <Toggle checked={notifications.priceAlerts} onChange={() => setNotifications(n => ({ ...n, priceAlerts: !n.priceAlerts }))} />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#131b2e] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 10.656l-.707.707" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white">Sentiment Changes</p>
                        <p className="text-slate-500 text-xs">Track market sentiment shifts</p>
                      </div>
                    </div>
                    <Toggle checked={notifications.sentimentChanges} onChange={() => setNotifications(n => ({ ...n, sentimentChanges: !n.sentimentChanges }))} />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#131b2e] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white">Portfolio Updates</p>
                        <p className="text-slate-500 text-xs">Daily portfolio performance summaries</p>
                      </div>
                    </div>
                    <Toggle checked={notifications.portfolioUpdates} onChange={() => setNotifications(n => ({ ...n, portfolioUpdates: !n.portfolioUpdates }))} />
                  </div>

                  <button
                    onClick={handleUpdateNotifications}
                    disabled={isLoading}
                    className="mt-4 px-6 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold hover:bg-amber-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingKey === 'notifications' && isLoading && (
                      <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                    )}
                    Save Notifications
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'display' && (
              <motion.div
                key="display"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-panel p-6 rounded-3xl border border-white/5"
              >
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Display Settings
                </h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Currency</label>
                    <select
                      value={displaySettings.displayCurrency}
                      onChange={(e) => setDisplaySettings(s => ({ ...s, displayCurrency: e.target.value }))}
                      className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50"
                    >
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Chart Style</label>
                    <select
                      value={displaySettings.chartStyle}
                      onChange={(e) => setDisplaySettings(s => ({ ...s, chartStyle: e.target.value }))}
                      className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50"
                    >
                      <option value="candlestick">Candlestick</option>
                      <option value="line">Line</option>
                      <option value="area">Area</option>
                      <option value="bar">Bar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Default Dashboard View</label>
                    <select
                      value={displaySettings.defaultView}
                      onChange={(e) => setDisplaySettings(s => ({ ...s, defaultView: e.target.value }))}
                      className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50"
                    >
                      <option value="home">Home</option>
                      <option value="markets">Markets</option>
                      <option value="portfolio">Portfolio</option>
                      <option value="signals">Signals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Auto Refresh Interval</label>
                    <select
                      value={displaySettings.refreshInterval}
                      onChange={(e) => setDisplaySettings(s => ({ ...s, refreshInterval: Number(e.target.value) }))}
                      className="w-full bg-[#131b2e] border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50"
                    >
                      <option value="15">Every 15 seconds</option>
                      <option value="30">Every 30 seconds</option>
                      <option value="60">Every minute</option>
                      <option value="300">Every 5 minutes</option>
                      <option value="0">Manual only</option>
                    </select>
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#131b2e] border border-white/5">
                      <span className="text-white">Auto Refresh Data</span>
                      <Toggle checked={displaySettings.autoRefresh} onChange={() => setDisplaySettings(s => ({ ...s, autoRefresh: !s.autoRefresh }))} />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#131b2e] border border-white/5">
                      <span className="text-white">Show Volume on Charts</span>
                      <Toggle checked={displaySettings.showVolume} onChange={() => setDisplaySettings(s => ({ ...s, showVolume: !s.showVolume }))} />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#131b2e] border border-white/5">
                      <span className="text-white">Show News Feed</span>
                      <Toggle checked={displaySettings.showNews} onChange={() => setDisplaySettings(s => ({ ...s, showNews: !s.showNews }))} />
                    </div>
                  </div>

                  <button
                    onClick={handleUpdateDisplay}
                    disabled={isLoading}
                    className="mt-4 px-6 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingKey === 'display' && isLoading && (
                      <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                    )}
                    Save Display Settings
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}