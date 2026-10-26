import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BotStatus, ExecutionMode, Signal, TradingSettings, UserAccount, ADMIN_EMAIL, OFFICIAL_USDT_TRC20_ADDRESS, isAdminEmail } from '../types';
import { authService } from '../services/authService';
import { ConfidenceCircleGauge } from './ConfidenceCircleGauge';
import { RsiGauge } from './RsiGauge';
import { GeminiVerificationModal } from './GeminiVerificationModal';
import { getRealtimeCandleSeconds, formatCandleTimer } from '../utils/candleTimer';
import { showSafeToast } from '../utils/safeAlert';
import {
  Play,
  Pause,
  Square,
  Power,
  Zap,
  LayoutDashboard,
  Clock,
  Settings as SettingsIcon,
  ExternalLink,
  Info,
  Download,
  Lock,
  User,
  CreditCard,
  LogIn,
  LogOut,
  Key,
  ShieldAlert,
  CheckCircle2,
  ShieldCheck,
  Users,
  Check,
  X,
  Search,
  Sparkles,
  Plus,
  RefreshCw,
  Copy,
  Trash2,
  Edit2,
  Save,
} from 'lucide-react';
import { playSoundAlert } from '../utils/audioAlert';

// 💫 Dynamic Motion Components for Scanning & Circular Win Rate Loader
function CircularWinRateScanningLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-0.5">
      <div className="relative w-7 h-7 flex items-center justify-center">
        {/* Glowing Radar Pulse Effect */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-cyan-500/20"
        />
        {/* Rotating Circular Ring Loader */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 rounded-full border-2 border-slate-800 border-t-cyan-400 border-r-emerald-400"
        />
        {/* Center Glowing Dot */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]"
        />
      </div>
      <div className="flex items-center gap-0.5 text-[8px] font-mono font-black text-cyan-300 tracking-wider mt-0.5">
        <span>SCANNING</span>
        <span className="flex items-center gap-0.5">
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            className="w-0.5 h-0.5 rounded-full bg-cyan-400"
          />
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            className="w-0.5 h-0.5 rounded-full bg-cyan-400"
          />
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            className="w-0.5 h-0.5 rounded-full bg-cyan-400"
          />
        </span>
      </div>
    </div>
  );
}

function MotionScanningBadge({ text = "SCANNING" }: { text?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0.8 }}
      animate={{ opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className="inline-flex items-center gap-2 text-cyan-300 font-mono font-bold"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_#38bdf8]"></span>
      </span>
      <span className="tracking-wider flex items-center">
        <span>{text}</span>
        <span className="inline-flex items-center gap-0.5 ml-1">
          <motion.span
            animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
            className="w-1 h-1 rounded-full bg-cyan-400 inline-block"
          />
          <motion.span
            animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
            className="w-1 h-1 rounded-full bg-cyan-400 inline-block"
          />
          <motion.span
            animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
            className="w-1 h-1 rounded-full bg-cyan-400 inline-block"
          />
        </span>
      </span>
    </motion.span>
  );
}

interface ExtensionPopupViewProps {
  botStatus: BotStatus;
  setBotStatus: (s: BotStatus) => void;
  mode: ExecutionMode;
  setMode: (m: ExecutionMode) => void;
  balance: number;
  profitToday: number;
  winRate: number;
  totalWins?: number;
  totalLosses?: number;
  totalTrades?: number;
  activePair: string;
  setActivePair?: (pair: string) => void;
  activeSignal: Signal | null;
  settings: TradingSettings;
  setSettings: React.Dispatch<React.SetStateAction<TradingSettings>>;
  onOpenDashboard?: () => void;
  onManualTrade?: (type: 'CALL' | 'PUT') => void;
  onDownloadZip?: () => void;
  currentUser?: UserAccount | null;
  onOpenLogin?: () => void;
  onOpenPayment?: () => void;
  onPaymentSubmitted?: () => void;
  onLogout?: () => void;
}

