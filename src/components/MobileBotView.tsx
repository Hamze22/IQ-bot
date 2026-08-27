import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Brain,
  Zap,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Bell,
  Sparkles,
  Smartphone,
  ChevronRight,
  Clock,
  ShieldCheck,
  Cpu,
  Flame,
  CheckCircle2,
  RefreshCw,
  Eye,
  Sliders,
  Radio,
  Layers,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Search,
  Check,
  ChevronDown,
  Globe,
  Coins,
  Gem,
  Briefcase,
  Radar,
  Timer,
  Info,
  TrendingUp,
  TrendingDown,
  RotateCw,
  Lock,
  Crown,
  LogIn,
  ShieldAlert,
  CreditCard,
  Rocket,
} from 'lucide-react';
import {
  BotStatus,
  Candle,
  ExpiryTime,
  Signal,
  UserAccount,
  isAdminEmail,
} from '../types';
import { GeminiVerificationModal } from './GeminiVerificationModal';
import { ChatGptBotShowcase } from './ChatGptBotShowcase';
import { ChatGptMobileBotPreview } from './ChatGptMobileBotPreview';
import { playSoundAlert } from '../utils/audioAlert';
import { getRealtimeCandleSeconds } from '../utils/candleTimer';

interface MobileBotViewProps {
  botStatus: BotStatus;
  setBotStatus: (s: BotStatus) => void;
  activePair: string;
  setActivePair: (p: string) => void;
  activeSignal: Signal | null;
  candles: Candle[];
  currentPrice: number;
  timeframe: ExpiryTime;
  setTimeframe: (t: ExpiryTime) => void;
  onManualTrade?: (dir: 'CALL' | 'PUT') => void;
  onScanSignal: () => void;
  currentUser: UserAccount | null;
  onOpenLogin: () => void;
  onOpenPayment: () => void;
  onOpenTelegramModal: () => void;
  activePositions?: Array<{
    id: string;
    pair: string;
    type: 'CALL' | 'PUT';
    entryPrice: number;
    currentPrice: number;
    remainingSeconds: number;
    totalSeconds: number;
  }>;
}

export interface AssetPair {
  pair: string;
  base: string;
  quote: string;
  category: 'OTC FOREX' | 'REAL FOREX' | 'CRYPTO' | 'COMMODITIES' | 'STOCKS';
  payout: number;
  isOtc: boolean;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'HOT' | 'STABLE';
}

