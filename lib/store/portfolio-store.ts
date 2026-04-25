'use client';

import { create } from 'zustand';
import { PortfolioReport } from '../types';

interface PaperPortfolioStore {
  reports: PortfolioReport[];
  isLoading: boolean;
  
  addReport: (report: PortfolioReport) => void;
  removeReport: (id: string) => void;
  setReports: (reports: PortfolioReport[]) => void;
  setLoading: (loading: boolean) => void;
}

export const usePaperPortfolioStore = create<PaperPortfolioStore>((set) => ({
  reports: [],
  isLoading: false,
  
  addReport: (report) => set((state) => ({
    reports: state.reports.some((r) => r.id === report.id)
      ? state.reports
      : [...state.reports, report],
  })),
  
  removeReport: (id) => set((state) => ({
    reports: state.reports.filter((r) => r.id !== id),
  })),
  
  setReports: (reports) => set({ reports }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