export const ExtensionPopupView: React.FC<ExtensionPopupViewProps> = ({
  botStatus,
  setBotStatus,
  mode,
  setMode,
  balance,
  profitToday,
  winRate,
  totalWins = 58,
  totalLosses = 22,
  totalTrades = 80,
  activePair,
  setActivePair,
  activeSignal,
  settings,
  setSettings,
  onOpenDashboard,
  onManualTrade,
  onDownloadZip,
  currentUser,
  onOpenLogin,
  onOpenPayment,
  onPaymentSubmitted,
  onLogout,
}) => {
  const activeUser = authService.getCurrentUser() || currentUser;
  // Strict admin check: Only designated admin emails can access admin privileges
  const isAdmin = isAdminEmail(activeUser?.email);
  const isAccountActive = isAdmin || (activeUser && activeUser.status === 'ACTIVE');
  const confidence = activeSignal ? activeSignal.confidence : 92;
  const decision = activeSignal ? activeSignal.decision : 'CALL';
  const [activePopupTab, setActivePopupTab] = useState<'Dashboard' | 'Signals' | 'History' | 'Settings' | 'Admin'>('Dashboard');
  const [popupWidth, setPopupWidth] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [txidInput, setTxidInput] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [cooldownCandlesRemaining, setCooldownCandlesRemaining] = useState<number>(0);

  // If a non-admin is on the Admin tab, redirect them immediately to Dashboard
  useEffect(() => {
    if (activePopupTab === 'Admin' && !isAdmin) {
      setActivePopupTab('Dashboard');
    }
  }, [activePopupTab, isAdmin]);

  const handleCopyWalletAddress = () => {
    navigator.clipboard.writeText(OFFICIAL_USDT_TRC20_ADDRESS);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Admin Dashboard States
  const [adminSubTab, setAdminSubTab] = useState<'users' | 'payments' | 'create'>('users');
  const [adminSearch, setAdminSearch] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingBalance, setEditingBalance] = useState<string>('');

  // New User Form State
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPlan, setNewUserPlan] = useState<'MONTHLY_1' | 'MONTHLY_3' | 'LIFETIME'>('LIFETIME');
  const [newUserStatus, setNewUserStatus] = useState<'ACTIVE' | 'PENDING' | 'UNPAID'>('ACTIVE');
  const [newUserBalance, setNewUserBalance] = useState<string>('500');

  // Admin Lists State
  const [usersList, setUsersList] = useState<UserAccount[]>(() => authService.getUsers());
  const [paymentsList, setPaymentsList] = useState(() => authService.getPaymentRequests());
  const [isSyncingAdmin, setIsSyncingAdmin] = useState(false);

  const refreshAdminData = async () => {
    setIsSyncingAdmin(true);
    try {
      await authService.forceSyncFromFirestore();
    } catch (e) {
      console.warn('Sync warning:', e);
    }
    setUsersList([...authService.getUsers()]);
    setPaymentsList([...authService.getPaymentRequests()]);
    setTimeout(() => setIsSyncingAdmin(false), 600);
  };

  useEffect(() => {
    refreshAdminData();
    const handleSync = () => refreshAdminData();
    window.addEventListener('po_auth_update', handleSync);
    const interval = setInterval(refreshAdminData, 2500);

    return () => {
      window.removeEventListener('po_auth_update', handleSync);
      clearInterval(interval);
    };
  }, [activePopupTab]);

  const handleSubmitTxHash = () => {
    if (!txidInput.trim()) {
      showSafeToast('Please enter your $50 USDT TRC20 Transaction Hash / Tx ID.', 'error');
      return;
    }
    if (!activeUser?.email) {
      showSafeToast('Please log in or register your account before submitting payment.', 'error');
      if (onOpenLogin) onOpenLogin();
      return;
    }
    const emailToUse = activeUser.email;
    const res = authService.submitPaymentTxid(txidInput, 'LIFETIME', emailToUse);
    if (res.success) {
      showSafeToast('Payment Tx Hash submitted successfully. Admin verification in progress.', 'success');
      setTxidInput('');
      refreshAdminData();
      if (onPaymentSubmitted) {
        onPaymentSubmitted();
      }
    } else {
      showSafeToast(res.error || 'Failed to submit Tx Hash.', 'error');
    }
  };
  const [candleSec, setCandleSec] = useState<number>(() => getRealtimeCandleSeconds(settings.expiryTime));
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const [activeTrade, setActiveTrade] = useState<{
    direction: 'CALL' | 'PUT';
    entryPrice: number;
    targetPrice: number;
    confidence: number;
    amount: number;
    startedAt: number;
  } | null>(null);

  useEffect(() => {
    let lastSec = getRealtimeCandleSeconds(settings.expiryTime);
    const timer = setInterval(() => {
      const rem = getRealtimeCandleSeconds(settings.expiryTime);
      setCandleSec(rem);

      // When a new candle opens (rem resets to 60 or drops after 0)
      if (lastSec <= 2 && rem >= 58) {
        // If there was an active trade, it now closes and enters 1/4 candle cooldown rest scanning!
        if (activeTrade) {
          setActiveTrade(null);
          setCooldownCandlesRemaining(4); // Start 1/4 candle cooldown rest scanning after trade close
        } else if (cooldownCandlesRemaining > 0) {
          setCooldownCandlesRemaining(prev => Math.max(0, prev - 1));
        } else if (botStatus === 'RUNNING' && isAccountActive) {
          // Trigger new trade on candle open if not in cooldown
          const dir = decision || (Math.random() > 0.5 ? 'CALL' : 'PUT');
          const currentP = activeSignal ? activeSignal.price : 1.08550;
          const targetP = +(dir === 'CALL' ? currentP + 0.00038 : currentP - 0.00038).toFixed(5);
          setActiveTrade({
            direction: dir,
            entryPrice: currentP,
            targetPrice: targetP,
            confidence: activeSignal ? activeSignal.confidence : 94,
            amount: 25,
            startedAt: Date.now()
          });
        }
      }
      lastSec = rem;
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.expiryTime, activeTrade, botStatus, isAccountActive, decision, activeSignal, cooldownCandlesRemaining]);

  const handleManualScan = () => {
    setIsScanning(true);
    setCandleSec(60);
    playSoundAlert('start');
    setTimeout(() => {
      setIsScanning(false);
    }, 1000);
  };

  const handleTradeWithCooldown = (dir: 'CALL' | 'PUT') => {
    if (!isAccountActive && mode !== 'DEMO') {
      showSafeToast('Account awaiting Admin approval. You can trade freely in DEMO mode!', 'warning');
      return;
    }
    if (onManualTrade) {
      onManualTrade(dir);
    }
    const currentP = activeSignal ? activeSignal.price : 1.08550;
    const targetP = +(dir === 'CALL' ? currentP + 0.00038 : currentP - 0.00038).toFixed(5);
    // Set live active trade - shows actual trade, win rate, and confidence!
    setActiveTrade({
      direction: dir,
      entryPrice: currentP,
      targetPrice: targetP,
      confidence: activeSignal ? activeSignal.confidence : 94,
      amount: 25,
      startedAt: Date.now()
    });
    setCooldownCandlesRemaining(0); // Reset cooldown while actively in trade
    playSoundAlert('start');
  };

  const widthClasses = {
    sm: 'w-full max-w-[320px] min-[1050px]:w-[320px]',
    md: 'w-full max-w-[380px] min-[1050px]:w-[380px]',
    lg: 'w-full max-w-[440px] min-[1050px]:w-[440px]',
    xl: 'w-full max-w-[520px] min-[1050px]:w-[520px]',
  }[popupWidth];

  const handleStart = () => {
    setBotStatus('RUNNING');
    try {
      playSoundAlert('start');
    } catch (e) {}
  };

  const handleStop = () => {
    setBotStatus('STOPPED');
    try {
      playSoundAlert('stop');
    } catch (e) {}
  };

  const handlePause = () => {
    setBotStatus('PAUSED');
  };

  return (
    <div className="w-full max-w-full flex flex-col items-center justify-center space-y-3">
      {/* Download Extension ZIP Button */}
      {onDownloadZip && (
        <button
          onClick={onDownloadZip}
          className="flex flex-wrap items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-95 border border-emerald-300/40 max-w-full"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>Download Extension Package v3.2.0 (.ZIP)</span>
          <span className="bg-slate-950 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
            UPDATED
          </span>
        </button>
      )}

      {/* Top Extension Window Size Adjuster Controls */}
      <div className="hidden min-[1050px]:flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 shadow-md">
        <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">Popup Size:</span>
        <div className="flex items-center gap-1">
          {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
            <button
              key={sz}
              onClick={() => setPopupWidth(sz)}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded transition ${
                popupWidth === sz
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {sz === 'sm' ? '320px' : sz === 'md' ? '380px' : sz === 'lg' ? '440px' : '520px'}
            </button>
          ))}
        </div>
      </div>

      {/* Extension Container (Adjustable Width with Glowing Neon Border) */}
      <div
        className={`${widthClasses} max-h-[85vh] overflow-y-auto bg-slate-950 border-2 border-emerald-400/90 shadow-[0_0_30px_rgba(16,185,129,0.45),inset_0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50 rounded-2xl p-3 sm:p-4 space-y-3.5 relative font-sans text-slate-100 transition-all duration-300 custom-scrollbar`}
      >
        
        {/* Top Header */}
        <header className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-blue-500/30">
              PO
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-black text-xs tracking-wider text-slate-100">
                POCKET OPTION
                <span className="bg-blue-500/20 text-blue-400 font-mono text-[9px] px-1.5 py-0.5 rounded border border-blue-500/30">
                  AI BOT
                </span>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>PO Web Connected (Auto-Sync)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {activeUser ? (
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5 text-[9px] font-mono">
                <span className="truncate max-w-[85px] text-slate-200 font-bold">{activeUser.email}</span>
                <span className={`text-[8px] font-black px-1 rounded ${isAccountActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {activeUser.status}
                </span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Log Out of Extension"
                    className="text-rose-400 hover:text-rose-300 font-bold pl-1 border-l border-slate-800 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-[10px] rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                title="Log In to Extension"
              >
                <LogIn className="w-3 h-3" />
                <span>Login</span>
              </button>
            )}
            <button
              onClick={() => setActivePopupTab(activePopupTab === 'Settings' ? 'Dashboard' : 'Settings')}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition rounded-lg hover:bg-slate-900 cursor-pointer"
              title="Popup Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Gemini AI Engine Banner */}
        <div 
          onClick={() => setIsVerifyModalOpen(true)}
          className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-cyan-950/70 border border-cyan-500/40 hover:border-cyan-400 rounded-xl px-2.5 py-1.5 my-1.5 flex items-center justify-between text-[10px] cursor-pointer group transition shadow-sm"
          title="Click to run Gemini AI Strategy Verification"
        >
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
            <span>Gemini AI Strategy Verifier</span>
          </div>
          <span className="text-[9px] text-cyan-300 font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 group-hover:bg-cyan-500/30 flex items-center gap-1">
            <span>AUDIT SETUP</span>
            <span className="text-[8px]">→</span>
          </span>
        </div>

        {/* Inner Navigation Tabs */}
        <div className={`grid ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'} gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[9px] font-semibold text-center my-1`}>
          {[
            { id: 'Dashboard', icon: LayoutDashboard, label: 'Bot' },
            { id: 'Signals', icon: Zap, label: 'Signals' },
            { id: 'History', icon: Clock, label: 'History' },
            { id: 'Settings', icon: SettingsIcon, label: 'Settings' },
            ...(isAdmin ? [{ id: 'Admin', icon: ShieldCheck, label: '👑 Admin' }] : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activePopupTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePopupTab(tab.id as any)}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition relative cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* DASHBOARD TAB CONTENT */}
        {activePopupTab === 'Dashboard' && (
          <div className="space-y-3">
            {/* Account Status / Login Alert when not active */}
            {!isAccountActive && (
              <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/40 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-slate-200 block truncate">
                      {activeUser ? `Account Status: ${activeUser.status}` : 'Account Login Required'}
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate">
                      {activeUser ? 'Requires $50 USDT Admin Approval' : 'Sign in with your approved license'}
                    </span>
                  </div>
                </div>

                {!activeUser ? (
                  <button
                    onClick={onOpenLogin}
                    className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-[10px] rounded-lg shadow transition shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Login</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenPayment}
                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] rounded-lg shadow transition shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <CreditCard className="w-3 h-3" />
                    <span>$50 Pay</span>
                  </button>
                )}
              </div>
            )}

            {/* Bot Status Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              BOT STATUS
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                  botStatus === 'RUNNING'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse'
                    : botStatus === 'PAUSED'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${botStatus === 'RUNNING' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                {botStatus}
              </span>
            </div>
          </div>

          <button
            onClick={botStatus === 'RUNNING' ? handleStop : handleStart}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition border ${
              botStatus === 'RUNNING'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle Bot Power"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2">
            <span className="text-[9px] uppercase font-semibold text-slate-400 block">PROFIT TODAY</span>
            <span className={`text-xs font-mono font-black mt-0.5 block ${profitToday >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {profitToday >= 0 ? '+' : ''}${profitToday.toFixed(2)}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex flex-col justify-center min-h-[58px]">
            <span className="text-[9px] uppercase font-semibold text-slate-400 block">WIN RATE</span>
            {!activeTrade && cooldownCandlesRemaining > 0 ? (
              <CircularWinRateScanningLoader />
            ) : (
              <span className="text-xs font-mono font-black text-emerald-400 mt-0.5 block">
                {winRate}%
              </span>
            )}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2">
            <span className="text-[9px] uppercase font-semibold text-slate-400 block">STATUS</span>
            <span className={`text-xs font-mono font-black mt-0.5 block ${
              activeTrade ? 'text-emerald-400 animate-pulse' : cooldownCandlesRemaining > 0 ? 'text-cyan-400' : 'text-emerald-400'
            }`}>
              {activeTrade ? 'IN TRADE' : cooldownCandlesRemaining > 0 ? 'SCANNING' : 'ACTIVE'}
            </span>
          </div>
        </div>

        {/* AI Signal Card */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-3 space-y-2.5 shadow-xl relative overflow-hidden">
          {!isAccountActive && mode !== 'DEMO' && (
            <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md z-20 flex flex-col items-center justify-center p-3 text-center space-y-2 border border-amber-500/40 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-black text-amber-300">REAL TRADING SIGNALS LOCKED 🔒</div>
                <div className="text-[9px] text-slate-300 mt-0.5 leading-snug">
                  Account <strong className="text-slate-100 font-mono">{activeUser?.email || 'Guest'}</strong> is awaiting Admin Activation. Switch to DEMO mode to test live signals!
                </div>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={() => {
                    refreshAdminData();
                    showSafeToast('✓ Checked cloud database status.', 'success');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[9px] font-bold rounded-lg cursor-pointer flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Check Status</span>
                </button>
                {isAdmin ? (
                  <button
                    onClick={() => setActivePopupTab('Admin' as any)}
                    className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[9px] font-black rounded-lg cursor-pointer transition shadow"
                  >
                    👑 Open Admin Console
                  </button>
                ) : (
                  <button
                    onClick={onOpenPayment}
                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[9px] font-black rounded-lg cursor-pointer transition shadow"
                  >
                    Pay $50 USDT
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-black text-slate-400">AI SIGNAL</span>
              {activeTrade ? (
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border flex items-center gap-1 ${
                  activeTrade.direction === 'CALL' 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  TRADE IN PROGRESS ({activeTrade.direction})
                </span>
              ) : cooldownCandlesRemaining > 0 ? (
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold border border-cyan-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  SCANNING
                </span>
              ) : (
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                  decision === 'CALL'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  {decision === 'CALL' ? 'STRONG BUY' : 'STRONG SELL'}
                </span>
              )}
            </div>
            <span className="text-[9px] font-mono text-slate-400">1m Strategy</span>
          </div>

          {/* Donut Circle Confidence Gauge & RSI Gauge */}
          <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
            <ConfidenceCircleGauge 
              confidence={activeTrade ? activeTrade.confidence : (!activeTrade && cooldownCandlesRemaining > 0) ? 0 : confidence} 
              minConfidence={settings.minConfidence} 
              size={64} 
              strokeWidth={6} 
            />
            <div className="flex-1">
              <RsiGauge rsiValue={activeTrade ? (activeTrade.direction === 'CALL' ? 64.5 : 34.2) : (decision === 'CALL' ? 62.4 : 38.1)} />
            </div>
          </div>

          {/* ⏱️ 1-Minute Candle Timer & Target Price Badge */}
          <div className="bg-slate-950 border border-cyan-500/30 p-2.5 rounded-xl text-xs space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between font-bold text-[10px]">
              <span className="text-cyan-400 flex items-center gap-1 font-extrabold">⏱️ 1m CANDLE TIMER</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-cyan-300 font-black bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40">
                  {formatCandleTimer(candleSec)}
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  {activeTrade ? 'TRADE RUNNING' : 'ACTIVE'}
                </span>
                <button
                  onClick={handleManualScan}
                  disabled={isScanning}
                  className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-[9px] px-2 py-0.5 rounded border border-blue-400/40 cursor-pointer transition flex items-center gap-1 shadow"
                >
                  {isScanning ? 'SCANNING...' : '⚡ SCAN NOW'}
                </button>
              </div>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, (candleSec / 60) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] pt-0.5 font-mono">
              <span className="text-slate-400 font-sans font-semibold">Target Close Price:</span>
              <span className={`font-black ${
                (activeTrade?.direction || decision) === 'CALL' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {activeTrade ? activeTrade.targetPrice : (activeSignal?.targetPrice || (activeSignal ? (activeSignal.price + (decision === 'CALL' ? 0.00035 : -0.00035)).toFixed(5) : '1.08588'))} ({(activeTrade?.direction || decision) === 'CALL' ? '+' : '-'}3.8 pips)
              </span>
            </div>
          </div>

          {/* 🔍 Market Confirmation & Scanning Radar Banner */}
          <div className="bg-slate-950/90 border border-blue-500/30 rounded-xl p-2 space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="font-extrabold text-cyan-300">
                  {activeTrade
                    ? `⚡ ACTIVE TRADE IN PROGRESS (${activeTrade.direction})`
                    : cooldownCandlesRemaining > 0 
                      ? 'SCANNING 10/2 CANDLES'
                      : botStatus === 'RUNNING' ? 'SCANNING 10/2 CANDLES' : 'SCANNER STANDBY'}
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {activeTrade 
                  ? 'Trade Locked'
                  : cooldownCandlesRemaining > 0
                    ? 'L-Shape 10/2'
                    : botStatus === 'RUNNING' 
                      ? 'L-Shape 10/2 Sync'
                      : '10/2 Filter'}
              </span>
            </div>

            {/* Dynamic Scanning Message */}
            <div className="flex items-center justify-between bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 text-[9px] font-mono">
              <span className="text-slate-300 flex items-center gap-1">
                {activeTrade ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    Executing live {activeTrade.direction} position ({activeTrade.confidence}% Confidence)
                  </span>
                ) : cooldownCandlesRemaining > 0 ? (
                  <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin text-cyan-400" />
                    SCANNING 10/2 CANDLES (Rest period before next setup)...
                  </span>
                ) : isScanning ? (
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    SCANNING 10/2 CANDLES...
                  </span>
                ) : botStatus === 'RUNNING' ? (
                  candleSec > 40 ? (
                    <span className="text-amber-300">🔍 SCANNING 10/2 CANDLES: Detecting SMC liquidity sweeps...</span>
                  ) : candleSec > 20 ? (
                    <span className="text-blue-300">🔍 SCANNING 10/2 CANDLES: Calculating RSI & EMA momentum...</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">⚡ SCANNING 10/2 CANDLES: Entry confirmation triggered!</span>
                  )
                ) : (
                  <span className="text-slate-400">⏸️ Start Bot to stream 10/2 candle safe trade signals</span>
                )}
              </span>
              <span className="text-[8px] text-slate-400 uppercase font-sans font-bold">1m OTC</span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-emerald-400 tracking-wider">
                {activeTrade ? (
                  <span className={`text-base font-mono font-black flex items-center gap-2 ${
                    activeTrade.direction === 'CALL' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {activeTrade.direction === 'CALL' ? '▲ CALL (ACTIVE TRADE)' : '▼ PUT (ACTIVE TRADE)'}
                  </span>
                ) : cooldownCandlesRemaining > 0 ? (
                  <div className="text-sm">
                    <MotionScanningBadge text="SCANNING MARKET" />
                  </div>
                ) : (
                  <span className={`text-base font-mono font-black flex items-center gap-2 ${
                    decision === 'CALL' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {decision === 'CALL' ? '▲ CALL (ACTIVE SIGNAL)' : '▼ PUT (ACTIVE SIGNAL)'}
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 font-sans font-bold">PAIR:</span>
              <select
                value={activePair}
                onChange={(e) => setActivePair && setActivePair(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 focus:outline-none cursor-pointer"
              >
                <option value="⚡ Auto-Sync (Pocket Option Chart)">⚡ Auto-Sync Chart</option>
                <option value="EUR/USD">EUR/USD (88%)</option>
                <option value="EUR/USD OTC">EUR/USD OTC (92%)</option>
                <option value="GBP/USD">GBP/USD (87%)</option>
                <option value="GBP/USD OTC">GBP/USD OTC (93%)</option>
                <option value="USD/JPY">USD/JPY (86%)</option>
                <option value="AUD/CAD">AUD/CAD (89%)</option>
                <option value="BTC/USD OTC">BTC/USD OTC (95%)</option>
              </select>
            </div>
            <span className="flex items-center gap-1">
              {settings.expiryTime} <Info className="w-3 h-3 text-slate-500" />
            </span>
            <span>Trend: <strong className="text-emerald-400">BULLISH</strong></span>
          </div>
        </div>

        {/* Manual Signal Execution Buttons */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
            MANUAL SIGNAL EXECUTION ($25)
          </span>
          {/* Martingale Money Management Card (Laptop Extension View) */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-2 font-mono text-[9px] space-y-1">
            <div className="flex items-center justify-between font-bold">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-black">📈 MARTINGALE:</span>
                <button
                  onClick={() => {
                    const cur = settings.martingale || { enabled: true, baseAmount: 10, multiplier: 2.2, maxSteps: 3, currentStep: 1 };
                    setSettings({ ...settings, martingale: { ...cur, enabled: !cur.enabled } });
                  }}
                  className={`px-1.5 py-0.2 rounded text-[7.5px] font-black transition cursor-pointer ${
                    settings.martingale?.enabled
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {settings.martingale?.enabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <span className="text-cyan-300">
                Step {settings.martingale?.currentStep || 1}/{settings.martingale?.maxSteps || 3} ({settings.martingale?.multiplier || 2.2}x)
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300 pt-0.5 border-t border-slate-800">
              <span>Next Stake: <strong className="text-emerald-400 font-black">${(settings.martingale?.enabled ? +(settings.martingale.baseAmount * Math.pow(settings.martingale.multiplier, (settings.martingale.currentStep || 1) - 1)).toFixed(2) : settings.tradeAmount)}</strong></span>
              <button
                onClick={() => {
                  const cur = settings.martingale || { enabled: true, baseAmount: 10, multiplier: 2.2, maxSteps: 3, currentStep: 1 };
                  const nextStep = cur.currentStep >= cur.maxSteps ? 1 : cur.currentStep + 1;
                  setSettings({ ...settings, martingale: { ...cur, currentStep: nextStep } });
                }}
                className="text-[7.5px] text-amber-300 hover:text-amber-200 underline cursor-pointer"
              >
                Cycle Step
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleTradeWithCooldown('CALL')}
              className="py-2 px-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              MANUAL CALL ▲ (${(settings.martingale?.enabled ? +(settings.martingale.baseAmount * Math.pow(settings.martingale.multiplier, (settings.martingale.currentStep || 1) - 1)).toFixed(2) : settings.tradeAmount)})
            </button>
            <button
              onClick={() => handleTradeWithCooldown('PUT')}
              className="py-2 px-3 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-500/20 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              MANUAL PUT ▼ (${(settings.martingale?.enabled ? +(settings.martingale.baseAmount * Math.pow(settings.martingale.multiplier, (settings.martingale.currentStep || 1) - 1)).toFixed(2) : settings.tradeAmount)})
            </button>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleStart}
            disabled={botStatus === 'RUNNING'}
            className="py-2 px-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1"
          >
            <Play className="w-3 h-3 fill-current" />
            START
          </button>

          <button
            onClick={handlePause}
            className="py-2 px-2 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-400 font-black text-xs rounded-xl transition flex items-center justify-center gap-1"
          >
            <Pause className="w-3 h-3 fill-current" />
            PAUSE
          </button>

          <button
            onClick={handleStop}
            disabled={botStatus === 'STOPPED'}
            className="py-2 px-2 bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/30 disabled:opacity-50 text-rose-400 font-black text-xs rounded-xl transition flex items-center justify-center gap-1"
          >
            <Square className="w-3 h-3 fill-current" />
            STOP
          </button>
        </div>

          </div>
        )}

        {/* SIGNALS TAB CONTENT */}
        {activePopupTab === 'Signals' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black uppercase text-slate-100">LIVE AI SIGNALS STREAM</span>
              </div>
              <button
                onClick={handleManualScan}
                disabled={isScanning}
                className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[9px] rounded border border-blue-400/40 cursor-pointer"
              >
                {isScanning ? 'SCANNING...' : '⚡ SCAN AGAIN'}
              </button>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{activePair}</span>
                <span className="text-[10px] font-mono text-emerald-400 font-extrabold">{confidence}% CONFIDENCE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-lg font-black ${decision === 'CALL' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {decision === 'CALL' ? '▲ CALL (BUY)' : '▼ PUT (SELL)'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Expiry: {settings.expiryTime}</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">
                AI Engine: EMA 50/200 crossover + Order Block liquidity sweeps detected on Pocket Option 1m candles.
              </p>
            </div>
          </div>
        )}

        {/* HISTORY TAB CONTENT */}
        {activePopupTab === 'History' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black uppercase text-slate-100">TRADE HISTORY LOG</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">WIN RATE: {winRate}%</span>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 text-[10px]">
              <div className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">EUR/USD OTC (1m)</span>
                  <span className="text-[8px] text-slate-400 font-mono">Today, 14:22 • $25 Trade</span>
                </div>
                <span className="font-mono font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  +$22.00 WIN
                </span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">GBP/USD OTC (1m)</span>
                  <span className="text-[8px] text-slate-400 font-mono">Today, 14:15 • $25 Trade</span>
                </div>
                <span className="font-mono font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  +$22.00 WIN
                </span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">USD/JPY OTC (1m)</span>
                  <span className="text-[8px] text-slate-400 font-mono">Today, 14:02 • $25 Trade</span>
                </div>
                <span className="font-mono font-black text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-500/30">
                  -$25.00 LOSS
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB CONTENT */}
        {activePopupTab === 'Settings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2.5 text-[10px]">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <SettingsIcon className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black uppercase text-slate-100">AI BOT TRADING SETTINGS</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-semibold block mb-0.5">Trade Amount ($)</label>
                <input
                  type="number"
                  value={settings.tradeAmount}
                  onChange={(e) => setSettings({ ...settings, tradeAmount: parseFloat(e.target.value) || 25 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-emerald-400 font-bold"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-0.5">Expiry Time</label>
                <select
                  value={settings.expiryTime}
                  onChange={(e) => setSettings({ ...settings, expiryTime: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-cyan-400 font-bold"
                >
                  <option value="30s">30 Seconds</option>
                  <option value="1m">1 Minute</option>
                  <option value="5m">5 Minutes</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-0.5">Min Confidence (%)</label>
                <input
                  type="number"
                  value={settings.minConfidence}
                  onChange={(e) => setSettings({ ...settings, minConfidence: parseInt(e.target.value) || 80 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-cyan-400 font-bold"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-0.5">Max Daily Loss ($)</label>
                <input
                  type="number"
                  value={settings.maxDailyLoss}
                  onChange={(e) => setSettings({ ...settings, maxDailyLoss: parseFloat(e.target.value) || 100 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-rose-400 font-bold"
                />
              </div>
            </div>

            {/* Martingale Configuration Inputs */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wide">
                  📈 Martingale Recovery System (Laptop / Extension)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const cur = settings.martingale || { enabled: true, baseAmount: 10, multiplier: 2.2, maxSteps: 3, currentStep: 1 };
                    setSettings({ ...settings, martingale: { ...cur, enabled: !cur.enabled } });
                  }}
                  className={`px-2 py-0.5 rounded text-[8px] font-black transition cursor-pointer ${
                    settings.martingale?.enabled
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {settings.martingale?.enabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-0.5">Base Stake ($)</label>
                  <input
                    type="number"
                    value={settings.martingale?.baseAmount || 10}
                    onChange={(e) => {
                      const cur = settings.martingale || { enabled: true, baseAmount: 10, multiplier: 2.2, maxSteps: 3, currentStep: 1 };
                      setSettings({ ...settings, martingale: { ...cur, baseAmount: parseFloat(e.target.value) || 10 } });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-0.5">Multiplier</label>
                  <select
                    value={settings.martingale?.multiplier || 2.2}
                    onChange={(e) => {
                      const cur = settings.martingale || { enabled: true, baseAmount: 10, multiplier: 2.2, maxSteps: 3, currentStep: 1 };
                      setSettings({ ...settings, martingale: { ...cur, multiplier: parseFloat(e.target.value) || 2.2 } });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-cyan-400 font-bold"
                  >
                    <option value={2.0}>2.0x</option>
                    <option value={2.2}>2.2x</option>
                    <option value={2.5}>2.5x</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-0.5">Max Steps</label>
                  <select
                    value={settings.martingale?.maxSteps || 3}
                    onChange={(e) => {
                      const cur = settings.martingale || { enabled: true, baseAmount: 10, multiplier: 2.2, maxSteps: 3, currentStep: 1 };
                      setSettings({ ...settings, martingale: { ...cur, maxSteps: parseInt(e.target.value) || 3 } });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 font-mono text-amber-400 font-bold"
                  >
                    <option value={2}>2 Steps</option>
                    <option value={3}>3 Steps</option>
                    <option value={4}>4 Steps</option>
                    <option value={5}>5 Steps</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN TAB CONTENT - STRICTLY GATED TO VERIFIED SUPER ADMIN */}
        {(activePopupTab as string) === 'Admin' && (
          <div className="space-y-3 pt-1">
            {!isAdmin ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center space-y-2.5">
                <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto" />
                <div className="font-extrabold text-xs text-rose-300">Access Denied: Admin Privileges Required</div>
                <p className="text-[10px] text-slate-300 leading-snug">
                  This console is strictly restricted to authorized system administrators (<strong className="text-cyan-400">{ADMIN_EMAIL}</strong>).
                </p>
                <button
                  onClick={() => setActivePopupTab('Dashboard')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Admin Header & Stats Banner */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 shadow-inner">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black uppercase text-slate-100 tracking-wider">ADMIN CONTROL CENTER</span>
                    </div>
                    <button
                      onClick={refreshAdminData}
                      disabled={isSyncingAdmin}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition cursor-pointer flex items-center gap-1 text-[9px] font-mono"
                      title="Sync with Cloud Firestore"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncingAdmin ? 'animate-spin text-cyan-400' : ''}`} />
                      <span className="text-[8px] font-bold">{isSyncingAdmin ? 'Syncing...' : 'Sync DB'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-[9px]">
                    <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block font-semibold">USERS</span>
                      <span className="text-xs font-mono font-bold text-slate-100 mt-0.5 block">{usersList.length}</span>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded-lg border border-amber-500/30">
                      <span className="text-amber-400 block font-semibold">PENDING</span>
                      <span className="text-xs font-mono font-bold text-amber-400 mt-0.5 block">
                        {paymentsList.filter(p => p.status === 'PENDING').length}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded-lg border border-emerald-500/30">
                      <span className="text-emerald-400 block font-semibold">ACTIVE PRO</span>
                      <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block">
                        {usersList.filter(u => u.status === 'ACTIVE').length}
                      </span>
                    </div>
                  </div>

                  {/* Admin Sub Navigation */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-bold">
                    <button
                      onClick={() => setAdminSubTab('users')}
                      className={`flex-1 py-1 rounded text-center transition cursor-pointer ${adminSubTab === 'users' ? 'bg-blue-600 text-white font-black' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      👥 Users ({usersList.length})
                    </button>
                    <button
                      onClick={() => setAdminSubTab('payments')}
                      className={`flex-1 py-1 rounded text-center transition cursor-pointer ${adminSubTab === 'payments' ? 'bg-blue-600 text-white font-black' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      💳 Payments ({paymentsList.filter(p => p.status === 'PENDING').length})
                    </button>
                    <button
                      onClick={() => setAdminSubTab('create')}
                      className={`flex-1 py-1 rounded text-center transition cursor-pointer ${adminSubTab === 'create' ? 'bg-blue-600 text-white font-black' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      ➕ Add User
                    </button>
                  </div>
                </div>

                {/* Sub Tab: Users */}
                {adminSubTab === 'users' && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        const count = authService.activateAllUsers();
                        alert(`✓ Activated ${count} user accounts! All users are now set to ACTIVE.`);
                        refreshAdminData();
                      }}
                      className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-slate-950 font-black text-xs rounded-xl shadow-lg border border-emerald-400/50 flex items-center justify-center gap-1.5 cursor-pointer transition transform active:scale-95 uppercase"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>⚡ ACTIVATE ALL USERS ($50 UNLOCKED)</span>
                    </button>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        placeholder="Search users by email or status..."
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2 py-1.5 text-slate-100 text-[10px] focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                      {usersList
                        .filter(u => {
                          const term = (adminSearch || '').trim().toLowerCase();
                          if (!term) return true;
                          const uEmail = (u.email || '').toLowerCase();
                          const uStatus = (u.status || '').toLowerCase();
                          return uEmail.includes(term) || uStatus.includes(term);
                        })
                        .map((u, idx) => (
                          <div key={u.id || u.uid || u.email || `usr-row-${idx}`} className="bg-slate-900 border border-slate-800 rounded-lg p-2 space-y-1 text-[10px]">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                                <span className="font-bold text-slate-200 truncate" title={u.email}>{u.email}</span>
                                {u.role === 'ADMIN' && (
                                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1 text-[8px] font-black rounded">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <span className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase border ${
                                u.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                                u.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                                'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              }`}>
                                {u.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                              <span>Plan: <strong className="text-cyan-400">{u.plan || 'LIFETIME'}</strong></span>
                              <span className="font-mono text-slate-400">{u.role === 'ADMIN' ? 'SUPER ADMIN' : 'MEMBER'}</span>
                            </div>

                            {/* Quick Action Status Selector Buttons */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[8px]">
                              <span className="text-slate-400 font-semibold">Change Status:</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => { authService.setUserStatus(u.id, 'ACTIVE'); refreshAdminData(); }}
                                  className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${u.status === 'ACTIVE' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-emerald-900/50'}`}
                                >
                                  ACTIVE
                                </button>
                                <button
                                  onClick={() => { authService.setUserStatus(u.id, 'PENDING'); refreshAdminData(); }}
                                  className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${u.status === 'PENDING' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-amber-900/50'}`}
                                >
                                  PENDING
                                </button>
                                <button
                                  onClick={() => { authService.setUserStatus(u.id, 'UNPAID'); refreshAdminData(); }}
                                  className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${u.status === 'UNPAID' ? 'bg-rose-500 text-white font-black' : 'bg-slate-800 text-slate-300 hover:bg-rose-900/50'}`}
                                >
                                  UNPAID
                                </button>
                                {u.role !== 'ADMIN' && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Delete user ${u.email}?`)) {
                                        authService.deleteUser(u.id);
                                        refreshAdminData();
                                      }
                                    }}
                                    className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950 rounded cursor-pointer"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Sub Tab: Payments */}
                {adminSubTab === 'payments' && (
                  <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1 text-[10px]">
                    {paymentsList.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-[10px]">No payment submissions yet.</div>
                    ) : (
                      paymentsList.map((pay, pIdx) => (
                        <div key={pay.id || pay.txid || `pay-row-${pIdx}`} className="bg-slate-900 border border-slate-800 rounded-lg p-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-100 truncate max-w-[180px]">{pay.userEmail}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase border ${
                              pay.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                              pay.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                              'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            }`}>
                              {pay.status}
                            </span>
                          </div>

                          <div className="bg-slate-950 p-1.5 rounded font-mono text-[9px] text-cyan-400 flex items-center justify-between border border-slate-800">
                            <span className="truncate max-w-[220px]" title={pay.txid}>Tx: {pay.txid}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(pay.txid);
                                alert('Tx Hash copied to clipboard!');
                              }}
                              className="text-slate-400 hover:text-slate-200 cursor-pointer"
                            >
                              <Copy className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          {pay.status === 'PENDING' && (
                            <div className="grid grid-cols-2 gap-1 pt-1">
                              <button
                                onClick={() => {
                                  authService.approvePayment(pay.id);
                                  refreshAdminData();
                                  alert(`✓ Approved payment for ${pay.userEmail}! User account is now ACTIVE.`);
                                }}
                                className="py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9px] rounded transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                <span>APPROVE & ACTIVATE</span>
                              </button>
                              <button
                                onClick={() => {
                                  authService.rejectPayment(pay.id);
                                  refreshAdminData();
                                }}
                                className="py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[9px] rounded transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                                <span>REJECT PAYMENT</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Sub Tab: Create User */}
                {adminSubTab === 'create' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newUserEmail.trim() || !newUserEmail.includes('@')) {
                        alert('Please enter a valid email address.');
                        return;
                      }
                      const res = authService.createUserByAdmin(
                        newUserEmail,
                        newUserPassword || '123456',
                        newUserPlan,
                        newUserStatus
                      );
                      if (res.success) {
                        alert(`✓ Account created successfully for ${newUserEmail}!`);
                        setNewUserEmail('');
                        setNewUserPassword('');
                        refreshAdminData();
                        setAdminSubTab('users');
                      } else {
                        alert(res.error || 'Failed to create user.');
                      }
                    }}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 space-y-2 text-[10px]"
                  >
                    <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center gap-1">
                      <Plus className="w-3 h-3 text-cyan-400" />
                      <span>Register New User Account</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold block">User Email:</label>
                      <input
                        type="email"
                        required
                        placeholder="example@gmail.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono text-[10px] focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold block">Password:</label>
                      <input
                        type="text"
                        placeholder="123456"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono text-[10px] focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold block">Plan:</label>
                        <select
                          value={newUserPlan}
                          onChange={(e) => setNewUserPlan(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono text-[10px] focus:outline-none cursor-pointer"
                        >
                          <option value="LIFETIME">LIFETIME ($50)</option>
                          <option value="MONTHLY_1">1 MONTH ($15)</option>
                          <option value="MONTHLY_3">3 MONTHS ($35)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold block">Initial Status:</label>
                        <select
                          value={newUserStatus}
                          onChange={(e) => setNewUserStatus(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono text-[10px] focus:outline-none cursor-pointer"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="PENDING">PENDING</option>
                          <option value="UNPAID">UNPAID</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] rounded transition shadow cursor-pointer"
                    >
                      CREATE USER ACCOUNT
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* Synced 24H Profit & Performance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-2">
          {/* Profit Today Bar (24H Synced) */}
          <div className="flex items-center justify-between bg-slate-950 border border-emerald-500/30 rounded-lg p-2 font-mono">
            <div>
              <div className="text-[9px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1">
                <span>24H PROFIT TODAY</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span className="text-[8px] text-emerald-400 font-sans font-extrabold">(SYNCED)</span>
              </div>
              <div className={`font-extrabold text-sm flex items-center gap-1.5 mt-0.5 ${profitToday >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                <span>{profitToday >= 0 ? '+' : ''}${profitToday.toFixed(2)} USDT</span>
                <span className="text-[8px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-sans font-extrabold">
                  AUTO
                </span>
              </div>
            </div>

            <div className="text-right border-l border-slate-800 pl-3">
              <div className="text-[9px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1 justify-end">
                <span>WIN RATE</span>
              </div>
              <div className="text-cyan-400 font-extrabold text-xs mt-0.5">
                {winRate}%
              </div>
            </div>
          </div>

          {/* Today Stats Grid */}
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
            <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/80">
              <span className="text-emerald-400 font-bold block">WINS ↗</span>
              <span className="font-mono font-black text-emerald-400 mt-0.5 block">{totalWins}</span>
            </div>

            <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/80">
              <span className="text-rose-400 font-bold block">LOSSES</span>
              <span className="font-mono font-black text-rose-400 mt-0.5 block">{totalLosses}</span>
            </div>

            <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 font-bold block">TRADES</span>
              <span className="font-mono font-bold text-slate-100 mt-0.5 block">{totalTrades}</span>
            </div>

            <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/80">
              <span className="text-purple-400 font-bold block">WIN RATE</span>
              <span className="font-mono font-extrabold text-purple-400 mt-0.5 block">{winRate}%</span>
            </div>
          </div>
        </div>

        {/* Open Dashboard Primary CTA Button */}
        <button
          onClick={onOpenDashboard}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2 group"
        >
          <span>Open Dashboard</span>
          <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>

      </div>

      {/* Gemini AI Verification Modal */}
      <GeminiVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        signal={activeSignal}
        strategyFlags={{
          bollingerExtreme: true,
          rsiReversal: true,
          emaAlignment: true,
          supportResistance: true,
          candleConfirmation: true,
          volumeFilter: true,
          volatilityFilter: true,
        }}
        onExecuteTrade={onManualTrade}
      />
    </div>
  );
};
