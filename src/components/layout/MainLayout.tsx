import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export const MainLayout = ({ children, className = "" }: MainLayoutProps) => {
  return (
    <div className="w-full">
      <div className={`max-w-2xl mx-auto px-4 py-6 space-y-6 ${className}`}>
        {children}
      </div>
    </div>
  );
};