export const ALL_ASSET_PAIRS: AssetPair[] = [
  // OTC Forex
  { pair: 'EUR/USD OTC', base: 'EUR', quote: 'USD', category: 'OTC FOREX', payout: 92, isOtc: true, volatility: 'MEDIUM', status: 'HOT' },
  { pair: 'GBP/USD OTC', base: 'GBP', quote: 'USD', category: 'OTC FOREX', payout: 91, isOtc: true, volatility: 'MEDIUM', status: 'HOT' },
  { pair: 'USD/JPY OTC', base: 'USD', quote: 'JPY', category: 'OTC FOREX', payout: 90, isOtc: true, volatility: 'LOW', status: 'STABLE' },
  { pair: 'AUD/CAD OTC', base: 'AUD', quote: 'CAD', category: 'OTC FOREX', payout: 88, isOtc: true, volatility: 'LOW', status: 'OPEN' },
  { pair: 'EUR/GBP OTC', base: 'EUR', quote: 'GBP', category: 'OTC FOREX', payout: 89, isOtc: true, volatility: 'LOW', status: 'STABLE' },
  { pair: 'NZD/USD OTC', base: 'NZD', quote: 'USD', category: 'OTC FOREX', payout: 87, isOtc: true, volatility: 'MEDIUM', status: 'OPEN' },
  { pair: 'USD/CAD OTC', base: 'USD', quote: 'CAD', category: 'OTC FOREX', payout: 88, isOtc: true, volatility: 'LOW', status: 'OPEN' },
  { pair: 'AUD/USD OTC', base: 'AUD', quote: 'USD', category: 'OTC FOREX', payout: 90, isOtc: true, volatility: 'MEDIUM', status: 'HOT' },
  { pair: 'USD/CHF OTC', base: 'USD', quote: 'CHF', category: 'OTC FOREX', payout: 89, isOtc: true, volatility: 'LOW', status: 'OPEN' },
  { pair: 'GBP/JPY OTC', base: 'GBP', quote: 'JPY', category: 'OTC FOREX', payout: 90, isOtc: true, volatility: 'HIGH', status: 'HOT' },
  { pair: 'EUR/JPY OTC', base: 'EUR', quote: 'JPY', category: 'OTC FOREX', payout: 91, isOtc: true, volatility: 'MEDIUM', status: 'HOT' },
  { pair: 'CAD/JPY OTC', base: 'CAD', quote: 'JPY', category: 'OTC FOREX', payout: 88, isOtc: true, volatility: 'MEDIUM', status: 'OPEN' },
  { pair: 'CHF/JPY OTC', base: 'CHF', quote: 'JPY', category: 'OTC FOREX', payout: 89, isOtc: true, volatility: 'LOW', status: 'OPEN' },
  { pair: 'AUD/NZD OTC', base: 'AUD', quote: 'NZD', category: 'OTC FOREX', payout: 87, isOtc: true, volatility: 'LOW', status: 'OPEN' },
  { pair: 'EUR/CAD OTC', base: 'EUR', quote: 'CAD', category: 'OTC FOREX', payout: 88, isOtc: true, volatility: 'MEDIUM', status: 'OPEN' },
  { pair: 'GBP/CAD OTC', base: 'GBP', quote: 'CAD', category: 'OTC FOREX', payout: 89, isOtc: true, volatility: 'MEDIUM', status: 'OPEN' },
  { pair: 'NZD/CAD OTC', base: 'NZD', quote: 'CAD', category: 'OTC FOREX', payout: 86, isOtc: true, volatility: 'LOW', status: 'OPEN' },

  // Real / Regular Forex Market
  { pair: 'EUR/USD', base: 'EUR', quote: 'USD', category: 'REAL FOREX', payout: 85, isOtc: false, volatility: 'MEDIUM', status: 'OPEN' },
  { pair: 'GBP/USD', base: 'GBP', quote: 'USD', category: 'REAL FOREX', payout: 84, isOtc: false, volatility: 'MEDIUM', status: 'OPEN' },
  { pair: 'USD/JPY', base: 'USD', quote: 'JPY', category: 'REAL FOREX', payout: 82, isOtc: false, volatility: 'LOW', status: 'STABLE' },
  { pair: 'AUD/USD', base: 'AUD', quote: 'USD', category: 'REAL FOREX', payout: 80, isOtc: false, volatility: 'LOW', status: 'OPEN' },
  { pair: 'USD/CAD', base: 'USD', quote: 'CAD', category: 'REAL FOREX', payout: 81, isOtc: false, volatility: 'LOW', status: 'OPEN' },
  { pair: 'USD/CHF', base: 'USD', quote: 'CHF', category: 'REAL FOREX', payout: 80, isOtc: false, volatility: 'LOW', status: 'OPEN' },
  { pair: 'EUR/GBP', base: 'EUR', quote: 'GBP', category: 'REAL FOREX', payout: 82, isOtc: false, volatility: 'LOW', status: 'STABLE' },
  { pair: 'EUR/JPY', base: 'EUR', quote: 'JPY', category: 'REAL FOREX', payout: 83, isOtc: false, volatility: 'MEDIUM', status: 'OPEN' },
  { pair: 'GBP/JPY', base: 'GBP', quote: 'JPY', category: 'REAL FOREX', payout: 83, isOtc: false, volatility: 'HIGH', status: 'OPEN' },

  // Crypto & Crypto OTC
  { pair: 'BTC/USD OTC', base: 'BTC', quote: 'USD', category: 'CRYPTO', payout: 95, isOtc: true, volatility: 'HIGH', status: 'HOT' },
  { pair: 'ETH/USD OTC', base: 'ETH', quote: 'USD', category: 'CRYPTO', payout: 93, isOtc: true, volatility: 'HIGH', status: 'HOT' },
  { pair: 'LTC/USD OTC', base: 'LTC', quote: 'USD', category: 'CRYPTO', payout: 91, isOtc: true, volatility: 'MEDIUM', status: 'OPEN' },
  { pair: 'XRP/USD OTC', base: 'XRP', quote: 'USD', category: 'CRYPTO', payout: 92, isOtc: true, volatility: 'HIGH', status: 'HOT' },
  { pair: 'SOL/USD OTC', base: 'SOL', quote: 'USD', category: 'CRYPTO', payout: 93, isOtc: true, volatility: 'HIGH', status: 'HOT' },
  { pair: 'DOGE/USD OTC', base: 'DOGE', quote: 'USD', category: 'CRYPTO', payout: 90, isOtc: true, volatility: 'HIGH', status: 'OPEN' },
  { pair: 'BTC/USD', base: 'BTC', quote: 'USD', category: 'CRYPTO', payout: 88, isOtc: false, volatility: 'HIGH', status: 'OPEN' },
  { pair: 'ETH/USD', base: 'ETH', quote: 'USD', category: 'CRYPTO', payout: 87, isOtc: false, volatility: 'HIGH', status: 'OPEN' },
  { pair: 'SOL/USD', base: 'SOL', quote: 'USD', category: 'CRYPTO', payout: 86, isOtc: false, volatility: 'HIGH', status: 'OPEN' },

  // Commodities & OTC Commodities
  { pair: 'GOLD OTC', base: 'XAU', quote: 'USD', category: 'COMMODITIES', payout: 93, isOtc: true, volatility: 'HIGH', status: 'HOT' },
  { pair: 'SILVER OTC', base: 'XAG', quote: 'USD', category: 'COMMODITIES', payout: 90, isOtc: true, volatility: 'MEDIUM', status: 'OPEN' },
  { pair: 'CRUDE OIL OTC', base: 'OIL', quote: 'USD', category: 'COMMODITIES', payout: 89, isOtc: true, volatility: 'HIGH', status: 'OPEN' },
  { pair: 'BRENT OIL OTC', base: 'BRENT', quote: 'USD', category: 'COMMODITIES', payout: 88, isOtc: true, volatility: 'MEDIUM', status: 'OPEN' },
  { pair: 'NATURAL GAS OTC', base: 'GAS', quote: 'USD', category: 'COMMODITIES', payout: 87, isOtc: true, volatility: 'HIGH', status: 'OPEN' },
  { pair: 'GOLD (XAU/USD)', base: 'XAU', quote: 'USD', category: 'COMMODITIES', payout: 84, isOtc: false, volatility: 'HIGH', status: 'OPEN' },
  { pair: 'SILVER (XAG/USD)', base: 'XAG', quote: 'USD', category: 'COMMODITIES', payout: 82, isOtc: false, volatility: 'MEDIUM', status: 'OPEN' },
  { pair: 'US CRUDE OIL', base: 'OIL', quote: 'USD', category: 'COMMODITIES', payout: 80, isOtc: false, volatility: 'HIGH', status: 'OPEN' },

  // Stocks OTC
  { pair: 'APPLE OTC', base: 'AAPL', quote: 'USD', category: 'STOCKS', payout: 92, isOtc: true, volatility: 'MEDIUM', status: 'HOT' },
  { pair: 'TESLA OTC', base: 'TSLA', quote: 'USD', category: 'STOCKS', payout: 91, isOtc: true, volatility: 'HIGH', status: 'HOT' },
  { pair: 'MICROSOFT OTC', base: 'MSFT', quote: 'USD', category: 'STOCKS', payout: 90, isOtc: true, volatility: 'LOW', status: 'STABLE' },
  { pair: 'AMAZON OTC', base: 'AMZN', quote: 'USD', category: 'STOCKS', payout: 90, isOtc: true, volatility: 'MEDIUM', status: 'OPEN' },
  { pair: 'NVIDIA OTC', base: 'NVDA', quote: 'USD', category: 'STOCKS', payout: 92, isOtc: true, volatility: 'HIGH', status: 'HOT' },
  { pair: 'META OTC', base: 'META', quote: 'USD', category: 'STOCKS', payout: 89, isOtc: true, volatility: 'MEDIUM', status: 'OPEN' },
  { pair: 'GOOGLE OTC', base: 'GOOGL', quote: 'USD', category: 'STOCKS', payout: 90, isOtc: true, volatility: 'LOW', status: 'STABLE' },
];

