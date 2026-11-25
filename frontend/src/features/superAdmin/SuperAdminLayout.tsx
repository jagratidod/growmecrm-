import React, { useState } from 'react';
import { Menu, ShieldAlert } from 'lucide-react';
import { SuperAdminSidebar } from './components/SuperAdminSidebar';

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

  return (
    <div className="min-h-screen bg-canvas flex text-ink font-sans">
      {/* Super Admin Left Navigation Sidebar */}
      <SuperAdminSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath={currentPath}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="bg-white/95 backdrop-blur-md border-b border-line sticky top-0 z-30 px-5 sm:px-8 py-4 flex items-center justify-between gap-4 shadow-2xs">
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
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-soft text-brand border border-brand-line">
                  <ShieldAlert className="w-3 h-3 text-brand" />
                  Super Admin
                </span>
              </div>
              {subtitle && (
                <p className="text-xs text-copy-muted font-medium hidden sm:block mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
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
