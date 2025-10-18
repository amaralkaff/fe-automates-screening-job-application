'use client';

import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-2 duration-300 ${className}`}
    >
      {children}
    </div>
  );
}