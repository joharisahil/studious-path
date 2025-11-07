import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RootState } from '@/store';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { sidebarCollapsed } = useSelector((state: RootState) => state.ui);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className={cn(
          "flex-1 overflow-auto transition-all duration-300"
        )}>
          <div className="p-3 sm:p-4 md:p-6">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};