'use client';

import { create } from 'zustand';
import { 
  SidebarState, 
  GlobalSearchState, 
  NotificationState, 
  NavigationSection,
  AnalysisTab
} from '../types';

interface UIStore {
  sidebar: SidebarState;
  search: GlobalSearchState;
  notifications: NotificationState[];
  activeModal: string | null;
  xaiDrawerOpen: boolean;
  selectedTickerForXAI: string | null;
  selectedAnalysisTypeForXAI: AnalysisTab | null;
  showNotifs: boolean;
  
  // Sidebar Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveSection: (section: NavigationSection) => void;
  
  // Search Actions
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  setSearchResults: (results: GlobalSearchState['results']) => void;
  setSearchLoading: (loading: boolean) => void;
  clearSearch: () => void;
  
  // Notification Actions
  addNotification: (notification: Omit<NotificationState, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  toggleShowNotifs: () => void;
  
  // Modal Actions
  setActiveModal: (modal: string | null) => void;
  
  // XAI Drawer Actions
  openXAIDrawer: (ticker: string, analysisType: AnalysisTab) => void;
  closeXAIDrawer: () => void;
}

const defaultSidebarState: SidebarState = {
  isCollapsed: false,
  activeSection: 'stock-intelligence',
};

const defaultSearchState: GlobalSearchState = {
  query: '',
  isOpen: false,
  results: [],
  isLoading: false,
};

export const useUIStore = create<UIStore>((set) => ({
  sidebar: defaultSidebarState,
  search: defaultSearchState,
  notifications: [],
  activeModal: null,
  xaiDrawerOpen: false,
  selectedTickerForXAI: null,
  selectedAnalysisTypeForXAI: null,
  showNotifs: false,
  
  // Sidebar Actions
  toggleSidebar: () => set((state) => ({
    sidebar: { ...state.sidebar, isCollapsed: !state.sidebar.isCollapsed },
  })),
  
  setSidebarCollapsed: (collapsed) => set((state) => ({
    sidebar: { ...state.sidebar, isCollapsed: collapsed },
  })),
  
  setActiveSection: (section) => set((state) => ({
    sidebar: { ...state.sidebar, activeSection: section },
  })),
  
  // Search Actions
  setSearchQuery: (query) => set((state) => ({
    search: { ...state.search, query },
  })),
  
  setSearchOpen: (open) => set((state) => ({
    search: { ...state.search, isOpen: open },
  })),
  
  setSearchResults: (results) => set((state) => ({
    search: { ...state.search, results },
  })),
  
  setSearchLoading: (loading) => set((state) => ({
    search: { ...state.search, isLoading: loading },
  })),
  
  clearSearch: () => set({
    search: defaultSearchState,
  }),
  
  // Notification Actions
  addNotification: (notification) => set((state) => ({
    notifications: [
      {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        isRead: false,
      },
      ...state.notifications,
    ].slice(0, 50),
  })),
  
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    ),
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  toggleShowNotifs: () => set((state) => ({ showNotifs: !state.showNotifs })),
  
  // Modal Actions
  setActiveModal: (modal) => set({ activeModal: modal }),
  
  // XAI Drawer Actions
  openXAIDrawer: (ticker, analysisType) => set({
    xaiDrawerOpen: true,
    selectedTickerForXAI: ticker,
    selectedAnalysisTypeForXAI: analysisType,
  }),
  
  closeXAIDrawer: () => set({
    xaiDrawerOpen: false,
    selectedTickerForXAI: null,
    selectedAnalysisTypeForXAI: null,
  }),
}));

export const useDefaultSidebarState = () => defaultSidebarState;
export const useDefaultSearchState = () => defaultSearchState;
