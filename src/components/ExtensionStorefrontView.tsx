import React from 'react';
import { ExtensionPopupView } from './ExtensionPopupView';
import { HowItWorksBanner } from './HowItWorksBanner';
import { TrustAndProofSection } from './TrustAndProofSection';
import { ChatGptBotShowcase } from './ChatGptBotShowcase';
import {
  BotStatus,
  ExecutionMode,
  ExpiryTime,
  TradingSettings,
  Signal,
  UserAccount,
  ADMIN_EMAIL,
  isAdminEmail,
} from '../types';
import {
  Download,
  CreditCard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Star,
  Monitor,
  Chrome,
  Flame,
  Globe,
  Lock,
} from 'lucide-react';

interface ExtensionStorefrontViewProps {
  botStatus: BotStatus;
  setBotStatus: (s: BotStatus) => void;
  mode: ExecutionMode;
  setMode: (m: ExecutionMode) => void;
  balance: number;
  profitToday: number;
  winRate: number;
  totalWins: number;
  totalLosses: number;
  totalTrades: number;
  activePair: string;
  activeSignal: Signal | null;
  settings: TradingSettings;
  setSettings: React.Dispatch<React.SetStateAction<TradingSettings>>;
  currentUser?: UserAccount | null;
  onFocusDashboardTab: () => void;
  onFocusPopupTab: () => void;
  onDownloadZip: () => void;
  onOpenPayment: () => void;
  onOpenLogin: () => void;
  onFocusStrategyTab: () => void;
  showScanningZone?: boolean;
}

