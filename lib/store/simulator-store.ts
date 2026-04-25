'use client';

import { create } from 'zustand';
import { AlphaGaugeData, ProcessingLog } from '../types';

interface AlphaSimulatorStore {
  isRunning: boolean;
  logs: ProcessingLog[];
  progress: number;
  alphaGauge: AlphaGaugeData | null;
  
  startSimulation: () => void;
  addLog: (log: Omit<ProcessingLog, 'timestamp'>) => void;
  setProgress: (progress: number) => void;
  setAlphaGauge: (data: AlphaGaugeData | null) => void;
  resetSimulation: () => void;
}

export const useAlphaSimulatorStore = create<AlphaSimulatorStore>((set) => ({
  isRunning: false,
  logs: [],
  progress: 0,
  alphaGauge: null,
  
  startSimulation: () => set({
    isRunning: true,
    logs: [],
    progress: 0,
  }),
  
  addLog: (log) => set((state) => ({
    logs: [
      ...state.logs,
      {
        ...log,
        timestamp: new Date().toISOString(),
      },
    ],
  })),
  
  setProgress: (progress) => set({ progress }),
  
  setAlphaGauge: (data) => set({ alphaGauge: data }),
  
  resetSimulation: () => set({
    isRunning: false,
    logs: [],
    progress: 0,
    alphaGauge: null,
  }),
}));
