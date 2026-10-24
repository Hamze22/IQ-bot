import React, { useState } from 'react';
import {
  User,
  Mail,
  CreditCard,
  Sliders,
  Bell,
  Download,
  LogIn,
  LogOut,
  Shield,
  Copy,
  Check,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Bot,
  Zap,
  Brain,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import {
  UserAccount,
  TradingSettings,
  ExecutionMode,
  ExpiryTime,
  OFFICIAL_USDT_TRC20_ADDRESS,
  isAdminEmail,
} from '../types';
import { NavTabType } from './Navbar';

interface MobileAccountViewProps {
  currentUser: UserAccount | null;
  balance: number;
  profitToday: number;
  winRate: number;
  mode: ExecutionMode;
  setMode: (m: ExecutionMode) => void;
  settings: TradingSettings;
  setSettings: React.Dispatch<React.SetStateAction<TradingSettings>>;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenLogin: () => void;
  onOpenPayment: () => void;
  onOpenTelegramModal: () => void;
  onDownloadZip: () => void;
  onLogout: () => void;
  setActiveTab: (tab: NavTabType) => void;
}

export const MobileAccountView: React.FC<MobileAccountViewProps> = ({
  currentUser,
  balance,
  profitToday,
  winRate,
  mode,
  setMode,
  settings,
  setSettings,
  theme,
  onToggleTheme,
  onOpenLogin,
  onOpenPayment,
  onOpenTelegramModal,
  onDownloadZip,
  onLogout,
  setActiveTab,
}) => {
  const [copiedWallet, setCopiedWallet] = useState(false);

  const isAdmin = isAdminEmail(currentUser?.email) || currentUser?.role === 'ADMIN';
  const isApproved = isAdmin || (currentUser && currentUser.status === 'ACTIVE');

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(OFFICIAL_USDT_TRC20_ADDRESS);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const formatPlanLabel = (plan?: string) => {
    if (!plan) return 'Standard';
    if (plan === 'LIFETIME') return 'Lifetime Pro';
    if (plan === 'MONTHLY_3') return '3 Months Pro';
    if (plan === 'MONTHLY_1') return '1 Month Pro';
    return plan;
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-2 px-1 sm:px-2 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Account, Payment & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage your email profile, license activation, and AI bot trading preferences.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition cursor-pointer whitespace-nowrap min-h-[42px]"
          >
            <Shield className="w-4 h-4" />
            <span>Open Admin Console</span>
          </button>
        )}
      </div>

      {/* Top Grid: Email/Profile + Payment & License */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Account & Email Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <User className="w-5 h-5 text-blue-400 shrink-0" />
              <h2 className="text-base font-bold text-slate-100">Account & Email</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {currentUser ? (isApproved ? 'Active License' : currentUser.status) : 'Guest Session'}
            </span>
          </div>

          {currentUser ? (
            <div className="space-y-4">
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-800/50">
                  <span className="text-slate-400 flex items-center gap-1.5 text-xs">
                    <Mail className="w-3.5 h-3.5" />
                    Email Address
                  </span>
                  <span className="font-mono font-semibold text-slate-100 truncate max-w-[200px] sm:max-w-[240px]">
                    {currentUser.email}
                  </span>
                </div>

                {currentUser.name && (
                  <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-800/50">
                    <span className="text-slate-400 text-xs">Full Name</span>
                    <span className="font-semibold text-slate-100">{currentUser.name}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-800/50">
                  <span className="text-slate-400 text-xs">Subscription Plan</span>
                  <span className="font-semibold text-blue-400">
                    {formatPlanLabel(currentUser.plan)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-slate-400 text-xs">Account Status</span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      isApproved ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {isApproved ? 'Approved & Active' : currentUser.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer min-h-[42px] whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Switch Account</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-semibold text-xs rounded-xl transition cursor-pointer min-h-[42px] whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Sign in with your registered email or create a new account to sync your Pocket Option AI license across devices.
              </p>
              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition active:scale-[0.99] cursor-pointer min-h-[44px]"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In or Register Account</span>
              </button>
            </div>
          )}
        </section>

        {/* 2. Payment & Extension License Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-emerald-400 shrink-0" />
              <h2 className="text-base font-bold text-slate-100">Payment & License</h2>
            </div>
            <span className="text-xs font-mono tabular-nums text-emerald-400 font-bold">
              $50 USDT
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              {isApproved
                ? 'Your Lifetime Pro license is active. You have full access to live signals and the Chrome Extension package.'
                : 'Activate your Lifetime Pro license via USDT (TRC20) or payment verification to unlock unlimited live trading and extension downloads.'}
            </p>

            {/* Official USDT TRC20 Address Row */}
            <div className="pt-1 pb-2 border-b border-slate-800/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Official USDT (TRC20) Wallet</span>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  {copiedWallet ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Wallet</span>
                    </>
                  )}
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-200 break-all select-all">
                {OFFICIAL_USDT_TRC20_ADDRESS}
              </div>
            </div>

            {currentUser?.txid && (
              <div className="flex items-center justify-between gap-2 text-xs py-1 border-b border-slate-800/60">
                <span className="text-slate-400 shrink-0">Submitted TxID</span>
                <span className="font-mono text-slate-200 truncate max-w-[180px]">
                  {currentUser.txid}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={onOpenPayment}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-[0.99] cursor-pointer min-h-[44px] whitespace-nowrap"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isApproved ? 'Manage Payment' : 'Pay / Activate ($50)'}</span>
              </button>

              <button
                type="button"
                onClick={onDownloadZip}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-[0.99] cursor-pointer min-h-[44px] whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Download Extension</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Bot & Trading Settings Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-cyan-400 shrink-0" />
            <h2 className="text-base font-bold text-slate-100">Bot & App Settings</h2>
          </div>
          <span className="text-xs text-slate-400">Auto-saved</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Execution & Stake Settings */}
          <div className="space-y-4">
            {/* Trade Stake Amount */}
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="mobile-trade-amount" className="text-xs sm:text-sm font-semibold text-slate-100">
                Base Trade Stake ($)
              </label>
              <input
                id="mobile-trade-amount"
                type="number"
                min={1}
                max={5000}
                value={settings.tradeAmount}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value) || 1);
                  setSettings((prev) => ({
                    ...prev,
                    tradeAmount: val,
                    martingale: prev.martingale
                      ? { ...prev.martingale, baseAmount: val }
                      : undefined,
                  }));
                }}
                className="w-28 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-right font-mono tabular-nums font-bold text-sm text-slate-100"
              />
            </div>

            {/* Candle Expiry Time */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
              <span className="text-xs sm:text-sm font-semibold text-slate-100">Candle Expiry</span>
              <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-xl">
                {(['30s', '1m', '5m'] as ExpiryTime[]).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, expiryTime: tf }))}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition cursor-pointer min-h-[34px] ${
                      settings.expiryTime === tf
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum AI Confidence */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
              <span className="text-xs sm:text-sm font-semibold text-slate-100">Min Signal Accuracy</span>
              <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-xl">
                {[85, 90, 95].map((conf) => (
                  <button
                    key={conf}
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, minConfidence: conf }))}
                    className={`px-2.5 py-1.5 text-xs font-mono tabular-nums font-bold rounded-lg transition cursor-pointer min-h-[34px] ${
                      settings.minConfidence === conf
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {conf}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Martingale, Risk, Alerts & Theme */}
          <div className="space-y-4">
            {/* Martingale Toggle & Multiplier */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs sm:text-sm font-semibold text-slate-100">
                  Martingale Recovery ({settings.martingale?.multiplier || 2.2}x)
                </div>
                <div className="text-[11px] text-slate-400">
                  Max {settings.martingale?.maxSteps || 3} steps · Auto-reset on win
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    martingale: {
                      enabled: !(prev.martingale?.enabled ?? true),
                      baseAmount: prev.martingale?.baseAmount || prev.tradeAmount || 10,
                      multiplier: prev.martingale?.multiplier || 2.2,
                      maxSteps: prev.martingale?.maxSteps || 3,
                      currentStep: prev.martingale?.currentStep || 1,
                    },
                  }))
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer min-h-[38px] whitespace-nowrap ${
                  settings.martingale?.enabled
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {settings.martingale?.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Daily Profit / Loss Guard */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/60">
              <div>
                <label htmlFor="mobile-max-profit" className="block text-[11px] font-medium text-slate-400 mb-1">
                  Take Profit Target ($)
                </label>
                <input
                  id="mobile-max-profit"
                  type="number"
                  min={10}
                  value={settings.maxDailyProfit}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      maxDailyProfit: Math.max(10, Number(e.target.value) || 100),
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono tabular-nums font-bold text-sm text-emerald-400"
                />
              </div>
              <div>
                <label htmlFor="mobile-max-loss" className="block text-[11px] font-medium text-slate-400 mb-1">
                  Stop Loss Limit ($)
                </label>
                <input
                  id="mobile-max-loss"
                  type="number"
                  min={10}
                  value={settings.maxDailyLoss}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      maxDailyLoss: Math.max(10, Number(e.target.value) || 50),
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono tabular-nums font-bold text-sm text-rose-400"
                />
              </div>
            </div>

            {/* Sound & Telegram Alerts */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => ({ ...prev, soundAlerts: !prev.soundAlerts }))
                }
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer min-h-[40px]"
              >
                {settings.soundAlerts ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <span>Sound: {settings.soundAlerts ? 'On' : 'Off'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenTelegramModal}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer min-h-[40px]"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Telegram Alerts</span>
              </button>
            </div>

            {/* Theme Mode Selector */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
              <span className="text-xs sm:text-sm font-semibold text-slate-100">Display Theme</span>
              <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => theme !== 'light' && onToggleTheme()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer min-h-[34px] ${
                    theme === 'light'
                      ? 'bg-[#ede5d8] text-[#0a0807] shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => theme !== 'dark' && onToggleTheme()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer min-h-[34px] ${
                    theme === 'dark'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Additional Workspace Tools */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-200">More AI Trading Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className="flex items-center justify-between gap-2 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-100 transition cursor-pointer min-h-[44px]"
          >
            <span className="flex items-center gap-2 truncate">
              <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Chart Overlay</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('strategy')}
            className="flex items-center justify-between gap-2 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-100 transition cursor-pointer min-h-[44px]"
          >
            <span className="flex items-center gap-2 truncate">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">SMC Strategies</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chatgptbot')}
            className="flex items-center justify-between gap-2 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-100 transition cursor-pointer min-h-[44px]"
          >
            <span className="flex items-center gap-2 truncate">
              <Brain className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate">ChatGPT AI</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className="flex items-center justify-between gap-2 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-100 transition cursor-pointer min-h-[44px]"
          >
            <span className="flex items-center gap-2 truncate">
              <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Analytics</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>
      </section>
    </div>
  );
};