const TIMEFRAMES: Array<{ label: string; value: ExpiryTime }> = [
  { label: '30s', value: '30s' },
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
];

type CategoryFilter = 'ALL' | 'OTC FOREX' | 'REAL FOREX' | 'CRYPTO' | 'COMMODITIES' | 'STOCKS';

export const MobileBotView: React.FC<MobileBotViewProps> = ({
  botStatus,
  setBotStatus,
  activePair,
  setActivePair,
  activeSignal,
  candles,
  currentPrice,
  timeframe,
  setTimeframe,
  onScanSignal,
  currentUser,
  onOpenLogin,
  onOpenPayment,
  onOpenTelegramModal,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [isPairPickerOpen, setIsPairPickerOpen] = useState(false);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastSignalTime, setLastSignalTime] = useState<string>('Just now');
  const [selectedAiEngine, setSelectedAiEngine] = useState<'gemini' | 'chatgpt'>('gemini');

  // Signal Lifecycle State (Auto-expire signal and return to scanning radar)
  const [localSignal, setLocalSignal] = useState<Signal | null>(activeSignal);
  const [signalExpirySeconds, setSignalExpirySeconds] = useState<number>(30);
  const [totalSignalSeconds, setTotalSignalSeconds] = useState<number>(30);
  const lastSignalKeyRef = useRef<string>('');
  const signalExpiryEndTimeRef = useRef<number>(0);
  const isExpiringRef = useRef<boolean>(false);

  // Real-time candle countdown
  const [secondsLeft, setSecondsLeft] = useState(30);

  const getTimeframeDurationSeconds = (tf: ExpiryTime): number => {
    if (tf === '30s') return 30;
    if (tf === '1m') return 60;
    if (tf === '5m') return 300;
    return 60;
  };

  const formatCountdownDisplay = (seconds: number): string => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    }
    return `${seconds}s`;
  };

  // Sync active signal from parent or prop changes (Only re-init when signal ID/timestamp/pair/timeframe changes!)
  useEffect(() => {
    if (activeSignal && activeSignal.decision !== 'NO_SIGNAL') {
      const signalKey = `${activeSignal.id || ''}-${activeSignal.timestamp || ''}-${activeSignal.pair || activePair}-${timeframe}`;
      if (lastSignalKeyRef.current !== signalKey) {
        lastSignalKeyRef.current = signalKey;
        isExpiringRef.current = false;
        setLocalSignal(activeSignal);
        const duration = getTimeframeDurationSeconds(timeframe);
        setTotalSignalSeconds(duration);
        setSignalExpirySeconds(duration);
        signalExpiryEndTimeRef.current = Date.now() + duration * 1000;
        setLastSignalTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        if (soundEnabled) {
          playSoundAlert('signal');
        }
      }
    }
  }, [activeSignal, timeframe, soundEnabled, activePair]);

  // Real-time candle timer and signal countdown loop based on real clock timestamps
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Candle timer countdown
      const sec = getRealtimeCandleSeconds(timeframe);
      setSecondsLeft(sec);

      // 2. Active Signal countdown & auto-expire back to scanning
      if (signalExpiryEndTimeRef.current > 0 && !isExpiringRef.current) {
        const remainingMs = signalExpiryEndTimeRef.current - Date.now();
        const remSec = Math.max(0, Math.ceil(remainingMs / 1000));
        setSignalExpirySeconds(remSec);

        if (remainingMs <= 0) {
          isExpiringRef.current = true;
          signalExpiryEndTimeRef.current = 0;
          setLocalSignal(null);
          setIsScanning(true);
          setTimeout(() => {
            setIsScanning(false);
            onScanSignal();
          }, 1500);
        }
      }

      if (sec === 1 && botStatus === 'RUNNING' && !localSignal && !isExpiringRef.current) {
        if (soundEnabled) playSoundAlert('signal');
        onScanSignal();
      }
    }, 250);

    return () => clearInterval(timer);
  }, [timeframe, botStatus, soundEnabled, localSignal, onScanSignal]);

  // Trigger manual or automatic scan with animation
  const triggerScan = () => {
    lastSignalKeyRef.current = '';
    signalExpiryEndTimeRef.current = 0;
    isExpiringRef.current = false;
    setLocalSignal(null);
    setIsScanning(true);
    if (soundEnabled) playSoundAlert('signal');
    
    // Call parent scanner
    onScanSignal();

    setTimeout(() => {
      setIsScanning(false);
    }, 1500);
  };

  const handleSelectAsset = (pairName: string) => {
    setActivePair(pairName);
    setIsPairPickerOpen(false);
    triggerScan();
  };

  // Filter pairs based on search and category
  const filteredPairs = useMemo(() => {
    return ALL_ASSET_PAIRS.filter((item) => {
      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        item.pair.toLowerCase().includes(query) ||
        item.base.toLowerCase().includes(query) ||
        item.quote.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const currentPairObj = ALL_ASSET_PAIRS.find((p) => p.pair === activePair) || {
    pair: activePair,
    base: activePair.split('/')[0] || 'EUR',
    quote: activePair.split('/')[1] || 'USD',
    category: 'OTC FOREX' as const,
    payout: 92,
    isOtc: activePair.includes('OTC'),
    volatility: 'MEDIUM' as const,
    status: 'HOT' as const,
  };

  const isSignalActive = localSignal && localSignal.decision !== 'NO_SIGNAL' && !isScanning;
  const isCall = localSignal?.decision === 'CALL';

  const isUserLoggedIn = !!currentUser;
  const isUserActive =
    !!currentUser &&
    (currentUser.role === 'ADMIN' ||
      isAdminEmail(currentUser.email) ||
      currentUser.status === 'ACTIVE' ||
      currentUser.approved === true ||
      currentUser.active === true);

  if (!isUserActive) {
    return (
      <div className="w-full max-w-xl mx-auto py-4 px-2 sm:px-4 flex flex-col space-y-4 select-none">
        <div className="w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
          
          {/* Animated Background Glow */}
          <div className="absolute -top-20 -right-20 w-52 h-52 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Lock / Shield Icon */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-2 border-cyan-500/40"
            />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-slate-950 shadow-xl shadow-cyan-500/25">
              {isUserLoggedIn ? (
                <ShieldAlert className="w-8 h-8 text-slate-950" />
              ) : (
                <Lock className="w-8 h-8 text-slate-950" />
              )}
            </div>
          </div>

          {/* Title & Status Details */}
          <div className="space-y-2 max-w-md mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-400 text-[10px] font-mono font-bold tracking-wider uppercase">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>VIP MEMBERS ONLY</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isUserLoggedIn ? 'Account Awaiting Activation' : 'VIP Bot Access Restricted'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {isUserLoggedIn ? (
                <>
                  Your account (<strong className="text-cyan-300">{currentUser?.email}</strong>) is currently <span className="text-amber-400 font-bold uppercase">{currentUser?.status || 'PENDING'}</span>. Please submit payment or contact the admin to activate full live signal access.
                </>
              ) : (
                'You must be signed in with an active VIP account to access live Pocket Option AI trading signals.'
              )}
            </p>
          </div>

          {/* Feature List */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 text-left space-y-2.5 max-w-md mx-auto">
            <div className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
              Included in VIP Access:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>92%+ AI Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pocket Option OTC Pairs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>30s, 1m & 5m Fast Radar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Gemini AI Audit Engine</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 max-w-md mx-auto pt-2">
            {!isUserLoggedIn ? (
              <>
                <button
                  onClick={onOpenLogin}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to VIP Account</span>
                </button>

                <button
                  onClick={onOpenPayment}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Get VIP Access / Subscribe</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onOpenPayment}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Submit / Complete VIP Payment</span>
                </button>

                <button
                  onClick={onOpenLogin}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sign In with Different Account</span>
                </button>
              </>
            )}
          </div>

          {/* Security & Support Note */}
          <p className="text-[10px] text-slate-500 font-mono">
            🔒 Secure 256-bit encrypted authentication • Admin active verification
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto py-2 sm:py-4 px-2 sm:px-4 flex flex-col space-y-3.5 select-none">
      
      {/* AI ENGINE SELECTOR (Gemini 3.7 Pro LIVE on Left vs ChatGPT-4o COMING SOON on Right) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 flex items-center justify-between gap-1 shadow-lg">
        {/* Left Side: Gemini 3.7 Pro (LIVE Active Engine) */}
        <button
          onClick={() => setSelectedAiEngine('gemini')}
          className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
            selectedAiEngine === 'gemini'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white font-black shadow-md shadow-blue-500/20'
              : 'text-cyan-400 hover:text-cyan-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span>Gemini 3.7 Pro</span>
          <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </button>

        {/* Right Side: ChatGPT-4o (COMING SOON) */}
        <button
          onClick={() => setSelectedAiEngine('chatgpt')}
          className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
            selectedAiEngine === 'chatgpt'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
          <span>ChatGPT-4o</span>
          <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black">
            COMING SOON
          </span>
        </button>
      </div>

      {selectedAiEngine === 'chatgpt' ? (
        <div className="space-y-4">
          <div className="p-3 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-black border border-amber-500/40 animate-pulse">
                COMING SOON
              </span>
              <span className="text-xs font-bold text-slate-200">
                ChatGPT-4o Cloud Bot Preview
              </span>
            </div>
            <button
              onClick={() => setSelectedAiEngine('gemini')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition cursor-pointer shadow flex items-center gap-1 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Back to Live Gemini Bot</span>
            </button>
          </div>
          <ChatGptMobileBotPreview onOpenWaitlist={() => {}} />
        </div>
      ) : (
        <>
          {/* Main Bot App Body (Clean Mobile Responsive Surface) */}
          <div className="w-full bg-slate-900/80 border border-slate-800/90 rounded-3xl p-3.5 sm:p-5 shadow-2xl space-y-4">
        
        {/* ACTIVE ASSET SELECTOR (Tap to Choose from Full List) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>ACTIVE ASSET (TAP TO CHANGE)</span>
            </span>
            <span className="text-emerald-400 font-mono font-bold">PAYOUT: +{currentPairObj.payout}%</span>
          </div>

          <div
            onClick={() => setIsPairPickerOpen(true)}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-blue-500/40 hover:border-cyan-400 shadow-md transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-mono font-black text-cyan-300 text-sm shadow-inner">
                {currentPairObj.base.substring(0, 3)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-white group-hover:text-cyan-300 transition">
                    {currentPairObj.pair}
                  </span>
                  {currentPairObj.isOtc ? (
                    <span className="text-[8px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded">
                      OTC
                    </span>
                  ) : (
                    <span className="text-[8px] font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                  <span>{currentPairObj.category}</span>
                  <span>•</span>
                  <span className="text-cyan-400">Price: {currentPrice.toFixed(activePair.includes('JPY') ? 3 : activePair.includes('BTC') ? 1 : 5)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Tap to change</span>
                <span className="text-xs font-black text-emerald-400 font-mono">
                  +{currentPairObj.payout}% Profit
                </span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* TIMEFRAME SELECTOR CHIPS */}
        <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 ml-1">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-300 uppercase">EXPIRY TIMEFRAME:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => {
                  setTimeframe(tf.value);
                  triggerScan();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-black transition cursor-pointer ${
                  timeframe === tf.value
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md scale-105'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/80'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN AI SIGNAL DISPLAY CARD (HERO ELEMENT WITH ANIMATIONS & AUTO-EXPIRY) */}
        <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4 relative overflow-hidden">
          
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
              <span className="text-xs font-black uppercase text-slate-200 tracking-wider">
                AI SIGNAL RADAR
              </span>
            </div>
            <button
              onClick={() => setIsGeminiModalOpen(true)}
              className="text-[10px] font-extrabold bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 px-2.5 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gemini 3.7 AI Audit</span>
            </button>
          </div>

          {/* SIGNAL RESULT HERO DISPLAY (CALL OR PUT ONLY WITH HIGH-TECH ANIMATION) */}
          <AnimatePresence mode="wait">
            {isSignalActive ? (
              <motion.div
                key={`${localSignal?.decision}-${activePair}-${timeframe}-${localSignal?.id}`}
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -15 }}
                transition={{ type: 'spring', damping: 20, stiffness: 240 }}
                className="space-y-3.5"
              >
                {/* Big Vibrant Animated CALL / PUT Signal Card */}
                <div
                  className={`relative p-5 sm:p-6 rounded-2xl border-2 transition-all overflow-hidden ${
                    isCall
                      ? 'bg-gradient-to-br from-emerald-950/80 via-emerald-900/40 to-slate-950 border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.35)] ring-2 ring-emerald-500/30'
                      : 'bg-gradient-to-br from-rose-950/80 via-rose-900/40 to-slate-950 border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.35)] ring-2 ring-rose-500/30'
                  }`}
                >
                  {/* Animated Glow Flare in background */}
                  <motion.div
                    animate={{
                      opacity: [0.3, 0.7, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className={`absolute -right-10 -top-10 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
                      isCall ? 'bg-emerald-500/30' : 'bg-rose-500/30'
                    }`}
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3.5 sm:gap-4">
                      {/* Animated Giant Direction Icon */}
                      {isCall ? (
                        <motion.div
                          animate={{ y: [-4, 4, -4], scale: [1, 1.05, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/50"
                        >
                          <ArrowUpRight className="w-8 h-8 sm:w-9 sm:h-9 stroke-[3.5]" />
                        </motion.div>
                      ) : (
                        <motion.div
                          animate={{ y: [4, -4, 4], scale: [1, 1.05, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/50"
                        >
                          <ArrowDownRight className="w-8 h-8 sm:w-9 sm:h-9 stroke-[3.5]" />
                        </motion.div>
                      )}

                      <div>
                        <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-slate-300 block">
                          AI SIGNAL ACTION
                        </span>
                        <motion.h2
                          animate={{ opacity: [0.9, 1, 0.9] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className={`text-2xl sm:text-4xl font-black tracking-tight ${
                            isCall ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isCall ? 'CALL (BUY ⬆)' : 'PUT (SELL ⬇)'}
                        </motion.h2>
                      </div>
                    </div>

                    {/* Expiry Badge */}
                    <div className="text-right">
                      <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 block font-bold">TIMEFRAME</span>
                      <span className="text-base sm:text-lg font-mono font-black px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-cyan-300 shadow-md inline-block">
                        {localSignal?.suggestedExpiry || timeframe}
                      </span>
                    </div>
                  </div>

                  {/* Signal Expiry Progress Bar ("Line-ka Time-garaysan") */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                        <Timer className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                        <span>Signal Active Window:</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                          {timeframe} Expiry
                        </span>
                        <span className="text-amber-400 font-black font-mono text-sm tracking-wide">
                          {formatCountdownDisplay(signalExpirySeconds)}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Countdown Bar with Glow Head */}
                    <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-0.5 shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-linear relative ${
                          isCall
                            ? 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                            : 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 shadow-[0_0_12px_rgba(244,63,94,0.7)]'
                        }`}
                        style={{
                          width: `${Math.max(0, Math.min(100, (signalExpirySeconds / (totalSignalSeconds || 30)) * 100))}%`,
                        }}
                      >
                        {/* Glow head point */}
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_6px_#fff]" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Confidence Bar */}
                <div className="bg-slate-950/90 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">CONFIDENCE</span>
                      <span className="text-xl font-black font-mono text-cyan-400">
                        {localSignal?.confidence || 92}%
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-bold">
                      HIGH WIN PROBABILITY
                    </span>
                  </div>
                  <button
                    onClick={triggerScan}
                    title="Scan Next Signal"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold font-mono active:scale-95"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Re-scan</span>
                  </button>
                </div>

                {/* Rescan Button */}
                <button
                  onClick={triggerScan}
                  className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-black text-cyan-300 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Next Opportunity</span>
                </button>

              </motion.div>
            ) : (
              /* HIGH-TECH ANIMATED SCANNING & RADAR WAITING STATE */
              <motion.div
                key="scanning-radar-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-10 px-4 rounded-2xl border border-slate-800 bg-slate-950/90 text-center space-y-4 relative overflow-hidden"
              >
                {/* Animated Scanning Beam in Background */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent w-1/2 pointer-events-none"
                />

                {/* Animated Radar Pulse Core */}
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border-2 border-cyan-500/40"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-2 rounded-full border border-dashed border-blue-500/60"
                  />
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/40">
                    <Radar className="w-6 h-6 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    SCANNING MARKET & WAITING FOR SIGNAL...
                  </h3>
                  <p className="text-xs text-slate-400">
                    Analyzing live order flow for <strong className="text-cyan-300">{activePair}</strong>
                  </p>
                </div>

                {/* Animated Timer Pill & Instant Trigger */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                  <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-mono text-cyan-400 font-bold shadow-inner">
                    <Timer className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>Next Candle Check: <strong className="text-white font-black">{secondsLeft}s</strong></span>
                  </div>

                  <button
                    onClick={triggerScan}
                    disabled={isScanning}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>Force Scan Now</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* QUICK HOW-TO STEP INSTRUCTIONS (IN CLEAN ENGLISH) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 text-xs text-slate-300 space-y-1.5 font-mono">
          <div className="font-bold text-cyan-400 flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            <span>HOW TO USE IN 3 SIMPLE STEPS:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
            <li>Select the asset you are trading on Pocket Option.</li>
            <li>Wait for the live AI signal (CALL or PUT).</li>
            <li>Open your Pocket Option app and execute the trade!</li>
          </ol>
        </div>

        {/* Footer Notice */}
        <div className="pt-2 border-t border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-500 font-mono">
            ⚡ Pocket Option AI Web Signal Protocol v3.0 • Real-time AI Feed
          </p>
        </div>

      </div>

      {/* CHATGPT-4O CLOUD BOT COMING SOON PROMO CARD */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">ChatGPT-4o Cloud Bot</span>
              <span className="text-[8px] font-mono font-black px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                COMING SOON
              </span>
            </div>
            <p className="text-[10px] text-slate-300">
              Smart Money Concepts & Next-Gen DOM Neural Scanner. Autonomous Multi-Cloud Execution.
            </p>
          </div>
        </div>

        <button
          onClick={() => setSelectedAiEngine('chatgpt')}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-[11px] shrink-0 transition active:scale-95 cursor-pointer shadow-md"
        >
          Preview Bot →
        </button>
      </div>
      </>
      )}

      {/* FULL ASSET & CURRENCY PICKER MODAL (ALL OTC & REGULAR PAIRS IN CLEAN ENGLISH) */}
      <AnimatePresence>
        {isPairPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl space-y-3 max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white">Select Trading Asset</h2>
                    <p className="text-[10px] text-slate-400">All OTC & Regular Market Pairs ({ALL_ASSET_PAIRS.length})</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPairPickerOpen(false)}
                  className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search asset (e.g. EUR, USD, BTC, GOLD, OTC)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  autoFocus
                />
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                {(['ALL', 'OTC FOREX', 'REAL FOREX', 'CRYPTO', 'COMMODITIES', 'STOCKS'] as CategoryFilter[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Assets Scrollable List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[50vh] scrollbar-thin scrollbar-thumb-slate-800">
                {filteredPairs.length > 0 ? (
                  filteredPairs.map((item) => {
                    const isSelected = activePair === item.pair;
                    return (
                      <button
                        key={item.pair}
                        onClick={() => handleSelectAsset(item.pair)}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/30 border-blue-500 text-white shadow-md'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-mono font-black text-cyan-400">
                            {item.base.substring(0, 3)}
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-white">{item.pair}</span>
                              {item.isOtc ? (
                                <span className="text-[7px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded">
                                  OTC
                                </span>
                              ) : (
                                <span className="text-[7px] font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 py-0.2 rounded">
                                  REAL
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] font-mono text-slate-400">{item.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-emerald-400">
                            +{item.payout}%
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No assets found for "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Close Footer */}
              <button
                onClick={() => setIsPairPickerOpen(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deep Gemini AI Verification Modal */}
      <GeminiVerificationModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        signal={localSignal}
        currentPrice={currentPrice}
        candles={candles}
      />

    </div>
  );
};
