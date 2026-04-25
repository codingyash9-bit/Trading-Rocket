'use client';

import { create } from 'zustand';
import { XAIData } from '../types';

interface XAIStore {
  xaiData: XAIData | null;
  isLoading: boolean;
  
  setXAIData: (data: XAIData | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useXAIStore = create<XAIStore>((set) => ({
  xaiData: null,
  isLoading: false,
  
  setXAIData: (data) => set({ xaiData: data }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
