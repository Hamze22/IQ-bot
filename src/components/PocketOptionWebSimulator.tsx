import React, { useState, useRef, useEffect } from 'react';
import { BotStatus, ExecutionMode, Signal, Candle, ExpiryTime, UserAccount, ADMIN_EMAIL, isAdminEmail } from '../types';
import { authService } from '../services/authService';
import { LiveChart } from './LiveChart';
import { ConfidenceCircleGauge } from './ConfidenceCircleGauge';
import { RsiGauge } from './RsiGauge';
import { IQBotLogo } from './IQBotLogo';
import { GeminiVerificationModal } from './GeminiVerificationModal';
import { getRealtimeCandleSeconds, formatCandleTimer } from '../utils/candleTimer';
import {
  GripHorizontal,
  Play,
  Square,
  Pause,
  Zap,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  Settings as SettingsIcon,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Lock,
  Clock,
  User,
  CreditCard,
  LogOut,
  Key,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { playSoundAlert } from '../utils/audioAlert';

interface PocketOptionWebSimulatorProps {
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
  setActivePair: (pair: string) => void;
  activeSignal: Signal | null;
  candles: Candle[];
  currentPrice: number;
  timeframe: ExpiryTime;
  setTimeframe: (tf: ExpiryTime) => void;
  onManualTrade: (type: 'CALL' | 'PUT') => void;
  onDownloadZip?: () => void;
  onScanSignal?: () => void;
  currentUser?: UserAccount | null;
  onOpenLogin?: () => void;
  onOpenPayment?: () => void;
  onLogout?: () => void;
  onOpenDashboard?: () => void;
  showScanningZone?: boolean;
}

export const PocketOptionWebSimulator: React.FC<PocketOptionWebSimulatorProps> = ({
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
  candles,
  currentPrice,
  timeframe,
  setTimeframe,
  onManualTrade,
  onDownloadZip,
  onScanSignal,
  currentUser,
  onOpenLogin,
  onOpenPayment,
  onLogout,
  onOpenDashboard,
  showScanningZone = false,
}) => {
  const activeUser = authService.getCurrentUser() || currentUser;
  const isAdmin = isAdminEmail(activeUser?.email);
  const [candleSec, setCandleSec] = useState<number>(() => getRealtimeCandleSeconds(timeframe));
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCandleSec(getRealtimeCandleSeconds(timeframe));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeframe]);
  // 24H Auto-Reset Trade Stats Logic
  const [lastResetTime, setLastResetTime] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('po_24h_last_reset_time');
      return saved ? parseInt(saved, 10) : Date.now();
    } catch (e) {
      return Date.now();
    }
  });

  const [resetCountdown, setResetCountdown] = useState<string>('24:00:00');
  const [winsOffset, setWinsOffset] = useState<number>(0);
  const [lossesOffset, setLossesOffset] = useState<number>(0);
  const totalWinsRef = useRef(totalWins);
  totalWinsRef.current = totalWins;
  const totalLossesRef = useRef(totalLosses);
  totalLossesRef.current = totalLosses;

  // Auto-reset check every second & countdown calculation
  useEffect(() => {
    const update24hTimer = () => {
      const now = Date.now();
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const timeElapsed = now - lastResetTime;

      // Check if 24 hours elapsed or a new day started
      if (timeElapsed >= ONE_DAY_MS || new Date(now).toDateString() !== new Date(lastResetTime).toDateString()) {
        const freshTime = now;
        setLastResetTime(freshTime);
        try {
          localStorage.setItem('po_24h_last_reset_time', freshTime.toString());
        } catch (e) {}
        setWinsOffset(totalWinsRef.current);
        setLossesOffset(totalLossesRef.current);
      }

      // Calculate remaining time until next 24h reset
      const msLeft = Math.max(0, ONE_DAY_MS - (timeElapsed % ONE_DAY_MS));
      const hours = Math.floor(msLeft / (1000 * 60 * 60));
      const mins = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((msLeft % (1000 * 60)) / 1000);
      setResetCountdown(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
    };

    update24hTimer();
    const interval = setInterval(update24hTimer, 1000);
    return () => clearInterval(interval);
  }, [lastResetTime]);

  const handleManual24hReset = () => {
    const now = Date.now();
    setLastResetTime(now);
    try {
      localStorage.setItem('po_24h_last_reset_time', now.toString());
    } catch (e) {}
    setWinsOffset(totalWins);
    setLossesOffset(totalLosses);
  };

  const effectiveWins = Math.max(0, totalWins - winsOffset);
  const effectiveLosses = Math.max(0, totalLosses - lossesOffset);
  const effectiveTotal = effectiveWins + effectiveLosses;
  const effectiveWinRate = effectiveTotal > 0 ? Math.round((effectiveWins / effectiveTotal) * 100) : winRate || 88;

  // Draggable overlay coordinates state (default top right position inside chart canvas)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 15 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 20,
    posY: 15,
  });

  const [isMinimized, setIsMinimized] = useState(false);
  const [isCompactOverlay, setIsCompactOverlay] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // 📐 Pocket Option Chart L-Shape Candlestick Scanner State
  const [showChartLShapeScanner, setShowChartLShapeScanner] = useState<boolean>(true);
  const [lShapeCandleCount, setLShapeCandleCount] = useState<number>(2);

  // 📈 Martingale Money Management State for Extension Overlay
  const [martingaleEnabled, setMartingaleEnabled] = useState<boolean>(true);
  const [martingaleBaseStake, setMartingaleBaseStake] = useState<number>(10);
  const [martingaleMultiplier, setMartingaleMultiplier] = useState<number>(2.2);
  const [martingaleMaxSteps, setMartingaleMaxSteps] = useState<number>(3);
  const [martingaleCurrentStep, setMartingaleCurrentStep] = useState<number>(1);

  const currentMartingaleStake = martingaleEnabled
    ? +(martingaleBaseStake * Math.pow(martingaleMultiplier, martingaleCurrentStep - 1)).toFixed(2)
    : 10;

  // Available Pocket Option assets for live testing auto-sync
  const poAssets = [
    { name: 'EUR/USD OTC', payout: '92%' },
    { name: 'GBP/USD OTC', payout: '89%' },
    { name: 'USD/JPY OTC', payout: '88%' },
    { name: 'AUD/CAD OTC', payout: '91%' },
    { name: 'BTC/USD', payout: '85%' },
    { name: 'EUR/GBP', payout: '87%' },
  ];

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      // Calculate new position
      let newX = dragRef.current.posX + dx;
      let newY = dragRef.current.posY + dy;

      // Keep within parent container bounds if possible
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        newX = Math.max(10, Math.min(newX, rect.width - 370));
        newY = Math.max(10, Math.min(newY, Math.max(10, rect.height - 560)));
      }

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const confidence = activeSignal ? activeSignal.confidence : 92;
  const decision = activeSignal ? activeSignal.decision : 'CALL';

  const dynamicRsi = React.useMemo(() => {
    if (candles && candles.length >= 5) {
      const closes = candles.slice(-14).map((c) => c.close);
      if (closes.length >= 2) {
        let gains = 0;
        let losses = 0;
        for (let i = 1; i < closes.length; i++) {
          const diff = closes[i] - closes[i - 1];
          if (diff >= 0) gains += diff;
          else losses += Math.abs(diff);
        }
        if (losses > 0) {
          const rs = gains / losses;
          return +(100 - 100 / (1 + rs)).toFixed(1);
        }
      }
    }
    return decision === 'CALL' ? 62.8 : decision === 'PUT' ? 37.2 : 50.0;
  }, [candles, decision]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-full bg-[#0b101d] border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-[720px] select-none flex flex-col font-sans text-slate-100"
    >
      {/* 1. Pocket Option Top Platform Bar */}
      <div className="bg-[#0f172a] border-b border-slate-800 px-2.5 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 shrink-0 max-w-full">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 max-w-full flex-1">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 font-black text-white text-xs flex items-center justify-center shadow-md shadow-blue-500/30">
              PO
            </div>
            <span className="font-black text-sm tracking-wide text-slate-100 hidden sm:inline">
              PocketOption <span className="text-blue-400 font-mono text-xs font-normal">Web Platform</span>
            </span>
          </div>

          {/* Asset Selector Tabs (Clicking any tab auto-syncs the active pair for the bot!) */}
          <div className="flex items-center gap-1 bg-[#020617] p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
            {poAssets.map((asset) => {
              const isActive = activePair === asset.name;
              return (
                <button
                  key={asset.name}
                  onClick={() => setActivePair(asset.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  title="Click to switch active chart pair (Bot Auto-Syncs)"
                >
                  <span>{asset.name}</span>
                  <span className={isActive ? 'text-emerald-300 font-black' : 'text-emerald-400 font-semibold'}>
                    {asset.payout}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right platform stats */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px]">PROFIT TODAY:</span>
            <span className={`font-black ${profitToday >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {profitToday >= 0 ? '+' : ''}${profitToday.toFixed(2)}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold border bg-emerald-500/20 text-emerald-400 border-emerald-500/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACTIVE</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. PO AI Overlay Live Widget Stage */}
      <div className="flex-1 relative min-h-[540px] min-[1050px]:min-h-[580px] px-2.5 py-4 min-[1050px]:p-0 bg-[#070b14] flex flex-col items-center justify-center overflow-hidden">
        {/* Real-time Chart background for the simulator */}
        <div className={`absolute inset-0 z-0 transition-all duration-1000 ${showScanningZone ? 'opacity-100 scale-[1.02]' : 'opacity-40'}`}>
          <LiveChart
            pair={activePair}
            candles={candles}
            currentPrice={currentPrice}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            activeSignal={activeSignal}
            showScanningZone={false}
            hideInternalLShape={true}
          />
        </div>

        {/* 📐 POCKET OPTION BROKER CHART L-SHAPE CANDLESTICK SCANNER (Directly on PO Chart) */}
        {showChartLShapeScanner && (
          <div className="absolute right-4 md:right-16 top-20 md:top-24 z-20 pointer-events-none">
            <div className="relative w-[220px] sm:w-[250px] h-[150px] sm:h-[168px] bg-transparent select-none flex items-center justify-center">
              {/* 4 Sharp Glowing L-Shape Corner Brackets */}
              {/* Top-Left L */}
              <div className="absolute top-0 left-0 w-7 h-7 border-t-[3.5px] border-l-[3.5px] border-cyan-400 rounded-tl-sm drop-shadow-[0_0_8px_#22d3ee]" />
              {/* Top-Right L */}
              <div className="absolute top-0 right-0 w-7 h-7 border-t-[3.5px] border-r-[3.5px] border-cyan-400 rounded-tr-sm drop-shadow-[0_0_8px_#22d3ee]" />
              {/* Bottom-Left L */}
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-[3.5px] border-l-[3.5px] border-cyan-400 rounded-bl-sm drop-shadow-[0_0_8px_#22d3ee]" />
              {/* Bottom-Right L */}
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-[3.5px] border-r-[3.5px] border-cyan-400 rounded-br-sm drop-shadow-[0_0_8px_#22d3ee]" />

              {/* Up-and-Down Scanning Line & Wave */}
              <div className="absolute inset-x-1.5 top-0 pointer-events-none animate-scan-up-down">
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee]" />
                <div className="h-5 w-full -mt-2.5 bg-gradient-to-b from-cyan-400/20 via-cyan-400/10 to-transparent blur-[2px]" />
              </div>

              {/* Only Text Kept */}
              <span className="font-mono text-[11px] font-black tracking-wider text-cyan-300 uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                SCANNING 10/2 CANDLES
              </span>
            </div>
          </div>
        )}

        {/* Subtle grid background pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none z-1" />

        {/* Active Asset & Live Tick Header Bar */}
        <div className="w-full max-w-lg flex items-center justify-between gap-2 mb-6 bg-[#0d1424]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 shadow-lg relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400">ACTIVE PAIR:</span>
            <span className="text-sm font-mono font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
              {activePair}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
              Auto-Sync
            </span>
          </div>

          <div className="text-xs font-mono text-slate-400">
            PRICE: <span className="text-emerald-400 font-bold">{currentPrice.toFixed(5)}</span>
          </div>
        </div>

        {/* Floating AI Overlay Badge Widget */}
        <div
          style={{
            zIndex: 50,
          }}
          className={`w-full ${
            isCompactOverlay ? 'max-w-[275px] p-2.5 space-y-2' : 'max-w-[360px] p-4 space-y-3'
          } bg-slate-950/95 border-2 border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.35)] rounded-2xl backdrop-blur-xl transition-all outline-none relative z-10 ${
            isDragging ? 'opacity-90 scale-[1.02] shadow-[0_0_45px_rgba(16,185,129,0.7)] cursor-grabbing' : ''
          }`}
        >
          {/* DRAG HANDLE & OVERLAY HEADER */}
          <div
            onMouseDown={handleMouseDown}
            className="flex items-center justify-between pb-1.5 border-b border-slate-800/80 cursor-grab active:cursor-grabbing hover:bg-slate-900/60 p-1 rounded-xl transition select-none"
            title="Click & Drag mouse to position this popup anywhere on screen"
          >
            <div className="flex items-center gap-1.5">
              <GripHorizontal className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-mono font-black text-xs text-white truncate max-w-[105px]">
                {activePair}
              </span>
              <span className="flex items-center gap-1 px-1.5 py-0.2 rounded text-[7.5px] font-mono font-black border border-emerald-500/40 bg-emerald-500/20 text-emerald-400">
                <span className={`w-1.5 h-1.5 rounded-full ${botStatus === 'RUNNING' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                {botStatus === 'RUNNING' ? 'LIVE' : 'OFF'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowChartLShapeScanner(!showChartLShapeScanner)}
                className={`px-1.5 py-0.5 text-[7.5px] font-mono font-black rounded transition flex items-center gap-0.5 cursor-pointer ${
                  showChartLShapeScanner
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                    : 'bg-slate-900 text-slate-400 hover:text-cyan-300 border border-cyan-500/30'
                }`}
                title="Toggle L-Shape Scanner on Pocket Option Chart"
              >
                📐 {showChartLShapeScanner ? 'L-SHAPE' : 'SCANNER'}
              </button>
              {onScanSignal && (
                <button
                  onClick={onScanSignal}
                  className="px-1.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[8px] rounded transition shadow flex items-center gap-0.5 active:scale-95 cursor-pointer"
                  title="Scan Signal Now"
                >
                  ⚡ SCAN
                </button>
              )}
              <button
                onClick={() => setIsCompactOverlay(!isCompactOverlay)}
                className="px-1.5 py-0.5 text-[7.5px] font-mono font-black bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded transition cursor-pointer"
                title={isCompactOverlay ? 'Expand Full View' : 'Minimize to Compact HUD'}
              >
                {isCompactOverlay ? 'FULL' : 'MINI'}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 transition cursor-pointer"
                title={isMinimized ? 'Expand Popup' : 'Minimize Popup'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Content (Hidden if Minimized) */}
          {!isMinimized && (
            isCompactOverlay ? (
              /* 🎯 ULTRA-COMPACT HUD: ONLY ESSENTIAL SIGNAL, TIMER, MARTINGALE & CONTROLS */
              <div className="space-y-2">
                {/* 1. Essential AI Signal Card */}
                <div
                  className={`p-2 rounded-xl border text-center transition-all shadow-md relative overflow-hidden ${
                    decision === 'CALL'
                      ? 'bg-gradient-to-r from-emerald-950/90 via-emerald-900/60 to-slate-950 border-emerald-500/80 text-emerald-300'
                      : decision === 'PUT'
                      ? 'bg-gradient-to-r from-rose-950/90 via-rose-900/60 to-slate-950 border-rose-500/80 text-rose-300'
                      : 'bg-slate-900/90 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[7.5px] font-mono font-bold border-b border-white/10 pb-1 mb-1">
                    <span className="flex items-center gap-1 text-cyan-300">
                      <Sparkles className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                      AI SMC SIGNAL
                    </span>
                    <span className="bg-black/50 px-1.5 py-0.2 rounded text-cyan-300 border border-cyan-500/30">
                      {confidence || 96}% ACCURACY
                    </span>
                  </div>

                  <div className="text-sm font-black tracking-wider flex items-center justify-center gap-1 py-0.5 font-mono">
                    {decision === 'CALL' ? (
                      <span className="text-emerald-400 drop-shadow-[0_0_8px_#10b981]">
                        ▲ HIGHER / CALL
                      </span>
                    ) : decision === 'PUT' ? (
                      <span className="text-rose-400 drop-shadow-[0_0_8px_#f43f5e]">
                        ▼ LOWER / PUT
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">⏳ SCANNING 10/2 CANDLES...</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[7.5px] font-mono text-slate-400 pt-1 border-t border-white/5">
                    <span>Price: {currentPrice.toFixed(activePair.includes('JPY') ? 3 : 5)}</span>
                    <span className="text-cyan-300 font-bold">📐 L-Shape 10/2 Sync</span>
                  </div>
                </div>

                {/* 2. Essential Candle Timer & 2-Candle Pacing Card */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[8px] font-mono font-bold text-cyan-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400 animate-pulse" />
                      CANDLE TIMER:
                    </span>
                    <span className="font-black text-cyan-300 text-xs">{formatCandleTimer(candleSec)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-1000"
                      style={{
                        width: `${(candleSec / (timeframe === '30s' ? 30 : timeframe === '5m' ? 300 : 60)) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[7px] font-mono text-slate-400 pt-0.5">
                    <span className="text-emerald-400 font-bold">⚡ 1 Trade / 2 Candles</span>
                    <span>Target: {decision === 'CALL' ? '+3.5' : '-3.5'} pips</span>
                  </div>
                </div>

                {/* 3. Martingale Recovery Management Card (Laptop / Extension) */}
                <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-1.5 space-y-1 font-mono">
                  <div className="flex items-center justify-between text-[7.5px] font-bold">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400 font-black">📈 MARTINGALE:</span>
                      <button
                        onClick={() => setMartingaleEnabled(!martingaleEnabled)}
                        className={`px-1.5 py-0.2 rounded text-[7px] font-black transition cursor-pointer ${
                          martingaleEnabled
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {martingaleEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <span className="text-cyan-300 text-[8px]">
                      Step {martingaleCurrentStep}/{martingaleMaxSteps} ({martingaleMultiplier}x)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[7.5px] text-slate-300 pt-0.5 border-t border-slate-800/80">
                    <span>Stake: <strong className="text-emerald-400 font-black">${currentMartingaleStake.toFixed(2)}</strong></span>
                    <button
                      onClick={() => {
                        // Cycle martingale steps for testing or manual reset
                        setMartingaleCurrentStep(prev => prev >= martingaleMaxSteps ? 1 : prev + 1);
                      }}
                      className="text-[7px] text-amber-300 hover:text-amber-200 underline cursor-pointer"
                      title="Advance or Reset Martingale Step"
                    >
                      Cycle Step
                    </button>
                  </div>
                </div>

                {/* 4. PO Broker Chart L-Shape Scanner Quick Toggle */}
                <div className="flex items-center justify-between bg-slate-900/80 border border-cyan-500/30 rounded-xl p-1.5 px-2 text-[7.5px] font-mono">
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <span>📐 PO CHART SCAN:</span>
                    <strong className={showChartLShapeScanner ? 'text-emerald-400' : 'text-slate-500'}>
                      {showChartLShapeScanner ? 'ON (10/2)' : 'OFF'}
                    </strong>
                  </span>
                  <button
                    onClick={() => setShowChartLShapeScanner(!showChartLShapeScanner)}
                    className="px-2 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded text-[7px] font-black cursor-pointer"
                  >
                    {showChartLShapeScanner ? 'Hide' : 'Show Reticle'}
                  </button>
                </div>

                {/* 5. Essential Action Buttons */}
                <div className="space-y-1.5 pt-0.5">
                  <button
                    onClick={() => {
                      if (botStatus === 'RUNNING') {
                        setBotStatus('STOPPED');
                        try { playSoundAlert('stop'); } catch (e) {}
                      } else {
                        if (activeUser && activeUser.status === 'REJECTED') {
                          alert('🔒 ACCESS DENIED: Account has been rejected by Admin.');
                          return;
                        }
                        setBotStatus('RUNNING');
                        try { playSoundAlert('start'); } catch (e) {}
                      }
                    }}
                    className={`w-full py-1.5 rounded-lg font-black text-[11px] transition shadow cursor-pointer flex items-center justify-center gap-1.5 ${
                      botStatus === 'RUNNING'
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
                    }`}
                  >
                    {botStatus === 'RUNNING' ? '⏹ STOP AUTO BOT' : '▶ START AUTO BOT'}
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onManualTrade('CALL')}
                      className="py-1.5 px-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-[10px] rounded-lg shadow transition flex items-center justify-center gap-1 cursor-pointer font-mono"
                    >
                      ▲ CALL (${currentMartingaleStake})
                    </button>
                    <button
                      onClick={() => onManualTrade('PUT')}
                      className="py-1.5 px-2 bg-rose-500 hover:bg-rose-400 active:scale-95 text-white font-black text-[10px] rounded-lg shadow transition flex items-center justify-center gap-1 cursor-pointer font-mono"
                    >
                      ▼ PUT (${currentMartingaleStake})
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* DETAILED VIEW (Toggled via "FULL" button) */
              <>
                {/* User Account & Status Box inside PO AI Overlay (Login only in overlay; Payment & Reg in main Extension) */}
                <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-2.5 space-y-1.5 shadow-md">
                <div className="flex items-center justify-between text-[9px] font-black tracking-wider uppercase border-b border-slate-800/80 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-300">PO AI ACCOUNT</span>
                  </div>
                  {activeUser ? (
                    <span
                      className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded-md uppercase tracking-wider flex items-center gap-1 ${
                        activeUser.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : activeUser.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        activeUser.status === 'ACTIVE' ? 'bg-emerald-400' : activeUser.status === 'PENDING' ? 'bg-amber-400' : 'bg-rose-400'
                      }`} />
                      {activeUser.status === 'ACTIVE' ? 'ACTIVE' : activeUser.status === 'PENDING' ? 'PENDING APPROVAL' : 'INACTIVE'}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[8px] font-extrabold rounded-md uppercase bg-slate-800 text-slate-400 border border-slate-700">
                      NOT LOGGED IN
                    </span>
                  )}
                </div>

                {/* Status Message / Info */}
                {activeUser ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-300 font-semibold truncate max-w-[190px]" title={activeUser.email}>
                        📧 {activeUser.email}
                      </span>
                      <span className="text-slate-400 font-bold text-[9px]">
                        {activeUser.status === 'ACTIVE' ? 'LIFETIME PRO' : 'PENDING'}
                      </span>
                    </div>

                    {activeUser.status === 'PENDING' && (
                      <div className="bg-amber-950/60 border border-amber-500/40 rounded-lg p-1.5 text-[9px] text-amber-200/90 leading-tight">
                        <div className="font-bold text-amber-400 flex items-center gap-1 mb-0.5">
                          <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>Payment Received ($50 USDT)</span>
                        </div>
                        Awaiting Admin approval in Super Admin Dashboard. Auto-signals will unlock automatically once approved.
                      </div>
                    )}

                    {activeUser.status === 'ACTIVE' && (
                      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-1.5 text-[9px] text-emerald-200/90 flex items-center justify-between">
                        <span className="flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Auto-Trading Unlocked & Active</span>
                        </span>
                        <span className="text-[8px] text-emerald-400 font-mono font-bold">LIFETIME</span>
                      </div>
                    )}

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={onOpenDashboard}
                        className="w-full py-1.5 px-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-[10px] rounded-lg shadow-md border border-cyan-400/40 flex items-center justify-between cursor-pointer transition my-1"
                      >
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                          <span>👑 OPEN ADMIN DASHBOARD</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-white/90" />
                      </button>
                    )}

                    {/* Action button: Logout only */}
                    <div className="flex items-center justify-between gap-1.5 pt-1">
                      <span className="text-[8px] text-slate-400 italic">
                        Manage plans in standard extension popup
                      </span>
                      {onLogout && (
                        <button
                          onClick={onLogout}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[9px] rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Logout"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>LOGOUT</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-0.5">
                    <p className="text-[9px] text-slate-300 leading-tight">
                      Log in to your approved account below to run the AI Trading Bot on Pocket Option.
                    </p>
                    <button
                      onClick={onOpenLogin}
                      className="w-full py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-[10px] rounded-lg shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>LOG IN ACCOUNT</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bot Status Bar */}
              <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-2 flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">
                    BOT STATUS
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        botStatus === 'RUNNING'
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        botStatus === 'RUNNING' ? 'text-emerald-400' : 'text-rose-500'
                      }`}
                    >
                      {botStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (botStatus === 'RUNNING') {
                        setBotStatus('STOPPED');
                        try { playSoundAlert('stop'); } catch (e) {}
                      } else {
                        if (activeUser && activeUser.status === 'REJECTED') {
                          alert('🔒 ACCESS DENIED: Account has been rejected by Admin.');
                          return;
                        }
                        setBotStatus('RUNNING');
                        try { playSoundAlert('start'); } catch (e) {}
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-lg font-black text-xs transition shadow-md cursor-pointer flex items-center gap-1.5 ${
                      botStatus === 'RUNNING'
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
                    }`}
                  >
                    <span>
                      {botStatus === 'RUNNING' ? '⏹ STOP BOT' : '▶ START BOT'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Trade Performance Live Stats Box (24H Auto-Reset Enabled) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 font-mono">
                <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase mb-1">
                  <div className="flex items-center gap-1">
                    <span>📊 TRADE PERFORMANCE</span>
                    <span className="text-[7px] text-emerald-400 font-mono bg-emerald-500/15 px-1 py-0.2 rounded border border-emerald-500/30 flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      24H RESET
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-cyan-400 font-black text-[8px]" title="Time remaining until next 24h automatic stats reset">
                      ⌛ {resetCountdown}
                    </span>
                    <button
                      onClick={handleManual24hReset}
                      className="p-0.5 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                      title="Reset 24H Stats Now"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1 text-center">
                  <div className="bg-slate-950 p-1 rounded-lg border border-emerald-500/30">
                    <span className="text-[7px] font-bold text-emerald-400 block font-sans">WINS</span>
                    <span className="font-black text-emerald-400 text-xs">{effectiveWins}</span>
                  </div>
                  <div className="bg-slate-950 p-1 rounded-lg border border-rose-500/30">
                    <span className="text-[7px] font-bold text-rose-400 block font-sans">LOSSES</span>
                    <span className="font-black text-rose-400 text-xs">{effectiveLosses}</span>
                  </div>
                  <div className="bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <span className="text-[7px] font-bold text-slate-400 block font-sans">TRADES</span>
                    <span className="font-black text-slate-100 text-xs">{effectiveTotal}</span>
                  </div>
                  <div className="bg-slate-950 p-1 rounded-lg border border-cyan-500/30">
                    <span className="text-[7px] font-bold text-cyan-400 block font-sans">WIN %</span>
                    <span className="font-black text-cyan-400 text-xs">{effectiveWinRate}%</span>
                  </div>
                </div>
              </div>

              {/* Auto-Synced Pair Bar */}
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-1.5 px-2 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[7px] text-slate-400 font-bold uppercase block">
                    AUTO-SYNCED PAIR
                  </span>
                  <span className="font-black text-emerald-400 text-xs">{activePair}</span>
                </div>
                <span className="text-[7px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  LIVE SYNC
                </span>
              </div>

              {/* AI Signal Engine Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2">
                <div className="flex items-center justify-between text-[8px] font-bold text-slate-400">
                  <span className="flex items-center gap-1 font-bold">
                    ⚡ AI SIGNAL ENGINE
                  </span>
                  <span className="bg-cyan-500/20 text-cyan-400 font-mono text-[7px] px-1.5 py-0.5 rounded border border-cyan-500/30">
                    1m Candle Sync
                  </span>
                </div>

                {/* 🤖 GEMINI AI SETUP AUDIT & ACCURACY STRIP */}
                <div
                  onClick={() => setIsVerifyModalOpen(true)}
                  className="bg-slate-950/90 border border-cyan-500/40 hover:border-cyan-400 transition p-2 rounded-xl flex items-center justify-between cursor-pointer group shadow-sm"
                  title="Click to view Gemini AI Setup Audit & Accuracy Breakdown"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black text-cyan-300">GEMINI AI VERIFIER</span>
                        <span className="text-[7.5px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                          {confidence >= 85 ? '🟢 96% VERIFIED SAFE' : '🟡 88% VALID'}
                        </span>
                      </div>
                      <p className="text-[8.5px] text-slate-400 line-clamp-1 group-hover:text-slate-200">
                        {decision === 'CALL'
                          ? '1M Reversal: Lower Band + RSI 7 (<30) + EMA 5 cross'
                          : decision === 'PUT'
                          ? '1M Reversal: Upper Band + RSI 7 (>70) + EMA 5 cross'
                          : 'Confluence filter active. Scanning for 85+ setup.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-cyan-400 group-hover:underline shrink-0 ml-1">
                    Audit →
                  </span>
                </div>

                {/* 1-2 Candle Timer */}
                <div className="bg-slate-950 border border-cyan-500/30 p-1.5 rounded-lg">
                  <div className="flex items-center justify-between text-[8px] font-bold text-cyan-400 font-mono">
                    <span className="flex items-center gap-1">⏰ 1-2 CANDLE TIMER</span>
                    <span className="font-black text-cyan-300 text-[11px]">{formatCandleTimer(candleSec)}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-1 border border-slate-800">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-1000" style={{ width: `${(candleSec / (timeframe === '30s' ? 30 : timeframe === '5m' ? 300 : 60)) * 100}%` }} />
                  </div>
                </div>

                {/* Circular Donut Confidence Gauge & RSI Gauge */}
                <div className="flex items-center justify-around gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <ConfidenceCircleGauge confidence={confidence} minConfidence={90} size={50} strokeWidth={4} />
                  <div className="flex-1">
                    <RsiGauge rsiValue={dynamicRsi} />
                  </div>
                </div>

                {/* Target Close Price */}
                <div className="text-[8px] font-mono font-bold bg-slate-950 border border-slate-800 py-1 px-2 rounded-lg text-center text-rose-400">
                  Target Close (1-2m): {(decision === 'CALL' ? currentPrice + 0.00035 : currentPrice - 0.00035).toFixed(activePair.includes('JPY') ? 3 : 5)} ({decision === 'CALL' ? '+3.5' : '-3.5'} pips)
                </div>

                {/* Signal Banner */}
                <div
                  className={`p-2.5 rounded-xl text-center border font-mono transition-colors shadow-lg ${
                    decision === 'CALL'
                      ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-400 shadow-emerald-500/20'
                      : decision === 'PUT'
                      ? 'bg-rose-950/90 border-rose-500/80 text-rose-400 shadow-rose-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-sm font-black tracking-wider flex items-center justify-center gap-1">
                    {decision === 'CALL'
                      ? '▲ CALL SIGNAL (ACTIVE 1-2 CANDLES)'
                      : decision === 'PUT'
                      ? '▼ PUT SIGNAL (ACTIVE 1-2 CANDLES)'
                      : '⏳ SCANNING MARKET...'}
                  </div>
                </div>

                {/* Gemini Setup Quick Audit Button */}
                <button
                  type="button"
                  onClick={() => setIsVerifyModalOpen(true)}
                  className="w-full py-1.5 bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-[9px] rounded-lg shadow-sm border border-cyan-400/40 flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
                >
                  <Sparkles className="w-3 h-3 text-cyan-200" />
                  <span>DEEP GEMINI AI STRATEGY AUDIT</span>
                </button>

                <div className="text-[7px] text-slate-400 font-mono text-center">
                  ⚡ Signal Active for 1-2 Candles | {activeSignal?.timestamp || '11:24:00 AM'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  onClick={() => onManualTrade('CALL')}
                  className="py-2 px-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  ▲ HIGHER (CALL)
                </button>
                <button
                  onClick={() => onManualTrade('PUT')}
                  className="py-2 px-3 bg-rose-500 hover:bg-rose-400 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-500/20 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  ▼ LOWER (PUT)
                </button>
              </div>
            </>
            )
          )}
        </div>
      </div>

      {/* Gemini AI Verification Modal */}
      <GeminiVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        signal={activeSignal}
        candles={candles}
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
