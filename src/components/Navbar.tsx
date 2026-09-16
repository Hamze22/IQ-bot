import React, { useState } from 'react';
import {
  Columns2,
  LayoutDashboard,
  Bot,
  Zap,
  BarChart3,
  Code2,
  Bell,
  Download,
  Shield,
  LogIn,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  Sparkles,
  Lock,
  Smartphone,
  Brain,
} from 'lucide-react';
import { ExecutionMode, BotStatus, UserAccount, ADMIN_EMAIL, isAdminEmail } from '../types';
import { IQBotLogo } from './IQBotLogo';

export type NavTabType = 'split' | 'dashboard' | 'popup' | 'simulator' | 'strategy' | 'analytics' | 'source' | 'admin' | 'mobilebot' | 'chatgptbot';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  activePair: string;
  setActivePair: (pair: string) => void;
  balance: number;
  profitToday: number;
  botStatus: BotStatus;
  mode: ExecutionMode;
  setMode: (m: ExecutionMode) => void;
  onDownloadZip: () => void;
  onOpenTelegramModal: () => void;
  currentUser: UserAccount | null;
  onOpenLogin: () => void;
  onOpenPayment: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activePair,
  setActivePair,
  balance,
  profitToday,
  botStatus,
  mode,
  setMode,
  onDownloadZip,
  onOpenTelegramModal,
  currentUser,
  onOpenLogin,
  onOpenPayment,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = isAdminEmail(currentUser?.email);
  const isActive = currentUser && currentUser.status === 'ACTIVE';

  const handleTabClick = (tab: NavTabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-2 sm:px-4 py-2 w-full max-w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 sm:gap-2">
        
        {/* Brand & Connection */}
        <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0" onClick={() => handleTabClick('split')}>
          <IQBotLogo size="sm" showSubtitle={false} hideTextOnMobile={true} className="md:hidden" />
          <IQBotLogo size="sm" showSubtitle={true} className="hidden md:inline-flex" />
          <div className="hidden md:flex flex-col">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold w-fit">
              PRO v3.0.0
            </span>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Chrome Extension Ready
            </span>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => handleTabClick('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'split'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
            Extension Store
          </button>

          <button
            onClick={() => handleTabClick('popup')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'popup'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Extension Preview
          </button>

          <button
            onClick={() => handleTabClick('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'simulator'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 animate-pulse'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            PO AI Overlay
          </button>

          <button
            onClick={() => handleTabClick('mobilebot')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'mobilebot'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 border border-cyan-500/30'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mobile Bot</span>
            <span className="text-[8px] font-mono px-1 py-0.2 bg-cyan-400/20 text-cyan-300 rounded font-black">WEB</span>
          </button>

          <button
            onClick={() => handleTabClick('strategy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'strategy'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            SMC Strategies
          </button>

          <button
            onClick={() => handleTabClick('chatgptbot')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'chatgptbot'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>ChatGPT AI</span>
            <span className="text-[8px] font-black bg-blue-500/20 text-cyan-400 border border-blue-500/30 px-1 rounded animate-pulse">NEW</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => handleTabClick('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Admin Console
            </button>
          )}
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
          
          {/* USER / AUTHENTICATION PILL */}
          {currentUser ? (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-1.5 sm:px-2.5 py-1">
              <div className="flex flex-col text-right min-w-0">
                <div className="flex items-center justify-end gap-1 text-[10px] sm:text-[11px] font-bold text-slate-200">
                  <span className="truncate max-w-[50px] xs:max-w-[80px] sm:max-w-[120px]">{currentUser.email}</span>
                  {isAdmin && (
                    <span className="text-[7px] sm:text-[8px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded shrink-0">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-end gap-1 text-[8px] sm:text-[9px] font-mono">
                  <span className={`font-bold ${currentUser.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {currentUser.status}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Log Out"
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-[11px] sm:text-xs rounded-xl shadow-md transition active:scale-95 shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* Telegram Alert / Notification Button */}
          <button
            onClick={onOpenTelegramModal}
            title="Configure Sound & Telegram Alerts"
            className="hidden sm:flex items-center gap-1 p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition shrink-0"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          </button>

          {/* Mobile Hamburger / "More" Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white lg:hidden transition shrink-0 flex items-center gap-1"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 text-rose-400" />
            ) : (
              <Menu className="w-4 h-4 text-blue-400" />
            )}
            <span className="text-[10px] font-extrabold text-slate-200 hidden xs:inline lg:hidden">More</span>
          </button>

        </div>

      </div>

      {/* Mobile Slide-down Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 pt-2 border-t border-slate-800/80 space-y-2 animate-in slide-in-from-top-2 duration-200">
          
          {/* User Auth Info inside Mobile Drawer */}
          {currentUser ? (
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200 truncate max-w-[200px]">{currentUser.email}</span>
                <span className="text-[10px] text-emerald-400 font-mono">Status: {currentUser.status} ({currentUser.plan})</span>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenLogin();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Login Account</span>
            </button>
          )}

          {/* Navigation Links */}
          <button
            onClick={() => handleTabClick('split')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'split' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              Extension Storefront
            </span>
            <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">Store</span>
          </button>

          <button
            onClick={() => handleTabClick('popup')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'popup' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              Extension Interactive Preview
            </span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Live Demo</span>
          </button>

          <button
            onClick={() => handleTabClick('simulator')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'simulator' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-900 border border-emerald-500/30'
            }`}
          >
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              PO AI Live Overlay Simulator
            </span>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">PO Overlay</span>
          </button>

          <button
            onClick={() => handleTabClick('mobilebot')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'mobilebot' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black' : 'text-cyan-400 hover:bg-slate-900 border border-cyan-500/30'
            }`}
          >
            <span className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Mobile Website Bot (Fast Web App)
            </span>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">Mobile Bot</span>
          </button>

          <button
            onClick={() => handleTabClick('strategy')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'strategy' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              High Win-Rate SMC Strategies
            </span>
            <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">96% WR</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => handleTabClick('admin')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'admin' ? 'bg-amber-500 text-slate-950 font-black' : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
              }`}
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                Admin Console
              </span>
              <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">ADMIN</span>
            </button>
          )}

          {/* Telegram Alerts Config button inside mobile drawer */}
          <button
            onClick={() => {
              onOpenTelegramModal();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 text-slate-200 border border-slate-800 font-bold text-xs rounded-xl"
          >
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Configure Sound & Telegram Alerts
            </span>
            <span className="text-[10px] font-mono text-amber-400">Settings</span>
          </button>
        </div>
      )}
    </header>
  );
};


