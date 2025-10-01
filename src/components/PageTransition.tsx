import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
  variant?: 'fade' | 'scale' | 'slide' | 'enter';
  delay?: number;
  duration?: number;
  className?: string;
}

export const PageTransition = ({ 
  children, 
  variant = 'enter',
  delay = 0,
  duration = 300,
  className 
}: PageTransitionProps) => {
  const animationClass = {
    fade: 'animate-fade-in',
    scale: 'animate-scale-in',
    slide: 'animate-slide-in-right',
    enter: 'animate-enter',
  }[variant];

  return (
    <div 
      className={cn(animationClass, className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};
