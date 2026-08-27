import React from 'react';
import { TradingSettings, BotStatus, ExecutionMode } from '../types';
import { Play, Square, Pause, AlertOctagon, Sliders, DollarSign, Shield, Zap } from 'lucide-react';

interface TradingControlsProps {
  botStatus: BotStatus;
  setBotStatus: (s: BotStatus) => void;
  settings: TradingSettings;
  setSettings: React.Dispatch<React.SetStateAction<TradingSettings>>;
  onManualTrade: (type: 'CALL' | 'PUT') => void;
}

export const TradingControls: React.FC<TradingControlsProps> = ({
  botStatus,
  setBotStatus,
  settings,
  setSettings,
  onManualTrade,
}) => {
  const quickAmounts = [5, 10, 25, 50, 100];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Top Title & Bot Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-slate-100">Bot Controls & Trading Parameters</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBotStatus('RUNNING')}
            disabled={botStatus === 'RUNNING'}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start Bot
          </button>

          <button
            onClick={() => setBotStatus('PAUSED')}
            disabled={botStatus === 'STOPPED'}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-semibold text-xs rounded-xl transition"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause
          </button>

          <button
            onClick={() => setBotStatus('STOPPED')}
            disabled={botStatus === 'STOPPED'}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-400 font-semibold text-xs rounded-xl transition"
          >
            <Square className="w-3.5 h-3.5" />
            Stop
          </button>

          <button
            onClick={() => setBotStatus('EMERGENCY_STOPPED')}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Emergency Stop
          </button>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Trade Amount */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
            <span>Trade Amount ($)</span>
            <span className="text-[10px] text-slate-500 font-mono">Per Position</span>
          </label>
          <input
            type="number"
            value={settings.tradeAmount}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, tradeAmount: Number(e.target.value) || 10 }))
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-100 focus:border-emerald-500 focus:outline-none"
          />
          <div className="flex gap-1.5 mt-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setSettings((prev) => ({ ...prev, tradeAmount: amt }))}
                className={`px-2 py-1 text-[10px] font-mono rounded font-semibold transition ${
                  settings.tradeAmount === amt
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        {/* Expiry Time */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Expiry Duration
          </label>
          <div className="grid grid-cols-3 gap-1.5 mt-1">
            {(['30s', '1m', '5m'] as const).map((exp) => (
              <button
                key={exp}
                onClick={() => setSettings((prev) => ({ ...prev, expiryTime: exp }))}
                className={`py-2 text-xs font-mono font-bold rounded-lg border transition ${
                  settings.expiryTime === exp
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {exp}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block">
            Current Payout: <strong className="text-emerald-400">{settings.payoutRate}%</strong>
          </span>
        </div>

        {/* Max Daily Loss & Profit */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
            <span>Daily Profit / Loss Limits</span>
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Max Loss ($)</span>
              <input
                type="number"
                value={settings.maxDailyLoss}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, maxDailyLoss: Number(e.target.value) || 50 }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-slate-100 focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Max Profit ($)</span>
              <input
                type="number"
                value={settings.maxDailyProfit}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, maxDailyProfit: Number(e.target.value) || 200 }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Safeguards & Auto Restart */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Safeguards & Auto Restart
          </label>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Max Consecutive Loss</span>
              <input
                type="number"
                value={settings.maxConsecutiveLosses}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    maxConsecutiveLosses: Number(e.target.value) || 3,
                  }))
                }
                className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-xs font-mono text-center text-slate-100"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Auto Restart Bot</span>
              <input
                type="checkbox"
                checked={settings.autoRestart}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, autoRestart: e.target.checked }))
                }
                className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Manual Immediate Order Test Trigger */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Manual Order Simulation: Test execution with current strategy parameter configuration.
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onManualTrade('CALL')}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
          >
            EXECUTE CALL ▲
          </button>
          <button
            onClick={() => onManualTrade('PUT')}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-500/20 transition flex items-center gap-2"
          >
            EXECUTE PUT ▼
          </button>
        </div>
      </div>
    </div>
  );
};
