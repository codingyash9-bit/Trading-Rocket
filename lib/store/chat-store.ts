'use client';

import { create } from 'zustand';
import { ChatMessage } from '../types';

interface ChatStore {
  messages: ChatMessage[];
  isProcessing: boolean;
  predefinedPrompts: string[];
  
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, content: string) => void;
  clearMessages: () => void;
  setProcessing: (processing: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [
    {
      id: 'system-welcome',
      role: 'system',
      content: `🚀 **Welcome to Rocket AI!**

Your intelligent companion for **Indian Markets Analysis**. I specialize in:

• **Equity Analysis** - NSE/BSE stocks, fundamentals, technicals
• **Market Sentiment** - FII/DII flows, sector rotation
• **Policy Insights** - RBI monetary policy, SEBI regulations
• **F&O Intelligence** - Open interest, PCR ratios
• ** Earnings Whisper** - Quarterly results, guidance

Ask me anything about Indian markets!`,
      timestamp: new Date().toISOString(),
    },
  ],
  isProcessing: false,
  predefinedPrompts: [
    'Summarize latest RBI policy',
    'Compare HDFC vs ICICI Bank',
    'NIFTY Bank outlook',
    'FII/DII flow analysis',
    'Top gainers & losers',
    'Earnings this week',
  ],
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  
  updateMessage: (id, content) => set((state) => ({
    messages: state.messages.map((m) =>
      m.id === id ? { ...m, content } : m
    ),
  })),
  
  clearMessages: () => set((state) => ({
    messages: [state.messages[0]],
  })),
  
  setProcessing: (processing) => set({ isProcessing: processing }),
}));
