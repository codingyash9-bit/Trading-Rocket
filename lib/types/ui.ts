import { AnalysisTab } from './common';
import { StockSearchResult } from './market';

export interface SidebarState {
  isCollapsed: boolean;
  activeSection: NavigationSection;
}

export type NavigationSection = 
  | 'stock-intelligence'
  | 'market-pulse'
  | 'company-radar'
  | 'rocket-ai'
  | 'paper-portfolio'
  | 'market-intelligence'
  | 'aether'
  | 'chart-analysis'
  | 'wargame'
  | 'graveyard';

export interface GlobalSearchState {
  query: string;
  isOpen: boolean;
  results: StockSearchResult[];
  isLoading: boolean;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface UIState {
  sidebar: SidebarState;
  search: GlobalSearchState;
  notifications: NotificationState[];
  activeModal: string | null;
  xaiDrawerOpen: boolean;
  selectedTickerForXAI: string | null;
  selectedAnalysisTypeForXAI: AnalysisTab | null;
}
