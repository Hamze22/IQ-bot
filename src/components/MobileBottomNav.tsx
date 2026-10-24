import React from 'react';
import { Home, Smartphone, Bot, User } from 'lucide-react';
import { NavTabType } from './Navbar';
import { UserAccount } from '../types';

interface MobileBottomNavProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  currentUser: UserAccount | null;
  theme?: 'dark' | 'light';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  theme = 'dark',
}) => {
  const navItems: Array<{
    id: NavTabType;
    label: string;
    icon: React.FC<{ className?: string }>;
    isActive: boolean;
  }> = [
    {
      id: 'split',
      label: 'Home',
      icon: Home,
      isActive: activeTab === 'split' || activeTab === 'dashboard',
    },
    {
      id: 'mobilebot',
      label: 'Mobile Bot',
      icon: Smartphone,
      isActive: activeTab === 'mobilebot',
    },
    {
      id: 'popup',
      label: 'Extension',
      icon: Bot,
      isActive: activeTab === 'popup' || activeTab === 'simulator',
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      isActive:
        activeTab === 'account' ||
        activeTab === 'admin' ||
        activeTab === 'strategy' ||
        activeTab === 'chatgptbot' ||
        activeTab === 'analytics',
    },
  ];

  const isLight = theme === 'light';

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile and tablet bottom navigation"
      className={`fixed bottom-0 inset-x-0 z-50 min-[1050px]:hidden border-t backdrop-blur-xl pb-[env(safe-area-inset-bottom)] transition-colors duration-200 ${
        isLight
          ? 'bg-[#e4d8c6]/95 border-[#cbbba6] text-[#0a0807] shadow-[0_-4px_16px_rgba(65,45,25,0.08)]'
          : 'bg-slate-950/95 border-slate-800/90 text-slate-200 shadow-[0_-8px_24px_rgba(0,0,0,0.6)]'
      }`}
    >
      <div className="max-w-3xl mx-auto grid grid-cols-4 gap-1 px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-h-[48px] px-1 py-1 rounded-xl transition-all duration-150 cursor-pointer whitespace-nowrap ${
                item.isActive
                  ? isLight
                    ? 'bg-[#d1c1ab] text-[#0a0807] font-bold shadow-sm'
                    : 'bg-blue-600/20 text-blue-400 font-bold'
                  : isLight
                  ? 'text-[#4a3b2e] hover:text-[#0a0807] hover:bg-[#d8c9b5]/60 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 font-medium'
              }`}
            >
              {item.isActive && (
                <span
                  className={`absolute top-0.5 w-6 h-0.5 rounded-full ${
                    isLight ? 'bg-blue-700' : 'bg-blue-400'
                  }`}
                />
              )}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    item.isActive ? 'scale-105' : ''
                  }`}
                />
                {item.id === 'account' && currentUser && (
                  <span
                    className={`absolute -top-0.5 -right-1 w-2 h-2 rounded-full ${
                      currentUser.status === 'ACTIVE'
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                  />
                )}
              </div>
              <span className="text-[11px] leading-tight tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
