import React, { useState } from 'react';
import { Menu, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { SuperAdminSidebar } from './components/SuperAdminSidebar';
import { useRouter } from '../../context/RouterContext';

interface SuperAdminLayoutProps {
  currentPath: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({
  currentPath,
  title,
  subtitle,
  children,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      {/* Super Admin Left Navigation Sidebar */}
      <SuperAdminSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath={currentPath}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-5 sm:px-8 py-4 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {title}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#453372] border border-purple-200/80">
                  <ShieldAlert className="w-3 h-3 text-[#453372]" />
                  Super Admin
                </span>
              </div>
              {subtitle && (
                <p className="text-xs text-slate-400 font-medium hidden sm:block mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Quick shortcuts */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/leads')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#453372] text-xs font-bold border border-purple-200/70 transition-all shadow-2xs"
            >
              <span>Agency View</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
