import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Zap,
  Bell,
  Shield,
  LogIn,
  LogOut,
  ShoppingBag,
  Smartphone,
  Brain,
  Sun,
  Moon,
  User,
  CreditCard,
  Download,
} from 'lucide-react';
import { ExecutionMode, BotStatus, UserAccount, isAdminEmail } from '../types';
import { IQBotLogo } from './IQBotLogo';

export type NavTabType =
  | 'split'
  | 'dashboard'
  | 'popup'
  | 'simulator'
  | 'strategy'
  | 'analytics'
  | 'source'
  | 'admin'
  | 'mobilebot'
  | 'chatgptbot'
  | 'account';

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
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  balance,
  mode,
  setMode,
  onDownloadZip,
  onOpenTelegramModal,
  currentUser,
  onOpenLogin,
  onOpenPayment,
  onLogout,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const isAdmin = isAdminEmail(currentUser?.email);
  const isLight = theme === 'light';

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleOutsideInteraction = (event: MouseEvent | TouchEvent | PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (menuPanelRef.current?.contains(target) || menuButtonRef.current?.contains(target)) {
        return;
      }
      setIsMobileMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideInteraction, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideInteraction, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const handleTabClick = (tab: NavTabType) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-2.5 sm:px-4 py-2 w-full max-w-full">
      {/* ===================================================================== */}
      {/* MOBILE & TABLET / IPAD TOP BAR (< 1050px ONLY)                        */}
      {/* Compact Logo + 3-Line Span Menu (Login/Account, Payment, Mode inside) */}
      {/* ===================================================================== */}
      <div className="flex min-[1050px]:hidden items-center justify-between gap-2 w-full max-w-full">
        {/* Left: Compact Brand Logo */}
        <button
          type="button"
          onClick={() => handleTabClick('split')}
          className="flex items-center shrink-0 cursor-pointer text-left focus:outline-none"
        >
          <IQBotLogo size="sm" showSubtitle={false} />
        </button>

        {/* Right: 3-Line Span Hamburger Button (span sadex xariijin ah) */}
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          className={`flex flex-col items-center justify-center gap-1.5 w-10 h-10 rounded-xl border transition cursor-pointer shrink-0 ${
            isLight
              ? 'bg-[#ede5d8] border-[#bfa98e] hover:bg-[#dfd2bf]'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span
            className={`block w-5 h-[2px] rounded-full transition-transform duration-200 ${
              isLight ? 'bg-[#0a0807]' : 'bg-slate-100'
            } ${isMobileMenuOpen ? 'translate-y-[8px] rotate-45' : ''}`}
          />
          <span
            className={`block w-5 h-[2px] rounded-full transition-opacity duration-200 ${
              isLight ? 'bg-[#0a0807]' : 'bg-slate-100'
            } ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}
          />
          <span
            className={`block w-5 h-[2px] rounded-full transition-transform duration-200 ${
              isLight ? 'bg-[#0a0807]' : 'bg-slate-100'
            } ${isMobileMenuOpen ? '-translate-y-[8px] -rotate-45' : ''}`}
          />
        </button>
      </div>

      {/* Mobile & Tablet 3-Line Menu Dropdown Panel (< 1050px ONLY) */}
      {isMobileMenuOpen && (
        <div
          ref={menuPanelRef}
          className="absolute right-2.5 sm:right-4 top-full mt-2 z-50 w-[calc(100vw-1.25rem)] sm:w-[calc(100vw-2rem)] max-w-md min-[1050px]:hidden bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-4"
        >
            {/* 1. Login & Account Section */}
            <div className="space-y-2.5 pb-3.5 border-b border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-400" />
                  <span>Account & Login</span>
                </span>
                {currentUser && (
                  <span
                    className={`font-mono font-bold text-[11px] ${
                      currentUser.status === 'ACTIVE' || isAdmin
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {isAdmin ? 'ADMIN · ACTIVE' : currentUser.status}
                  </span>
                )}
              </div>

              {currentUser ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs py-1">
                    <span className="text-slate-400">Signed in Email</span>
                    <span className="font-mono font-semibold text-slate-100 truncate max-w-[210px]">
                      {currentUser.email}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleTabClick('account')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition cursor-pointer min-h-[40px]"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Account Hub</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenLogin();
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer min-h-[40px]"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Switch Account</span>
                    </button>
                  </div>
                  <div className={`grid ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleTabClick('admin')}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer min-h-[38px]"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Admin Console</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-xl transition cursor-pointer min-h-[38px]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenLogin();
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer min-h-[42px]"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Login / Register</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabClick('account')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer min-h-[42px]"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Account Settings</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Payment & License Section */}
            <div className="space-y-2.5 pb-3.5 border-b border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Payment & License</span>
                </span>
                <span className="font-mono font-bold text-emerald-400">$50 USDT</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenPayment();
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition cursor-pointer min-h-[42px]"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay / Activate</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onDownloadZip();
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer min-h-[42px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Extension .ZIP</span>
                </button>
              </div>
            </div>

            {/* 3. Mode Section (Light/Dark Theme Mode + Demo/Live Account Mode) */}
            <div className="space-y-3">
              {onToggleTheme && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-100">Display Mode</span>
                  <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        if (theme !== 'light') onToggleTheme();
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer min-h-[34px] ${
                        theme === 'light'
                          ? 'bg-[#dfd2bf] text-[#0a0807] border border-[#b8a287] shadow-sm'
                          : 'text-slate-400 hover:text-amber-300'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (theme !== 'dark') onToggleTheme();
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer min-h-[34px] ${
                        theme === 'dark'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-blue-300'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* DESKTOP TOP BAR (>= 1050px) — UNCHANGED                               */}
      {/* ===================================================================== */}
      <div className="hidden min-[1050px]:flex max-w-7xl mx-auto items-center justify-between gap-2">
        {/* Brand & Connection */}
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => handleTabClick('split')}>
          <IQBotLogo size="sm" showSubtitle={true} className="inline-flex" />
          <div className="flex flex-col">
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
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
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
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* USER / AUTHENTICATION PILL */}
          {currentUser ? (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
              <div className="flex flex-col text-right min-w-0">
                <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-slate-200">
                  <span className="truncate max-w-[120px]">{currentUser.email}</span>
                  {isAdmin && (
                    <span className="text-[8px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded shrink-0">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-end gap-1 text-[9px] font-mono">
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
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* ☀️ / 🌙 PC/Laptop Dual Theme Switcher (Light Brown-White vs Dark) */}
          {onToggleTheme && (
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 p-0.5 rounded-xl shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'light') onToggleTheme();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[#dfd2bf] text-[#0d0b09] font-black shadow-md border border-[#c2b199]'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
                title="Light Mode (Warm Brown-White)"
              >
                <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
                <span className="text-[10px] font-bold">Light</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'dark') onToggleTheme();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-600/30 border border-blue-400/40'
                    : 'text-slate-400 hover:text-blue-300'
                }`}
                title="Dark Mode"
              >
                <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold">Dark</span>
              </button>
            </div>
          )}

          {/* Telegram Alert / Notification Button */}
          <button
            onClick={onOpenTelegramModal}
            title="Configure Sound & Telegram Alerts"
            className="flex items-center gap-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition shrink-0"
          >
            <Bell className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </header>
  );
};


