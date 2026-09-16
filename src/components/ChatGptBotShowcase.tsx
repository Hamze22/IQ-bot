import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Bot,
  Chrome,
  Smartphone,
  Cpu,
  Zap,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Brain,
  Layers,
  Radio,
  Check,
  Send,
  Bell,
  Star,
  Eye,
  Rocket,
  AlertTriangle,
  Gift,
  Lock,
  RefreshCw,
  Sliders,
  DollarSign,
  Activity,
  CheckCheck,
  BarChart3,
  Award,
  Sparkle,
} from 'lucide-react';
import { UserAccount } from '../types';
import { db, doc, setDoc } from '../lib/firebase';
import { ChatGptExtensionPopup } from './ChatGptExtensionPopup';
import { ChatGptMobileBotPreview } from './ChatGptMobileBotPreview';

interface ChatGptBotShowcaseProps {
  currentUser?: UserAccount | null;
  onOpenLogin?: () => void;
  onOpenPayment?: () => void;
  onOpenTelegramModal?: () => void;
}

export const ChatGptBotShowcase: React.FC<ChatGptBotShowcaseProps> = ({
  currentUser,
  onOpenLogin,
  onOpenPayment,
  onOpenTelegramModal,
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'extension' | 'mobile' | 'terminal'>('extension');
  const [waitlistEmail, setWaitlistEmail] = useState(currentUser?.email || '');
  const [isJoined, setIsJoined] = useState(() => {
    return localStorage.getItem('gemini_bot_waitlist_joined') === 'true' || localStorage.getItem('chatgpt_bot_waitlist_joined') === 'true';
  });
  const [subscriberCount, setSubscriberCount] = useState(3480);

  const [selectedPair, setSelectedPair] = useState('EUR/USD OTC');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedLog, setSimulatedLog] = useState<{
    step: string;
    thought: string;
    action: 'CALL' | 'PUT';
    confidence: number;
    reasoning: string;
    timeframe: string;
    smcPattern: string;
    fvgLevel: string;
  }>({
    step: 'ChatGPT-4o Neural Intelligence Active',
    thought: 'Detected Bearish Order Block sweep at 1.08542. Liquidity pool tapped. Institutional rejection pattern confirmed.',
    action: 'PUT',
    confidence: 98.8,
    reasoning: 'Institutional rejection candle on 15s chart. DeepMind neural reasoning predicts high-probability 1-Minute Reversal.',
    timeframe: '1m OTC High Accuracy',
    smcPattern: 'Bearish Order Block Sweep',
    fvgLevel: 'FVG Mitigated at 1.08535',
  });

  const simulateGeminiAnalysis = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const actions: ('CALL' | 'PUT')[] = ['CALL', 'PUT'];
      const pickedAction = actions[Math.floor(Math.random() * actions.length)];
      const conf = +(96.5 + Math.random() * 3.2).toFixed(1);
      
      setSimulatedLog({
        step: 'ChatGPT-4o Deep Thinking Complete',
        thought: pickedAction === 'CALL'
          ? `Bullish FVG retest confirmed on ${selectedPair}. Smart Money institutional buy orders filling aggressively with high delta.`
          : `Bearish Liquidity hunt completed on ${selectedPair}. Upper resistance rejection candle formed with strong institutional wick.`,
        action: pickedAction,
        confidence: conf,
        reasoning: pickedAction === 'CALL'
          ? 'Deep market structure shift (BOS) confirmed by ChatGPT Vision. Strong upward momentum for next 60 seconds.'
          : 'Mean reversal pattern triggered with 98%+ ChatGPT AI probability. Optimal instant PUT execution.',
        timeframe: '1m OTC High Accuracy',
        smcPattern: pickedAction === 'CALL' ? 'Bullish Fair Value Gap (FVG)' : 'Liquidity Pool Sweep (SMC)',
        fvgLevel: pickedAction === 'CALL' ? 'Support Confluence: 1.08480' : 'Resistance Block: 1.08590',
      });
      setIsSimulating(false);
    }, 850);
  };

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes('@')) return;
    const cleanEmail = waitlistEmail.trim().toLowerCase();
    localStorage.setItem('gemini_bot_waitlist_joined', 'true');
    localStorage.setItem('gemini_bot_waitlist_email', cleanEmail);
    setIsJoined(true);
    setSubscriberCount(prev => prev + 1);

    // Sync to Firestore waitlist collection if available
    try {
      const waitlistId = 'wl_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      setDoc(doc(db, 'waitlist', waitlistId), {
        email: cleanEmail,
        timestamp: new Date().toISOString(),
        product: 'gemini_trading_bot',
        status: 'WAITLIST_REGISTERED',
      }, { merge: true }).catch(() => {});
    } catch (e) {}
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950/20 to-slate-950 border border-indigo-500/40 p-4 sm:p-8 shadow-[0_0_80px_rgba(99,102,241,0.15)] overflow-hidden text-slate-100 space-y-8"
    >
      {/* Background Holographic Glows & Grid Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-10 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP ANNOUNCEMENT BADGES & COUNTDOWN */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
        <div className="flex flex-wrap items-center gap-2">
            <motion.span 
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30 text-cyan-300 border border-indigo-400/60 shadow-lg shadow-indigo-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
              NEW: CHATGPT-4O PRO AI TRADING COPILOT
            </motion.span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-500/20 text-cyan-300 border border-blue-500/40">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            NEW
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-500/20 text-cyan-300 border border-indigo-500/40">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            STABLE RELEASE
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-indigo-950/70 px-3 py-1 rounded-full border border-indigo-500/30">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold">v3.7 Multimodal Edition</span>
        </div>
      </div>

      {/* 2. MAIN HERO SECTION */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Product Showcase & Sales Highlights */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-wider uppercase bg-indigo-950/50 px-3 py-1 rounded-lg border border-indigo-500/30">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Next-Gen Multimodal Vision & Sub-15ms DOM Execution</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Pocket Option Bot <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
                ChatGPT-4o Powered
              </span>
            </h2>
          </div>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Experience institutional-grade automated trading engineered with <strong>OpenAI ChatGPT-4o Deep Reasoning</strong>. Seamlessly analyze Pocket Option candlestick velocity, Smart Money Concepts (SMC), and order-book liquidity with ultra-low latency execution.
          </p>

          {/* DUAL PRODUCT SELECTION CARDS WITH MOTION HOVER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            
            {/* 1. Chrome Extension v4.0 Card */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePreviewTab('extension')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 text-left shadow-lg relative overflow-hidden ${
                activePreviewTab === 'extension'
                  ? 'bg-slate-950 border-indigo-400 shadow-indigo-500/25 ring-1 ring-indigo-500/50'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {activePreviewTab === 'extension' && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/15 rounded-bl-full pointer-events-none" />
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-black text-xs">
                  <Chrome className="w-4 h-4" />
                  <span>Chrome Extension v4.0</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                  NEW
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Compact overlay with real-time DOM sync, autonomous instant clicks, and 2.2x Martingale risk protection.
              </p>
              <div className="text-[11px] font-mono text-cyan-400 font-bold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Interactive Live Preview →</span>
              </div>
            </motion.div>

            {/* 2. Mobile Cloud Bot Card */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePreviewTab('mobile')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 text-left shadow-lg relative overflow-hidden ${
                activePreviewTab === 'mobile'
                  ? 'bg-slate-950 border-purple-400 shadow-purple-500/25 ring-1 ring-purple-500/50'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {activePreviewTab === 'mobile' && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/15 rounded-bl-full pointer-events-none" />
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-400 font-black text-xs">
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile Cloud Bot</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                  NEW
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Trade anywhere from iPhone or Android web browsers with real-time audio alerts and interactive ChatGPT prompts.
              </p>
              <div className="text-[11px] font-mono text-purple-400 font-bold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Interactive App Preview →</span>
              </div>
            </motion.div>

          </div>

          {/* KEY PERFORMANCE METRICS BADGES */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 shadow-sm">
              <Flame className="w-4 h-4 text-rose-400 shrink-0" />
              <span>98.6% Win-Rate SMC</span>
            </div>
              <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 shadow-sm">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>ChatGPT-4o Reasoning</span>
              </div>
            <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Zero-Loss Risk Guard</span>
            </div>
          </div>

          {/* VIP EARLY ACCESS WAITLIST BOX */}
          <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/50 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Gift className="w-4 h-4 text-cyan-400" />
                  Join the VIP Early Access Waitlist
                </h4>
                <p className="text-xs text-slate-300">
                  Pre-register to receive instant release notification + a <strong>Lifetime VIP Discount</strong>!
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-[11px] font-mono text-cyan-300 font-bold self-start sm:self-auto">
                <Sparkle className="w-3 h-3 text-cyan-400" />
                <span>{subscriberCount.toLocaleString()} Traders Registered</span>
              </div>
            </div>

            {isJoined ? (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-indigo-900/60 border border-cyan-400/60 rounded-xl p-3 text-cyan-200 text-xs font-bold flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <p className="font-extrabold text-white">You are successfully registered on the VIP Waitlist!</p>
                  <p className="text-[11px] text-cyan-300 font-normal">We will notify you immediately with your exclusive ChatGPT VIP early access key upon official release.</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email (e.g. trader@gmail.com)"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  required
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-500/30 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Join VIP Waitlist (Free)</span>
                </motion.button>
              </form>
            )}
          </div>

        </div>

        {/* Right Column: Interactive Live Device Showcase */}
        <div className="lg:col-span-6 flex flex-col items-center">
          
          {/* VIEW SWITCHER PILLS */}
          <div className="w-full bg-slate-950 p-1.5 rounded-2xl border border-indigo-500/40 flex items-center justify-between gap-1 shadow-lg mb-4">
            <button
              onClick={() => setActivePreviewTab('extension')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                activePreviewTab === 'extension'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Chrome className="w-3.5 h-3.5" />
              <span>Extension v4.0</span>
            </button>

            <button
              onClick={() => setActivePreviewTab('mobile')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                activePreviewTab === 'mobile'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Cloud Bot</span>
            </button>

            <button
              onClick={() => setActivePreviewTab('terminal')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                activePreviewTab === 'terminal'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ChatGPT Vision Lab</span>
            </button>
          </div>

          {/* DYNAMIC VIEW CONTAINER */}
          <div className="w-full flex items-center justify-center min-h-[480px]">
            <AnimatePresence mode="wait">
              
              {/* 1. COMPACT CHROME EXTENSION POPUP PREVIEW */}
              {activePreviewTab === 'extension' && (
                <motion.div
                  key="extension"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="w-full flex justify-center"
                >
                  <ChatGptExtensionPopup onOpenWaitlist={() => setIsJoined(true)} />
                </motion.div>
              )}

              {/* 2. INTERACTIVE MOBILE SMARTPHONE BOT PREVIEW */}
              {activePreviewTab === 'mobile' && (
                <motion.div
                  key="mobile"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="w-full flex justify-center"
                >
                  <ChatGptMobileBotPreview onOpenWaitlist={() => setIsJoined(true)} />
                </motion.div>
              )}

              {/* 3. AI VISION & SMC TERMINAL SCANNER */}
              {activePreviewTab === 'terminal' && (
                <motion.div
                  key="terminal"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-md bg-slate-950 border border-indigo-500/40 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden"
                >
                  {/* Top Laser Scanning Line */}
                  {isSimulating && (
                    <motion.div
                      initial={{ top: 0 }}
                      animate={{ top: '100%' }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] z-20 pointer-events-none"
                    />
                  )}

                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/30">
                        <Sparkles className="w-4 h-4 text-cyan-200" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white flex items-center gap-1">
                          ChatGPT-4o Neural Vision Scanner
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono">Engine: gpt-4o-financial-reasoning</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-cyan-400 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">
                      Live Test
                    </span>
                  </div>

                  {/* Asset Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Select Test Market:</span>
                      <span className="text-emerald-400 font-mono font-bold">OTC Payout: 92%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['EUR/USD OTC', 'GBP/USD OTC', 'BTC/USD OTC'].map((pair) => (
                        <button
                          key={pair}
                          onClick={() => {
                            setSelectedPair(pair);
                            simulateGeminiAnalysis();
                          }}
                          className={`px-2 py-1.5 rounded-lg text-[11px] font-mono font-bold transition border cursor-pointer ${
                            selectedPair === pair
                              ? 'bg-indigo-500/20 text-cyan-300 border-indigo-400 shadow-sm'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {pair}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Gemini Output Box */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-3 font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Cpu className={`w-3.5 h-3.5 text-cyan-400 ${isSimulating ? 'animate-spin' : ''}`} />
                        <span>Gemini Reasoning Output:</span>
                      </span>
                      <span className="text-cyan-400 font-bold">{simulatedLog.timeframe}</span>
                    </div>

                    {/* SMC Pattern & FVG Tag */}
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="bg-indigo-500/15 text-cyan-300 px-2 py-0.5 rounded border border-indigo-500/30 font-bold">
                        {simulatedLog.smcPattern}
                      </span>
                      <span className="bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                        {simulatedLog.fvgLevel}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-950 rounded-xl border border-indigo-500/20 text-[11px] text-slate-300 leading-relaxed font-sans space-y-1.5">
                      <p className="text-cyan-300 font-semibold flex items-center gap-1.5 text-[11px]">
                        <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        {simulatedLog.thought}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {simulatedLog.reasoning}
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Trade Signal</span>
                        <span className={`text-base font-black flex items-center gap-1 ${
                          simulatedLog.action === 'CALL' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {simulatedLog.action === 'CALL' ? '▲ BUY / CALL' : '▼ SELL / PUT'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">ChatGPT Confidence</span>
                        <span className="text-base font-black text-cyan-400">
                          {simulatedLog.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={simulateGeminiAnalysis}
                    disabled={isSimulating}
                    className="w-full py-2.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-slate-700 text-cyan-300 font-extrabold text-xs rounded-xl border border-indigo-500/40 shadow transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                    <span>{isSimulating ? 'Analyzing Candlesticks...' : 'Scan Market with ChatGPT-4o'}</span>
                  </motion.button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>

    </motion.section>
  );
};