export const ExtensionStorefrontView: React.FC<ExtensionStorefrontViewProps> = ({
  botStatus,
  setBotStatus,
  mode,
  setMode,
  balance,
  profitToday,
  winRate,
  totalWins,
  totalLosses,
  totalTrades,
  activePair,
  activeSignal,
  settings,
  setSettings,
  currentUser,
  onFocusDashboardTab,
  onFocusPopupTab,
  onDownloadZip,
  onOpenPayment,
  onOpenLogin,
  onFocusStrategyTab,
  showScanningZone = true,
}) => {
  const isAdmin = isAdminEmail(currentUser?.email) || currentUser?.role === 'ADMIN';
  const isActive = currentUser && currentUser.status === 'ACTIVE';
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-10 px-1 sm:px-4 py-2 sm:py-4 overflow-x-hidden">
      
      {/* HERO SECTION - MOBILE RESPONSIVE */}
      <section className="relative bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-[1050px]:p-10 shadow-2xl overflow-hidden">
        {/* Glowing Background Orbs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Badges Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                POWERED BY GEMINI AI (REAL-TIME TRADE ANALYSIS)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm">
                <Chrome className="w-3.5 h-3.5" />
                CHROME EXTENSION v3.2 PRO
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                96% WIN-RATE SMC & OTC
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              iQ Bot Trading <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Gemini AI Powered Pro
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Transform your Pocket Option trading with our official Chrome Extension powered by <strong className="text-purple-300">Gemini AI</strong>. Gemini AI evaluates market momentum, SMC liquidity sweeps, 15-second candle patterns, and trade execution signals in real-time directly inside Pocket Option.
            </p>

            {/* CTA Buttons - Mobile Touch Friendly */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onOpenPayment}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-600/30 transition active:scale-95 flex items-center justify-center gap-2 border border-cyan-400/30 min-h-[48px]"
              >
                <CreditCard className="w-4 h-4" />
                <span>Buy License ($50 USDT / Pay)</span>
              </button>

              <button
                onClick={() => {
                  if (isActive || isAdmin) {
                    onDownloadZip();
                  } else {
                    onOpenPayment();
                  }
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-extrabold text-sm rounded-2xl border border-emerald-500/40 shadow-lg transition active:scale-95 flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isActive || isAdmin ? 'Download Extension v3.2.0 .ZIP (Unlocked)' : 'Unlock Extension v3.2.0 .ZIP ($50 USDT)'}</span>
              </button>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-center lg:text-left">
              <div>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 block">96%</span>
                <span className="text-[11px] text-slate-400 font-medium">Verified Win-Rate</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-blue-400 block">100%</span>
                <span className="text-[11px] text-slate-400 font-medium">Safe & Password Free</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-cyan-400 block">Instant</span>
                <span className="text-[11px] text-slate-400 font-medium">Activation Key</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Extension Preview Box */}
          <div className="lg:col-span-5 flex flex-col items-center w-full min-w-0">
            <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-2xl relative overflow-hidden">
              
              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800 px-1.5 sm:px-2">
                <span className="text-[11px] sm:text-xs font-black text-slate-200 flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="truncate">LIVE EXTENSION POPUP PREVIEW</span>
                </span>
                <button
                  onClick={onFocusPopupTab}
                  className="text-[10px] text-blue-400 font-bold hover:underline shrink-0 whitespace-nowrap"
                >
                  Fullscreen →
                </button>
              </div>

              {/* Render Extension Popup Component */}
              <div className="w-full min-[1050px]:scale-[0.98] origin-top">
                <ExtensionPopupView
                  botStatus={botStatus}
                  setBotStatus={setBotStatus}
                  mode={mode}
                  setMode={setMode}
                  balance={balance}
                  profitToday={profitToday}
                  winRate={winRate}
                  totalWins={totalWins}
                  totalLosses={totalLosses}
                  totalTrades={totalTrades}
                  activePair={activePair}
                  activeSignal={activeSignal}
                  settings={settings}
                  setSettings={setSettings}
                  onOpenDashboard={onFocusDashboardTab}
                />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* NEW NEXT-GEN CHATGPT-4O POWERED BOT SHOWCASE (STABLE RELEASE) */}
      <ChatGptBotShowcase
        currentUser={currentUser}
        onOpenLogin={onOpenLogin}
        onOpenPayment={onOpenPayment}
      />

      {/* HOW TO INSTALL CHROME EXTENSION INSTRUCTIONS */}
      <HowItWorksBanner />

      {/* PRICING & DOWNLOAD UNLOCK SECTION */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className={`text-xs font-mono font-extrabold px-3 py-1 rounded-full border ${
            isActive || isAdmin
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : currentUser?.status === 'PENDING'
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
          }`}>
            {isActive || isAdmin
              ? '✓ LIFETIME LICENSE APPROVED'
              : currentUser?.status === 'PENDING'
              ? '⏳ PAYMENT UNDER ADMIN REVIEW'
              : '🔒 $50 USDT LICENSE REQUIRED'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Chrome Extension Download Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {isActive || isAdmin
              ? 'Your account is approved! Download your Chrome Extension ZIP package below.'
              : currentUser?.status === 'PENDING'
              ? 'Your $50 USDT payment was submitted. Once Admin approves it, your download unlocks automatically.'
              : 'Complete your $50 USDT payment and get Admin approval to unlock the Chrome Extension package.'}
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-slate-200">
          
          {/* Status Banner */}
          {(isActive || isAdmin) ? (
            <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-xl p-4 text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>LICENSE UNLOCKED & ADMIN APPROVED</span>
              </div>
              <p className="text-xs text-slate-300">
                Your account ({currentUser?.email || 'Admin'}) has full lifetime access. You can now download and install the Chrome Extension package.
              </p>
            </div>
          ) : currentUser?.status === 'PENDING' ? (
            <div className="bg-amber-950/60 border border-amber-500/50 rounded-xl p-4 text-amber-300 space-y-2">
              <div className="flex items-center gap-2 text-sm font-extrabold text-amber-400">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
                <span>PAYMENT SUBMITTED — AWAITING ADMIN APPROVAL</span>
              </div>
              <p className="text-xs text-slate-300">
                Your payment Tx Hash is submitted to the Super Admin Dashboard. The download button below will unlock as soon as the Admin verifies your payment.
              </p>
            </div>
          ) : (
            <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 text-rose-200 space-y-2">
              <div className="flex items-center gap-2 text-sm font-extrabold text-rose-400">
                <Lock className="w-5 h-5 text-rose-400 shrink-0" />
                <span>DOWNLOAD LOCKED — $50 USDT PAYMENT & ADMIN APPROVAL REQUIRED</span>
              </div>
              <p className="text-xs text-slate-300">
                To unlock the Chrome Extension .ZIP file, pay $50 USDT (TRC20) and submit your transaction hash for Admin verification.
              </p>
            </div>
          )}

          {/* Features Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 border-y border-slate-800 py-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${isActive || isAdmin ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>Full Chrome Extension Source (.ZIP)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${isActive || isAdmin ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>Pocket Option Live DOM Overlay Badge</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${isActive || isAdmin ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>96% Win-Rate SMC & OTC Signals</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${isActive || isAdmin ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>Sound & Telegram Alerts</span>
            </div>
          </div>

          {/* Primary CTA / Download Button */}
          {(isActive || isAdmin) ? (
            <div className="space-y-3">
              <button
                onClick={onDownloadZip}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-xl shadow-emerald-500/20 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Download className="w-5 h-5" />
                <span>🚀 DOWNLOAD EXTENSION v3.2.0 ZIP PACKAGE (UNLOCKED)</span>
              </button>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
                <span className="font-bold text-slate-200 block uppercase">Quick Installation Steps:</span>
                <ol className="list-decimal list-inside space-y-0.5 font-mono text-[10.5px]">
                  <li>Unzip the downloaded file onto your desktop.</li>
                  <li>Open Chrome and navigate to <span className="text-cyan-400 font-bold">chrome://extensions</span>.</li>
                  <li>Enable <span className="text-amber-400 font-bold">Developer mode</span> (top-right toggle).</li>
                  <li>Click <span className="text-emerald-400 font-bold">Load unpacked</span> and choose the unzipped folder.</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={onOpenPayment}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer uppercase"
              >
                <CreditCard className="w-4.5 h-4.5" />
                <span>Pay $50 USDT (TRC20) & Submit Tx Hash</span>
              </button>

              {!currentUser && (
                <button
                  onClick={onOpenLogin}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition cursor-pointer"
                >
                  Already Paid? Sign In Here
                </button>
              )}
            </div>
          )}

        </div>
      </section>

      {/* TRUST & PROOF SECTION (REVIEWS, FAQ, SECURITY PILLARS) */}
      <TrustAndProofSection />

    </div>
  );
};
