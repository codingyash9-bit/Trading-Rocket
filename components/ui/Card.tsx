'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: 'glass' | 'solid' | 'gradient' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'glass', padding = 'md', children, ...props }, ref) => {
    const baseClasses = 'rounded-3xl transition-all duration-300';
    
    const variants = {
      glass: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/20',
      solid: 'bg-slate-900/90 border border-white/5 shadow-2xl',
      gradient: 'bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-800/90 border border-white/10',
      bordered: 'bg-transparent border border-white/20 hover:border-emerald-500/50',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <motion.div
        ref={ref}
        className={`${baseClasses} ${variants[variant]} ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
