import React, { useState } from 'react';
import {
  BotStatus,
  ExecutionMode,
  ExpiryTime,
  Candle,
  TradingSettings,
  Signal,
  Trade,
} from '../types';
import { LiveChart } from './LiveChart';
import {
  LayoutDashboard,
  Zap,
  History,
  BarChart2,
  ShieldCheck,
  Settings as SettingsIcon,
  Activity,
  Bell,
  HelpCircle,
  Play,
  Square,
  CheckCircle2,
  Lock,
  ChevronDown,
  User,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GeminiVerificationModal } from './GeminiVerificationModal';

interface FullDashboardViewProps {
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
  setActivePair: (p: string) => void;
  candles: Candle[];
  currentPrice: number;
  timeframe: ExpiryTime;
  setTimeframe: (t: ExpiryTime) => void;
  activeSignal: Signal | null;
  settings: TradingSettings;
  setSettings: React.Dispatch<React.SetStateAction<TradingSettings>>;
  trades: Trade[];
  onOpenSettingsModal?: () => void;
  onManualTrade?: (type: 'CALL' | 'PUT') => void;
}

export const FullDashboardView: React.FC<FullDashboardViewProps> = ({
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
  setActivePair,
  candles,
  currentPrice,
  timeframe,
  setTimeframe,
  activeSignal,
  settings,
  setSettings,
  trades,
  onOpenSettingsModal,
  onManualTrade,
}) => {
  const [activeSidebarNav, setActiveSidebarNav] = useState<string>('Dashboard');
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);

  // Chart data for performance overview
  let accum = 0;
  const perfData = [
    { day: 'Mon', profit: 40 },
    { day: 'Tue', profit: 85 },
    { day: 'Wed', profit: 60 },
    { day: 'Thu', profit: 120 },
    { day: 'Fri', profit: 110 },
    { day: 'Sat', profit: 145 },
    { day: 'Sun', profit: profitToday + 150 },
  ];

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row text-slate-100 font-sans min-h-[780px]">
      
      {/* 1. Left Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-slate-900/95 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-blue-500/30">
              PO
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-wide text-slate-100 flex items-center gap-1.5">
                POCKET OPTION
                <span className="text-[9px] bg-blue-500/20 text-blue-400 font-mono px-1.5 py-0.5 rounded border border-blue-500/30 font-bold">
                  AI BOT
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">v1.0.0 Pro Suite</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {[
              { name: 'Dashboard', icon: LayoutDashboard },
              { name: 'Signals', icon: Zap },
              { name: 'Trade History', icon: History },
              { name: 'Analytics', icon: BarChart2 },
              { name: 'Risk Manager', icon: ShieldCheck },
              { name: 'Settings', icon: SettingsIcon },
              { name: 'Backtesting', icon: Activity },
              { name: 'Alerts', icon: Bell },
              { name: 'Help & Support', icon: HelpCircle },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSidebarNav === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveSidebarNav(item.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2 px-2 text-[11px] font-mono text-slate-500">
          <div>
            <span className="block text-slate-400 text-[10px]">SERVER TIME</span>
            <span className="text-slate-300 font-bold">
              {new Date().toLocaleTimeString()} UTC
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span>VERSION 1.0.0</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Dashboard Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-slate-900/80 border-b border-slate-800 px-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-slate-200 lg:hidden">
              ☰
            </button>
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-400"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>AUTOTRADE PRO</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>PO Web Active (Auto-Sync)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Bot Control Buttons */}
            <button
              onClick={() => setBotStatus('RUNNING')}
              disabled={botStatus === 'RUNNING'}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              START BOT
            </button>

            <button
              onClick={() => setBotStatus('STOPPED')}
              disabled={botStatus === 'STOPPED'}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 disabled:opacity-50 text-rose-400 font-extrabold text-xs rounded-xl transition"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              STOP BOT
            </button>

            <div className="w-px h-6 bg-slate-800 mx-1"></div>

            {/* Notification & User Profile */}
            <button className="relative p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:text-white transition">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                3
              </span>
            </button>

            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Top Metrics Cards Row */}
        <section className="p-5 border-b border-slate-800/80 bg-slate-900/40 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
              Balance
            </span>
            <span className="text-lg font-mono font-black text-slate-100">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
              Profit Today
            </span>
            <span className={`text-lg font-mono font-black ${profitToday >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {profitToday >= 0 ? '+' : ''}${profitToday.toFixed(2)}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
              Win Rate
            </span>
            <span className="text-lg font-mono font-black text-emerald-400">{winRate}%</span>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
              Total Wins
            </span>
            <span className="text-lg font-mono font-black text-emerald-400">{totalWins}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
              Total Losses
            </span>
            <span className="text-lg font-mono font-black text-rose-400">{totalLosses}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
              Total Trades
            </span>
            <span className="text-lg font-mono font-black text-blue-400">{totalTrades}</span>
          </div>
        </section>

        {/* Main Content Workspace Grid (3 columns) */}
        <div className="p-5 space-y-5">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Column 1: Live Chart Component (Cols 1-6) */}
            <div className="lg:col-span-6 space-y-5">
              <LiveChart
                pair={activePair}
                candles={candles}
                currentPrice={currentPrice}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                activeSignal={activeSignal}
              />

              {/* Performance & Win/Loss Breakdown below chart */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Performance Overview Area Chart */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">PERFORMANCE OVERVIEW</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      This Week v
                    </span>
                  </div>
                  <div className="h-32 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={perfData}>
                        <defs>
                          <linearGradient id="dashboardAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" stroke="#64748b" fontSize={9} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#1e293b',
                            fontSize: '11px',
                            borderRadius: '8px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="profit"
                          stroke="#10b981"
                          strokeWidth={2}
                          fill="url(#dashboardAreaGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Win / Loss Ratio Badge */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">WIN / LOSS RATIO</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{winRate}%</span>
                  </div>

                  <div className="flex items-center justify-center py-2">
                    <div className="w-20 h-20 rounded-full border-4 border-emerald-500 border-t-rose-500 flex flex-col items-center justify-center font-mono">
                      <span className="text-sm font-black text-emerald-400">{winRate}%</span>
                      <span className="text-[9px] text-slate-400">WIN RATE</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-around text-[11px] font-mono border-t border-slate-800/80 pt-2">
                    <span className="text-emerald-400 font-bold">● Wins: {totalWins} ({winRate}%)</span>
                    <span className="text-rose-400 font-bold">● Losses: {totalLosses} ({100 - winRate}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: AI Signal Panel (Cols 7-9) */}
            <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    AI SIGNAL
                  </span>
                  <button
                    onClick={() => setIsVerifyModalOpen(true)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 hover:bg-cyan-500/30 transition cursor-pointer"
                    title="Audit this setup with Gemini AI"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    Gemini Audit
                  </button>
                </div>

                {/* Decision Header */}
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 space-y-1 text-center">
                  <div className="text-2xl font-black text-emerald-400 tracking-wider">
                    ▲ CALL
                  </div>
                  <div className="text-xs font-mono text-emerald-300 font-bold">
                    CONFIDENCE {activeSignal ? activeSignal.confidence : 92}%
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">PAIR:</span>
                    <span className="text-slate-100 font-bold">{activePair}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">EXPIRY:</span>
                    <span className="text-slate-100 font-bold">{settings.expiryTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">TREND:</span>
                    <span className="text-emerald-400 font-bold">BULLISH ↗</span>
                  </div>
                </div>

                {/* Reason Checklist */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    REASON FOR SIGNAL
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {[
                      'Bullish Order Block Retest',
                      'Break of Structure (BOS)',
                      'Fair Value Gap (FVG) Support',
                      'EMA 50 > EMA 200 Cross',
                      'Strong Bullish Momentum Wave',
                      'London Session Active Volume',
                    ].map((reasonItem, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{reasonItem}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manual Signal Buttons */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    One-Click Manual Execution
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onManualTrade && onManualTrade('CALL')}
                      className="py-2 px-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1"
                    >
                      MANUAL CALL ▲
                    </button>
                    <button
                      onClick={() => onManualTrade && onManualTrade('PUT')}
                      className="py-2 px-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-500/20 transition flex items-center justify-center gap-1"
                    >
                      MANUAL PUT ▼
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">RISK LEVEL:</span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  LOW
                </span>
              </div>
            </div>

            {/* Column 3: Trading Settings Panel (Cols 10-12) */}
            <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <SettingsIcon className="w-4 h-4 text-blue-400" />
                    TRADING SETTINGS
                  </span>
                  <span className="text-slate-400 text-xs">⚙</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Trade Amount ($)</label>
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono">
                      <button
                        onClick={() =>
                          setSettings((p) => ({ ...p, tradeAmount: Math.max(1, p.tradeAmount - 5) }))
                        }
                        className="px-3 py-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={settings.tradeAmount}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, tradeAmount: Number(e.target.value) || 10 }))
                        }
                        className="w-full bg-transparent text-center font-bold text-slate-100 focus:outline-none"
                      />
                      <button
                        onClick={() => setSettings((p) => ({ ...p, tradeAmount: p.tradeAmount + 5 }))}
                        className="px-3 py-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Expiry Time</label>
                    <select
                      value={settings.expiryTime}
                      onChange={(e) =>
                        setSettings((p) => ({ ...p, expiryTime: e.target.value as ExpiryTime }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 font-mono text-xs focus:outline-none"
                    >
                      <option value="30s">30 Seconds</option>
                      <option value="1m">1 Minute</option>
                      <option value="5m">5 Minutes</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Max Daily Loss ($)</label>
                      <input
                        type="number"
                        value={settings.maxDailyLoss}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, maxDailyLoss: Number(e.target.value) || 100 }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-slate-100 font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Max Daily Profit ($)</label>
                      <input
                        type="number"
                        value={settings.maxDailyProfit}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, maxDailyProfit: Number(e.target.value) || 300 }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-slate-100 font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Toggle Switches */}
                  <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Auto Restart</span>
                      <input
                        type="checkbox"
                        checked={settings.autoRestart}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, autoRestart: e.target.checked }))
                        }
                        className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Trade on Trend Only</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Skip High Impact News</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Only London & NY Sessions</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Automated Trading Indicator */}
              <div className="pt-2">
                <div className="w-full py-2 rounded-xl text-xs font-bold font-mono text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>AUTOMATED TRADING ENGINE ACTIVE</span>
                </div>
              </div>
            </div>

          </div>

          {/* Recent Trades Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                RECENT EXECUTED TRADES
              </span>
              <span className="text-xs font-mono text-blue-400 hover:underline cursor-pointer flex items-center gap-1">
                View All Trades <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                    <th className="pb-2 font-semibold">Time</th>
                    <th className="pb-2 font-semibold">Pair</th>
                    <th className="pb-2 font-semibold">Type</th>
                    <th className="pb-2 font-semibold">Expiry</th>
                    <th className="pb-2 font-semibold">Result</th>
                    <th className="pb-2 font-semibold text-right">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {trades.slice(0, 5).map((t, idx) => (
                    <tr key={`${t.id}-${idx}`} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 text-slate-400">{t.timestamp}</td>
                      <td className="py-2 font-bold text-slate-200">{t.pair}</td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            t.type === 'CALL'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="py-2 text-slate-400">{t.expiryTime}</td>
                      <td className="py-2">
                        <span
                          className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                            t.outcome === 'WIN'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {t.outcome}
                        </span>
                      </td>
                      <td
                        className={`py-2 font-bold text-right ${
                          t.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.profit >= 0 ? '+' : ''}${t.profit.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

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
