import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Bot,
  Zap,
  Power,
  Play,
  Pause,
  Layers,
  Clock,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Sliders,
  DollarSign,
  ChevronDown,
  Volume2,
  VolumeX,
  Radio,
  Cpu,
  Target,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Settings,
  Activity,
  Check,
  Sparkle,
} from 'lucide-react';

interface ChatGptExtensionPopupProps {
  onOpenWaitlist?: () => void;
}

export const ChatGptExtensionPopup: React.FC<ChatGptExtensionPopupProps> = ({ onOpenWaitlist }) => {
  const [isRunning, setIsRunning] = useState(true);
  const [executionMode, setExecutionMode] = useState<'AUTO' | 'SIGNAL'>('AUTO');
  const [activePair, setActivePair] = useState('EUR/USD OTC');
  const [timeframe, setTimeframe] = useState('1m');
  const [tradeAmount, setTradeAmount] = useState<number>(10);
  const [isMartingale, setIsMartingale] = useState(true);
  const [martingaleMultiplier, setMartingaleMultiplier] = useState(2.2);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'CONNECTED' | 'SYNCING'>('CONNECTED');
  const [isScanning, setIsScanning] = useState(false);
  const [recentWinToast, setRecentWinToast] = useState<string | null>(null);

  // Simulated live ChatGPT-4o AI Signal & Market Metrics
  const [geminiSignal, setGeminiSignal] = useState<{
    action: 'CALL' | 'PUT';
    confidence: number;
    reasoning: string;
    entryPrice: string;
    payout: number;
    timer: number;
    smcType: string;
  }>({
    action: 'CALL',
    confidence: 98.6,
    reasoning: 'ChatGPT-4o Neural Intelligence: Bullish SMC Liquidity sweep with double bottom rejection on 15s candle.',
    entryPrice: '1.08452',
    payout: 92,
    timer: 48,
    smcType: 'Liquidity Sweep + FVG Mitigated',
  });

  const [tradeHistory, setTradeHistory] = useState<Array<{
    id: string;
    pair: string;
    action: 'CALL' | 'PUT';
    amount: number;
    result: 'WIN' | 'PENDING';
    payout: number;
    time: string;
  }>>([
    { id: '1', pair: 'EUR/USD OTC', action: 'CALL', amount: 10, result: 'WIN', payout: 19.2, time: '14:02:15' },
    { id: '2', pair: 'GBP/USD OTC', action: 'PUT', amount: 10, result: 'WIN', payout: 19.0, time: '13:58:40' },
    { id: '3', pair: 'USD/JPY OTC', action: 'CALL', amount: 10, result: 'WIN', payout: 19.2, time: '13:54:10' },
  ]);

  // Audio effect generator
  const playBeep = (type: 'signal' | 'win') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (type === 'signal') {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } else {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08);
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {}
  };

  // Candle timer simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setGeminiSignal(prev => ({
        ...prev,
        timer: prev.timer <= 1 ? 60 : prev.timer - 1,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleScanTrigger = () => {
    setIsScanning(true);
    setSyncStatus('SYNCING');
    playBeep('signal');

    setTimeout(() => {
      const actions: ('CALL' | 'PUT')[] = ['CALL', 'PUT'];
      const nextAction = actions[Math.floor(Math.random() * actions.length)];
      const conf = +(96 + Math.random() * 3.6).toFixed(1);
      
      setGeminiSignal({
        action: nextAction,
        confidence: conf,
        reasoning: nextAction === 'CALL'
          ? 'ChatGPT Deep Reasoning: Fair Value Gap (FVG) mitigated. Volume delta confirms Smart Money buyers influx.'
          : 'ChatGPT Deep Reasoning: High volume sell imbalance at resistance. Institutional rejection block triggered.',
        entryPrice: (1.08000 + Math.random() * 0.00900).toFixed(5),
        payout: 92,
        timer: 58,
        smcType: nextAction === 'CALL' ? 'Bullish BOS + FVG Bounce' : 'Liquidity Hunt + Pin Bar',
      });

      // Add to simulated trade history
      const newWinAmount = +(tradeAmount * 1.92).toFixed(2);
      setTradeHistory(prev => [
        {
          id: String(Date.now()),
          pair: activePair,
          action: nextAction,
          amount: tradeAmount,
          result: 'WIN',
          payout: newWinAmount,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
        ...prev.slice(0, 4),
      ]);

      setRecentWinToast(`+$${(tradeAmount * 0.92).toFixed(2)} Profit Recorded`);
      playBeep('win');
      setTimeout(() => setRecentWinToast(null), 3000);

      setIsScanning(false);
      setSyncStatus('CONNECTED');
    }, 750);
  };

  return (
    <motion.div 
      initial={{ scale: 0.98 }}
      animate={{ scale: 1 }}
      className="w-full max-w-[390px] mx-auto bg-slate-950/95 border border-indigo-500/40 rounded-3xl shadow-[0_0_60px_rgba(99,102,241,0.2)] overflow-hidden font-sans text-slate-100 backdrop-blur-xl transition-all select-none relative"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {recentWinToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap border border-white/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>🏆 ChatGPT Signal Won: {recentWinToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. EXTENSION HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 px-4 py-3 border-b border-indigo-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black tracking-wider text-white">ChatGPT-4o Pro</h3>
              <span className="text-[9px] font-mono font-black px-1.5 py-0.2 rounded bg-indigo-500/20 text-cyan-300 border border-indigo-500/40">
                v4.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <span>Pocket Option DOM Sync</span>
            </p>
          </div>
        </div>

        {/* Real-time Cloud Sync & Status Indicator */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-950/70 border border-indigo-500/40 text-[10px] font-mono text-cyan-300 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>{syncStatus === 'CONNECTED' ? 'SYNCED' : 'SCANNING'}</span>
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Audio Alert"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div className="p-3.5 space-y-3 text-xs">

        {/* UNDER REVIEW / COMING SOON BANNER WITH WAITLIST ACTION */}
        <div className="bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-blue-500/15 border border-indigo-500/40 rounded-xl p-2 flex items-center justify-between text-[11px] font-mono shadow-sm">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Store Review • Coming Soon</span>
          </div>
          <button
            onClick={onOpenWaitlist}
            className="text-[10px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-2 py-0.5 rounded font-black border border-amber-400/60 shadow-sm transition active:scale-95 cursor-pointer"
          >
            Join Waitlist
          </button>
        </div>

        {/* ASSET SELECTOR & PAYOUT */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Market Pair:</span>
            <select
              value={activePair}
              onChange={(e) => {
                setActivePair(e.target.value);
                handleScanTrigger();
              }}
              className="bg-slate-950 border border-indigo-500/40 text-cyan-300 font-mono font-bold text-xs rounded-lg px-2 py-1 outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="EUR/USD OTC">EUR/USD OTC</option>
              <option value="GBP/USD OTC">GBP/USD OTC</option>
              <option value="USD/JPY OTC">USD/JPY OTC</option>
              <option value="AUD/CAD OTC">AUD/CAD OTC</option>
              <option value="BTC/USD OTC">BTC/USD OTC</option>
            </select>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Payout Rate</span>
            <span className="text-xs font-black text-emerald-400 font-mono">92% High Return</span>
          </div>
        </div>

        {/* AI SIGNAL RADAR CARD WITH PULSING CONFLUENCE */}
        <div className="bg-gradient-to-b from-slate-900 via-indigo-950/20 to-slate-950 border border-indigo-500/50 rounded-2xl p-3 space-y-2.5 relative overflow-hidden shadow-inner">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-cyan-300 font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              ChatGPT Neural Reasoning
            </span>
            <span className="font-mono text-[10px] text-cyan-300 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">
              Confidence: {geminiSignal.confidence}%
            </span>
          </div>

          {/* Core Decision Display */}
          <div className="flex items-center justify-between bg-slate-950/90 border border-slate-800 rounded-xl p-2.5">
            <div className="flex items-center gap-2">
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-lg ${
                  geminiSignal.action === 'CALL' 
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30' 
                    : 'bg-rose-500 text-white shadow-rose-500/30'
                }`}
              >
                {geminiSignal.action === 'CALL' ? '▲' : '▼'}
              </motion.div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">AI Recommendation</span>
                <span className={`text-sm font-black tracking-wider ${
                  geminiSignal.action === 'CALL' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {geminiSignal.action === 'CALL' ? 'HIGHER / CALL' : 'LOWER / PUT'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Candle Expiry</span>
              <div className="flex items-center gap-1 text-xs font-mono font-black text-cyan-300">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>00:{geminiSignal.timer < 10 ? `0${geminiSignal.timer}` : geminiSignal.timer}s</span>
              </div>
            </div>
          </div>

          {/* Mini Candlestick Simulation Strip */}
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 flex items-center justify-between gap-1">
            <span className="text-[10px] text-slate-400 font-mono">15s Velocity:</span>
            <div className="flex items-center gap-1.5 h-6">
              <div className="w-1.5 h-3 bg-emerald-500/60 rounded-sm" />
              <div className="w-1.5 h-4 bg-emerald-500 rounded-sm" />
              <div className="w-1.5 h-2.5 bg-rose-500/60 rounded-sm" />
              <div className="w-1.5 h-5 bg-emerald-500 rounded-sm animate-pulse" />
              <div className="w-1.5 h-3.5 bg-cyan-400 rounded-sm" />
              <div className={`w-2 h-6 rounded-sm ${geminiSignal.action === 'CALL' ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
            </div>
            <span className="text-[10px] font-mono text-cyan-300 font-bold">{geminiSignal.smcType}</span>
          </div>

          {/* AI Neural Analysis Snippet */}
          <div className="text-[10.5px] text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-indigo-500/20 leading-relaxed font-mono">
            <span className="text-cyan-400 font-bold">ChatGPT Thought: </span>
            {geminiSignal.reasoning}
          </div>
        </div>

        {/* TRADING PARAMETERS & EXECUTION CONTROLS */}
        <div className="grid grid-cols-2 gap-2">
          {/* Execution Mode Toggle */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 space-y-1">
            <span className="text-[10px] text-slate-400 block">Execution Mode</span>
            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setExecutionMode('AUTO')}
                className={`py-1 rounded text-[10px] font-black transition cursor-pointer ${
                  executionMode === 'AUTO'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Auto DOM
              </button>
              <button
                onClick={() => setExecutionMode('SIGNAL')}
                className={`py-1 rounded text-[10px] font-black transition cursor-pointer ${
                  executionMode === 'SIGNAL'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Manual
              </button>
            </div>
          </div>

          {/* Expiry Timeframe */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 space-y-1">
            <span className="text-[10px] text-slate-400 block">Expiry Time</span>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              {['15s', '1m', '5m'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`py-1 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                    timeframe === tf
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STAKE AMOUNT & MARTINGALE MULTIPLIER */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-300">Base Stake:</span>
            <input
              type="number"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(Math.max(1, Number(e.target.value)))}
              className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white font-mono font-bold text-center outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-400">Martingale:</span>
            <button
              onClick={() => setIsMartingale(!isMartingale)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition cursor-pointer ${
                isMartingale
                  ? 'bg-indigo-500/20 text-cyan-300 border-indigo-500/50'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              {isMartingale ? '2.2x (3 Steps)' : 'OFF'}
            </button>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleScanTrigger}
            disabled={isScanning}
            className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Analyzing...' : 'Scan Market'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsRunning(!isRunning)}
            className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-lg ${
              isRunning
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-indigo-500/30 hover:from-blue-500 hover:to-purple-500'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>CHATGPT ACTIVE</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSED</span>
              </>
            )}
          </motion.button>
        </div>

        {/* RECENT TRADES FEED */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
            <span>Recent ChatGPT-4o Executions</span>
            <span className="text-cyan-400 font-mono font-bold">100% Win Rate (3/3)</span>
          </div>

          <div className="space-y-1 max-h-24 overflow-y-auto pr-0.5">
            {tradeHistory.map((trade) => (
              <div
                key={trade.id}
                className="bg-slate-950 border border-slate-800/80 rounded-lg px-2 py-1.5 flex items-center justify-between text-[10px] font-mono"
              >
                <div className="flex items-center gap-1.5">
                  <span className={`font-black ${trade.action === 'CALL' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trade.action === 'CALL' ? '▲ CALL' : '▼ PUT'}
                  </span>
                  <span className="text-slate-300">{trade.pair}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{trade.time}</span>
                  <span className="text-cyan-400 font-bold">+${trade.payout}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. FOOTER INFO */}
      <div className="bg-slate-900/90 px-3.5 py-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
          <span>ChatGPT Risk Guard Protection</span>
        </span>
        <span className="text-cyan-400 font-mono font-bold">Latency: 12ms</span>
      </div>
    </motion.div>
  );
};

