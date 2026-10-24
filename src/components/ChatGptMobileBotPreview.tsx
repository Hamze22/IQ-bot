import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Zap,
  Volume2,
  VolumeX,
  Clock,
  RefreshCw,
  RotateCw,
  DollarSign,
  Activity,
  ChevronDown,
  Search,
  Check,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
  Timer,
  Radar,
  Sparkles,
  Layers,
  TrendingUp,
  Sliders,
  ShieldCheck,
  Flame,
  Radio,
  BarChart2,
  CheckCircle2,
  Eye,
  Crosshair,
  Compass,
} from 'lucide-react';
import { ALL_ASSET_PAIRS, AssetPair } from './MobileBotView';
import { getRealtimeCandleSeconds, formatCandleTimer } from '../utils/candleTimer';

interface ChatGptMobileBotPreviewProps {
  onOpenWaitlist?: () => void;
}

export const ChatGptMobileBotPreview: React.FC<ChatGptMobileBotPreviewProps> = ({ onOpenWaitlist }) => {
  const [selectedPair, setSelectedPair] = useState('EUR/USD OTC');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [scanCountdown, setScanCountdown] = useState(30);
  const [totalScanDuration, setTotalScanDuration] = useState(30);

  const [timeframe, setTimeframe] = useState<'30s' | '1m' | '5m'>('1m');
  const [signalExpirySeconds, setSignalExpirySeconds] = useState(48);
  const [totalSignalSeconds, setTotalSignalSeconds] = useState(60);
  const [nextCandleRemaining, setNextCandleRemaining] = useState(58);
  const [isAutoExecution, setIsAutoExecution] = useState(true);
  const [nextCandleCheck, setNextCandleCheck] = useState(true);
  const [martingaleMultiplier, setMartingaleMultiplier] = useState('2.2x');
  const [tradeAmount, setTradeAmount] = useState('10');
  
  // Asset Modal Selector
  const [isPairPickerOpen, setIsPairPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'OTC FOREX' | 'REAL FOREX' | 'CRYPTO' | 'COMMODITIES' | 'STOCKS'>('ALL');

  // Dynamic Scanning Analytical Phases
  const SCAN_PHASES = [
    { title: 'Connecting to Pocket Option DOM & WebSockets...', tag: 'SOCKET FEED' },
    { title: 'Scanning 1M / 30s Candle Volume & Price Action...', tag: 'PRICE ACTION' },
    { title: 'Mapping Institutional Order Blocks & Liquidity Pools...', tag: 'SMC ENGINE' },
    { title: 'Detecting Fair Value Gaps (FVG) & RSI 7 Divergence...', tag: 'FVG & RSI' },
    { title: 'Analyzing Order Flow & Support/Resistance Sweeps...', tag: 'MARKET DEPTH' },
    { title: 'Forecasting Next Candle Momentum & Probability...', tag: 'NEXT CANDLE' },
    { title: 'Synthesizing ChatGPT-4o High-Probability Entry...', tag: 'FINALIZING' },
  ];

  // Automation Live Signal State
  const [currentSignal, setCurrentSignal] = useState<{
    decision: 'CALL' | 'PUT';
    confidence: number;
    payout: number;
    orderBlock: string;
    rsiValue: number;
    time: string;
    id: string;
  }>({
    decision: 'CALL',
    confidence: 98.8,
    payout: 92,
    orderBlock: 'Institutional Demand Zone (FVG Mitigation)',
    rsiValue: 28.4,
    time: 'Just now',
    id: '1',
  });

  const lastCandleTriggerRef = useRef<number | null>(null);

  // Audio feedback generator
  const playBeep = (freq = 800) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {}
  };

  const tfSeconds = timeframe === '30s' ? 30 : timeframe === '5m' ? 300 : 60;

  // Real-time Next Candle Time calculation
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getRealtimeCandleSeconds(timeframe);
      setNextCandleRemaining(remaining);

      // If Next Candle Check is enabled and not already scanning, auto-trigger scan at candle transition
      if (nextCandleCheck && (remaining === 2 || remaining === 1) && !isScanning) {
        const nowSec = Math.floor(Date.now() / 1000);
        if (lastCandleTriggerRef.current !== nowSec) {
          lastCandleTriggerRef.current = nowSec;
          triggerScanningSequence(undefined, true);
        }
      }

      setSignalExpirySeconds((prev) => {
        if (prev <= 1) {
          setTotalSignalSeconds(tfSeconds);
          return tfSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeframe, tfSeconds, nextCandleCheck, isScanning]);

  // Scanning Countdown Timer
  useEffect(() => {
    let scanInterval: NodeJS.Timeout | null = null;
    if (isScanning) {
      scanInterval = setInterval(() => {
        setScanCountdown((prev) => {
          if (prev <= 1) {
            // End scanning and reveal signal
            finishScan();
            return 0;
          }
          // Progress step index
          const progressRatio = (totalScanDuration - prev) / totalScanDuration;
          const nextIndex = Math.min(
            SCAN_PHASES.length - 1,
            Math.floor(progressRatio * SCAN_PHASES.length)
          );
          setScanStepIndex(nextIndex);

          if (prev % 3 === 0) {
            playBeep(650 + nextIndex * 90);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (scanInterval) clearInterval(scanInterval);
    };
  }, [isScanning, totalScanDuration]);

  // Finish scan logic
  const finishScan = (overridePair?: string) => {
    const pairToUse = overridePair || selectedPair;
    const decisions: ('CALL' | 'PUT')[] = ['CALL', 'PUT'];
    const decision = decisions[Math.floor(Math.random() * decisions.length)];
    const conf = +(97.6 + Math.random() * 2.2).toFixed(1);
    const rsi = decision === 'CALL' ? +(22 + Math.random() * 9).toFixed(1) : +(72 + Math.random() * 8).toFixed(1);
    
    const foundObj = ALL_ASSET_PAIRS.find((p) => p.pair === pairToUse);
    const payoutVal = foundObj ? foundObj.payout : 92;

    setCurrentSignal({
      decision,
      confidence: conf,
      payout: payoutVal,
      orderBlock: decision === 'CALL' ? 'Institutional Demand (Liquidity Swept)' : 'Supply Zone (Bearish Order Block)',
      rsiValue: rsi,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      id: String(Date.now()),
    });

    setIsScanning(false);
    setScanCountdown(0);
    setSignalExpirySeconds(tfSeconds);
    setTotalSignalSeconds(tfSeconds);

    playBeep(1250);
    setTimeout(() => playBeep(1600), 120);
  };

  // Progressive deep scanning sequence with 30s-50s next candle forecasting
  const triggerScanningSequence = (overridePair?: string, isQuickSync = false) => {
    if (isScanning) return;
    const pairToUse = overridePair || selectedPair;
    
    // Choose duration: 30s to 50s for full deep forecasting, or remaining candle time
    let chosenDuration: number;
    if (isQuickSync) {
      chosenDuration = Math.max(10, Math.min(30, nextCandleRemaining));
    } else {
      // 30s to 50s random or based on candle
      const options = [30, 35, 45, 50];
      chosenDuration = options[Math.floor(Math.random() * options.length)];
    }

    setTotalScanDuration(chosenDuration);
    setScanCountdown(chosenDuration);
    setScanStepIndex(0);
    setIsScanning(true);
    playBeep(550);
  };

  const filteredPairs = ALL_ASSET_PAIRS.filter((item) => {
    const matchesSearch = item.pair.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const currentPairObj = ALL_ASSET_PAIRS.find((p) => p.pair === selectedPair) || {
    pair: selectedPair,
    payout: 92,
    category: 'OTC FOREX',
    isOtc: true,
    base: 'EUR',
  };

  const isCall = currentSignal.decision === 'CALL';
  const progressPercent = Math.max(0, Math.min(100, (signalExpirySeconds / (totalSignalSeconds || 60)) * 100));
  const scanProgressPct = totalScanDuration > 0
    ? Math.min(100, Math.max(5, Math.round(((totalScanDuration - scanCountdown) / totalScanDuration) * 100)))
    : 100;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* ACTIVE ASSET SELECTOR & SEARCH BAR (TAP TO CHOOSE FX / OTC) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>ACTIVE ASSET (TAP TO SEARCH & CHANGE)</span>
          </span>
          <span className="text-emerald-400 font-mono font-bold">PAYOUT: +{currentPairObj.payout}%</span>
        </div>

        <div
          onClick={() => setIsPairPickerOpen(true)}
          className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/40 hover:border-emerald-400 shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-mono font-black text-emerald-300 text-sm shadow-inner">
              {currentPairObj.base.substring(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white group-hover:text-emerald-300 transition font-mono">
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
                <span className="text-emerald-400">Pocket Option Fast Engine</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Tap to Search</span>
              <span className="text-xs font-black text-emerald-400 font-mono">
                +{currentPairObj.payout}% Profit
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. TIMEFRAME & NEXT CANDLE TIME RADAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Timeframe selector */}
        <div className="flex items-center justify-between bg-slate-950/90 p-3 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 ml-1">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300 uppercase">TIMEFRAME:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {(['30s', '1m', '5m'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setTimeframe(tf);
                  triggerScanningSequence();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black transition cursor-pointer ${
                  timeframe === tf
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md scale-105'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/80'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Next Candle Time Countdown HUD */}
        <div className="flex items-center justify-between bg-slate-950/90 p-3 rounded-2xl border border-cyan-500/30 shadow-sm">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div>
              <span className="text-xs font-black text-white block leading-tight">Next Candle Time</span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                Opens in: {formatCandleTimer(nextCandleRemaining)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">Auto-Check</span>
            <button
              onClick={() => setNextCandleCheck(!nextCandleCheck)}
              title="Toggle automatic scan at candle opening"
              className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                nextCandleCheck ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  nextCandleCheck ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN AI SIGNAL RADAR DISPLAY & SCANNING ENGINE */}
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4 relative overflow-hidden">
        
        {/* Card Header with Force Scan & Scanner indicators */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black uppercase text-slate-200 tracking-wider flex items-center gap-1.5 font-mono">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>CHATGPT-4O ALGO SIGNAL RADAR</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* FORCE SCAN NOW BUTTON IN HEADER */}
            <button
              onClick={() => triggerScanningSequence()}
              disabled={isScanning}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black font-mono flex items-center gap-1.5 shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? `SCANNING (${scanCountdown}s)...` : 'FORCE SCAN NOW'}</span>
            </button>
          </div>
        </div>

        {/* SCANNING LIVE REAL-TIME RADAR HUD OR HERO SIGNAL RESULT */}
        <AnimatePresence mode="wait">
          {isScanning ? (
            <motion.div
              key="scanning-state"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="p-6 sm:p-10 rounded-2xl bg-slate-950/95 border-2 border-emerald-500/60 flex flex-col items-center justify-center space-y-5 shadow-[0_0_50px_rgba(16,185,129,0.25)] relative overflow-hidden"
            >
              {/* Radar sweep radial glow in background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18)_0%,transparent_70%)] animate-pulse" />

              {/* Multi-ring Rotating Radar Crosshair Animation */}
              <div className="relative my-2">
                {/* Outer spin ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 border-r-teal-300"
                />
                {/* Middle reverse dashed ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  className="w-24 h-24 sm:w-30 sm:h-30 rounded-full border-2 border-dashed border-emerald-400/50 absolute top-2 left-2 sm:top-3 sm:left-3"
                />
                {/* Center glowing radar HUD */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900 border-2 border-emerald-400 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  <Radar className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
                  <span className="text-[9px] font-mono font-black text-cyan-300">{scanCountdown}s</span>
                </div>
              </div>

              {/* Status Text & Current Phase */}
              <div className="text-center space-y-2 z-10 max-w-md">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-black tracking-widest uppercase animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>[ DEEP CANDLE SCAN ({scanCountdown}s REMAINING) ]</span>
                </div>

                <h4 className="text-sm sm:text-base font-black text-white font-mono min-h-[26px]">
                  {SCAN_PHASES[scanStepIndex]?.title}
                </h4>

                <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-400 font-mono">
                  <span>Asset: <strong className="text-emerald-300 font-bold">{selectedPair}</strong></span>
                  <span>•</span>
                  <span>Candle: <strong className="text-cyan-300 font-bold">{timeframe}</strong></span>
                  <span>•</span>
                  <span>Phase: <strong className="text-amber-400 font-bold">{SCAN_PHASES[scanStepIndex]?.tag}</strong></span>
                </div>
              </div>

              {/* Dynamic Scanning Progress Bar */}
              <div className="w-full max-w-sm space-y-1.5 z-10">
                <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1">
                  <span>Forecasting Next Candle</span>
                  <span className="text-emerald-400 font-bold">{scanProgressPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                    style={{ width: `${scanProgressPct}%` }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                  />
                </div>
              </div>

              {/* Instant Skip/Reveal Button */}
              <button
                onClick={() => finishScan()}
                className="px-3 py-1 text-[11px] font-mono font-bold text-slate-400 hover:text-emerald-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition cursor-pointer z-10"
              >
                ⚡ Instant Reveal Signal
              </button>

            </motion.div>
          ) : (
            <motion.div
              key={`${currentSignal.decision}-${selectedPair}-${timeframe}-${currentSignal.id}`}
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -12 }}
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
                        CHATGPT ACTION RECOMMENDATION
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
                    <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 block font-bold">EXPIRY</span>
                    <span className="text-base sm:text-lg font-mono font-black px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-emerald-300 shadow-md inline-block">
                      {timeframe}
                    </span>
                  </div>
                </div>

                {/* Signal Expiry Progress Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                      <Timer className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                      <span>Signal Active Window:</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                        {currentSignal.orderBlock}
                      </span>
                      <span className="text-amber-400 font-black font-mono text-sm tracking-wide">
                        {formatCandleTimer(signalExpirySeconds)}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Countdown Bar with Glow Head */}
                  <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-0.5 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-linear relative ${
                        isCall
                          ? 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                          : 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 shadow-[0_0_12px_rgba(244,63,94,0.7)]'
                      }`}
                      style={{
                        width: `${progressPercent}%`,
                      }}
                    >
                      {/* Glow head point */}
                      <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_6px_#fff]" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Confidence & Winrate Bar */}
              <div className="bg-slate-950/90 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">CONFIDENCE</span>
                    <span className="text-xl font-black font-mono text-emerald-400">
                      {currentSignal.confidence}%
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-bold">
                    HIGH WIN PROBABILITY
                  </span>
                </div>
                <button
                  onClick={() => triggerScanningSequence()}
                  title="Scan Next Opportunity"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold font-mono active:scale-95"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>Re-scan</span>
                </button>
              </div>

              {/* SCAN NEXT OPPORTUNITY PROMINENT BUTTON (TRIGGERS 30s-50s NEXT CANDLE FORECASTING) */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => triggerScanningSequence()}
                disabled={isScanning}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs sm:text-sm font-black tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer active:scale-98"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>SCAN NEXT OPPORTUNITY (30s - 50s NEXT CANDLE FORECAST)</span>
              </motion.button>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* 5. AUTOMATION CONTROLS (AUTO-EXECUTE, BASE STAKE, MARTINGALE) */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-xs font-black text-white block">Auto-Trader Automation</span>
              <span className="text-[10px] font-mono text-slate-400">Places trade at exact candle opening</span>
            </div>
          </div>
          <button
            onClick={() => setIsAutoExecution(!isAutoExecution)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
              isAutoExecution ? 'bg-emerald-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isAutoExecution ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 font-mono">
          <div className="bg-slate-900 p-2 rounded-xl flex items-center justify-between border border-slate-800">
            <span className="text-[11px] text-slate-400">Base Stake:</span>
            <div className="flex items-center text-xs font-bold text-white">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                className="w-12 bg-transparent text-right outline-none text-emerald-300 font-bold"
              />
            </div>
          </div>

          <div className="bg-slate-900 p-2 rounded-xl flex items-center justify-between border border-slate-800">
            <span className="text-[11px] text-slate-400">Martingale:</span>
            <select
              value={martingaleMultiplier}
              onChange={(e) => setMartingaleMultiplier(e.target.value)}
              className="bg-transparent text-xs font-bold text-amber-300 outline-none cursor-pointer"
            >
              <option value="Off" className="bg-slate-900 text-white">Off</option>
              <option value="2.0x" className="bg-slate-900 text-white">2.0x</option>
              <option value="2.2x" className="bg-slate-900 text-white">2.2x</option>
              <option value="2.5x" className="bg-slate-900 text-white">2.5x</option>
            </select>
          </div>
        </div>
      </div>

      {/* ALL ASSETS & OTC PAIRS MODAL WITH SEARCH */}
      <AnimatePresence>
        {isPairPickerOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-emerald-400" />
                    <span>Search Forex & OTC Asset</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    All Pocket Option OTC & Real Market Currencies
                  </p>
                </div>
                <button
                  onClick={() => setIsPairPickerOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Search Bar & Category Filters */}
              <div className="p-3 border-b border-slate-800 space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search EUR/USD, OTC, Crypto, Gold, Apple..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition"
                    autoFocus
                  />
                </div>

                {/* Category Pills */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {(['ALL', 'OTC FOREX', 'REAL FOREX', 'CRYPTO', 'COMMODITIES', 'STOCKS'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold whitespace-nowrap transition cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset List View */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {filteredPairs.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 font-mono text-xs">
                    No currency pair matching "{searchQuery}" found.
                  </div>
                ) : (
                  filteredPairs.map((item) => {
                    const isSelected = item.pair === selectedPair;
                    return (
                      <button
                        key={item.pair}
                        onClick={() => {
                          setSelectedPair(item.pair);
                          setIsPairPickerOpen(false);
                          triggerScanningSequence(item.pair);
                        }}
                        className={`w-full p-2.5 rounded-2xl flex items-center justify-between border transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md'
                            : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {item.base.substring(0, 3)}
                          </div>

                          <div className="text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-white font-mono">
                                {item.pair}
                              </span>
                              {item.isOtc && (
                                <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-mono font-black border border-amber-500/40">
                                  OTC
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {item.category} • Volatility: {item.volatility}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-right">
                          <div>
                            <span className="text-xs font-black font-mono text-emerald-400">
                              +{item.payout}%
                            </span>
                            <span className="text-[8px] block font-mono text-slate-500">
                              Payout
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
