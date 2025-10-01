import { ReactNode, ReactElement, cloneElement } from 'react';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { PageTransition } from '@/components/PageTransition';

interface AppLayoutProps {
  children: ReactNode;
  variant?: 'narrow' | 'wide' | 'full';
  defaultTags?: string[];
  onDefaultTagsChange?: (tags: string[]) => void;
  showHeaderWhenUnauthenticated?: boolean;
}

export const AppLayout = ({ children, variant = 'narrow', defaultTags, onDefaultTagsChange, showHeaderWhenUnauthenticated = false }: AppLayoutProps) => {
  const { user } = useAuth();
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

  const shouldShowHeader = user || showHeaderWhenUnauthenticated;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {shouldShowHeader && <AppHeader />}
      <main className="flex-1">
        <PageTransition>
          <div className="container">
            <div className={getContainerClasses()}>
              {defaultTags && onDefaultTagsChange ? 
                cloneElement(children as ReactElement, { defaultTags, onDefaultTagsChange }) : 
                children
              }
            </div>
          </div>
        </PageTransition>
      </main>
      <AppFooter />
    </div>
  );
};