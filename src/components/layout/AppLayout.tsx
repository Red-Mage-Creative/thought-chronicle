import { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { cn } from '@/lib/utils';
import { LocalThought } from '@/types/thoughts';

interface AppLayoutProps {
  children: ReactNode;
  variant?: 'narrow' | 'wide' | 'full';
  thoughts?: LocalThought[];
}

export const AppLayout = ({ children, variant = 'narrow', thoughts }: AppLayoutProps) => {
  const getContainerClasses = () => {
    switch (variant) {
      case 'narrow':
        return 'max-w-2xl mx-auto px-4 py-6 space-y-6';
      case 'wide':
        return 'max-w-7xl mx-auto px-4 py-6 space-y-6';
      case 'full':
        return 'w-full px-4 py-6 space-y-6';
      default:
        return 'max-w-2xl mx-auto px-4 py-6 space-y-6';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="flex-1">
        <div className="container">
          <div className="max-w-2xl mx-auto py-6 space-y-6">
            {children}
          </div>
        </div>
      </main>
      <AppFooter thoughts={thoughts} />
    </div>
  );
};