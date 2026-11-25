import React from 'react';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Megaphone,
  History,
  Activity,
  Sliders,
  ArrowLeftRight,
  LogOut,
  X,
  Crown,
} from 'lucide-react';
import { useRouter } from '../../../context/RouterContext';
import { useAuth } from '../../../context/AuthContext';

interface SuperAdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentPath?: string;
}

export const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
  isOpen = false,
  onClose,
  currentPath = 'Dashboard',
}) => {
  const { navigate } = useRouter();
  const { logout } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/super-admin' },
    { name: 'Agencies & Admins', icon: Building2, path: '/super-admin/tenants' },
    { name: 'Subscription Models', icon: CreditCard, path: '/super-admin/subscriptions' },
    { name: 'Global Broadcasts', icon: Megaphone, path: '/super-admin/announcements' },
    { name: 'Security Audit Logs', icon: History, path: '/super-admin/audit-logs' },
    { name: 'Webhook Health', icon: Activity, path: '/super-admin/webhooks' },
    { name: 'Platform Settings', icon: Sliders, path: '/super-admin/settings' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleReturnToCrm = () => {
    navigate('/leads');
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#453372] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 select-none overflow-hidden shadow-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="pt-6 pb-5 px-5 flex items-center justify-between border-b border-purple-400/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#453372] flex items-center justify-center font-black shadow-md shrink-0">
                <Crown className="w-5 h-5 fill-[#453372] text-[#453372]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-white tracking-tight leading-none truncate">
                    GrowMe CRM
                  </h2>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    SUPER
                  </span>
                </div>
                <p className="text-[11px] text-purple-200/70 font-medium mt-1">
                  Master Admin Portal
                </p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links with Curved Tab Cutout */}
          <nav className="pl-4 pr-0 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)] scrollbar-thin scrollbar-thumb-purple-900/40">
            <div className="px-3 pb-2 pt-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-purple-300/60">
                Administration
              </p>
            </div>

            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.name;

              return (
                <div key={item.name} className="relative">
                  <button
                    type="button"
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all text-left ${
                      isActive
                        ? 'sidebar-active-tab text-[#453372] font-bold shadow-xs'
                        : 'text-purple-200/80 hover:text-white hover:bg-white/5 rounded-l-xl'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#453372]' : 'text-purple-300/80'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-purple-400/15 bg-[#3a2864]/95 space-y-2">
          {/* Switch to Agency CRM Button */}
          <button
            type="button"
            onClick={handleReturnToCrm}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-all shadow-xs"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-300" />
            <span>Switch to Agency CRM</span>
          </button>

          {/* Super Admin User info & logout */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/15 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                SA
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Super Admin</p>
                <p className="text-[10px] text-purple-200/70 truncate">Root Administrator</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
