'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store';
import type { ChatMessage } from '../../types';
import { generateId } from '../../utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const PromptChip: React.FC<{
  label: string;
  onClick: () => void;
}> = ({ label, onClick }) => (
  <motion.button
    onClick={onClick}
    className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 hover:border-cyan-500/30 rounded-full text-sm text-slate-300 hover:text-white transition-all whitespace-nowrap backdrop-blur-sm"
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
  >
    {label}
  </motion.button>
);

const MessageBubble: React.FC<{
  message: ChatMessage;
  index: number;
}> = ({ message, index }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isError = message.error;

  const markdownComponents = {
    h1: ({node, ...props}: any) => <h1 className="text-xl font-bold text-white mt-4 mb-2" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-lg font-bold text-white mt-4 mb-2" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-md font-bold text-white mt-3 mb-1" {...props} />,
    h4: ({node, ...props}: any) => <h4 className="text-sm font-bold text-white mt-2 mb-1" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-3" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc pl-5 mb-3" {...props} />,
    li: ({node, ...props}: any) => <li className="mb-1" {...props} />,
    strong: ({node, ...props}: any) => <strong className="text-cyan-400 font-semibold" {...props} />,
  };

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex justify-start"
      >
        <div className="max-w-[90%] lg:max-w-[75%] p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl">
          <div className="flex items-start gap-4 mb-4 pb-4 border-b border-white/10">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-cyan-500/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
              <motion.svg
                className="w-10 h-10 text-white relative z-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.path
                  d="M12 2.5L4 12l8 1.5 8-1.5L12 2.5z"
                  fill="currentColor"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <path d="M12 2.5L4 12h6l-2 8 8-1.5h-6l8 1.5 8-8.5-8-1.5" stroke="currentColor" strokeWidth={1} />
                <circle cx="12" cy="11" r="2" fill="white" opacity={0.9} />
                <circle cx="10" cy="10" r="0.5" fill="#06b6d4" />
                <circle cx="14" cy="10" r="0.5" fill="#06b6d4" />
              </motion.svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">Rocket AI</span>
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full border border-cyan-500/30">AI</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Your Indian Markets Intelligence Partner</p>
            </div>
          </div>
          <div className="text-sm text-slate-300 font-inter leading-relaxed whitespace-pre-wrap">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={markdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] ${
          isUser
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl py-3 px-4 shadow-lg shadow-cyan-500/10'
            : isError
              ? 'bg-red-950/40 border border-red-500/30 rounded-2xl px-5 py-4 backdrop-blur-xl'
              : 'bg-slate-800/60 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-xl'
        }`}
      >
        <div className="text-sm font-inter leading-relaxed whitespace-pre-wrap">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={markdownComponents}
            >
              {message.content}
            </ReactMarkdown>
        </div>
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {new Date(message.timestamp).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {!isUser && message.sources && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {message.sources[0]}
            </div>
          )}
        </div>
        {!isUser && message.confidence !== undefined && (
          <div className="mt-3 pt-3 border-t border-white/10 flex justify-end">
            <ConfidenceMeter score={message.confidence} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ConfidenceMeter = ({ score }: { score: number }) => {
  const [renderedScore, setRenderedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setRenderedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (renderedScore / 100) * circumference;
  
  let color = '#ef4444'; // red (< 40)
  if (score >= 70) color = '#22c55e'; // green 
  else if (score >= 40) color = '#f59e0b'; // amber

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Signal Confidence</span>
      <div className="relative w-10 h-10 flex items-center justify-center bg-slate-900/50 rounded-full border border-white/5 shadow-inner">
        <svg className="w-10 h-10 transform -rotate-90">
          <circle cx="20" cy="20" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="none" />
          <motion.circle 
            cx="20" cy="20" r={radius} stroke={color} strokeWidth="3" fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
        <span className="absolute text-[11px] font-mono font-medium" style={{ color, textShadow: `0 0 10px ${color}40` }}>{score}</span>
      </div>
    </div>
  );
};

const thoughts = [
  "Scanning market structure...", 
  "Analyzing sector rotation...", 
  "Calibrating risk models...", 
  "Synthesizing alpha signals..."
];

const TypingIndicator: React.FC = () => {
  const [thoughtIndex, setThoughtIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setThoughtIndex((prev) => (prev + 1) % thoughts.length);
    }, 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      className="flex justify-start"
    >
      <div className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl px-5 py-3 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-5 h-5">
            <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-sm animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-1 border-[1.5px] border-cyan-400/80 rounded-sm animate-[spin_2s_linear_infinite_reverse]" />
            <div className="w-1 h-1 bg-cyan-300 rounded-full animate-ping" />
          </div>
          <div className="overflow-hidden relative w-48 h-5 flex items-center">
             <AnimatePresence mode="wait">
               <motion.span
                 key={thoughtIndex}
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 10 }}
                 transition={{ duration: 0.2 }}
                 className="absolute text-xs font-mono text-cyan-400 tracking-wider whitespace-nowrap"
               >
                 {thoughts[thoughtIndex]}
               </motion.span>
             </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MAX_MESSAGE_LENGTH = 500;

export default function RocketAI() {
  const { messages, isProcessing, predefinedPrompts, addMessage, setProcessing, clearMessages } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageCount = useRef(messages.length);

  useEffect(() => {
    if (messages.length > lastMessageCount.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      lastMessageCount.current = messages.length;
    }
  }, [messages.length]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSendMessage = useCallback(async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isProcessing) return;
    if (trimmedValue.length > MAX_MESSAGE_LENGTH) {
      setError(`Message too long. Max ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }

    const userMessage: ChatMessage = {
      id: generateId('msg-'),
      role: 'user',
      content: trimmedValue,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    const query = trimmedValue;
    setInputValue('');
    setProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();

      if (data.success && data.message?.content) {
        addMessage({
          id: generateId('msg-'),
          role: 'system',
          content: data.message.content,
          timestamp: new Date().toISOString(),
          sources: data.message.sources || ['Rocket AI'],
          confidence: data.message.confidence,
        });
      } else {
        addMessage({
          id: generateId('msg-'),
          role: 'system',
          content: data.error || 'Something went wrong. Please try again.',
          timestamp: new Date().toISOString(),
          sources: ['Error'],
          error: true,
        });
      }
    } catch (err) {
      addMessage({
        id: generateId('msg-'),
        role: 'system',
        content: 'Failed to connect. Check your network and try again.',
        timestamp: new Date().toISOString(),
        sources: ['Connection Error'],
        error: true,
      });
    }

    setProcessing(false);
  }, [inputValue, isProcessing, addMessage, setProcessing]);

  const handlePromptClick = useCallback((prompt: string) => {
    setInputValue(prompt);
    setError(null);
    setTimeout(() => handleSendMessage(), 100);
  }, [handleSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="h-screen flex flex-col -mt-16 -mx-4 px-2 md:px-6 pb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between py-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-cyan-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
            <motion.svg
              className="w-8 h-8 text-white relative z-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.path
                d="M12 2.5L4 12l8 1.5 8-1.5L12 2.5z"
                fill="currentColor"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <path d="M12 2.5L4 12h6l-2 8 8-1.5h-6l8 1.5 8-8.5-8-1.5" stroke="currentColor" strokeWidth={1} />
              <circle cx="12" cy="11" r="2" fill="white" opacity={0.9} />
              <circle cx="10" cy="10" r="0.5" fill="#06b6d4" />
              <circle cx="14" cy="10" r="0.5" fill="#06b6d4" />
            </motion.svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Rocket AI</h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Indian Markets Intelligence
            </p>
          </div>
        </div>

        <motion.button
          onClick={clearMessages}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 rounded-xl text-sm text-slate-400 hover:text-white transition-colors backdrop-blur-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear Chat
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 mb-4"
      >
        {predefinedPrompts.map((prompt) => (
          <PromptChip
            key={prompt}
            label={prompt}
            onClick={() => handlePromptClick(prompt)}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden flex flex-col backdrop-blur-sm"
      >
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin">
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))}
          
          {isProcessing && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-white/5 bg-slate-950/40">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  adjustTextareaHeight();
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyPress}
                placeholder="Ask about Indian markets..."
                className={`w-full px-4 py-3 bg-slate-800/60 border rounded-xl text-white placeholder-slate-500 font-inter resize-none focus:outline-none transition-all backdrop-blur-sm ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20' : 'border-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20'}`}
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                aria-label="Chat input"
                aria-describedby="char-count"
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-5 left-0 text-xs text-red-400"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <motion.button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 transition-all"
              whileHover={{ scale: !inputValue.trim() || isProcessing ? 1 : 1.05 }}
              whileTap={{ scale: !inputValue.trim() || isProcessing ? 1 : 0.95 }}
              aria-label="Send message"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </motion.button>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
            <span>AI may produce inaccuracies. Verify before investing.</span>
            <span id="char-count" className={inputValue.length > MAX_MESSAGE_LENGTH ? 'text-red-400' : ''}>{inputValue.length}/{MAX_MESSAGE_LENGTH}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
