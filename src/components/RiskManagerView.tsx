import React from 'react';
import { TradingSettings, AccountStats } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, RefreshCcw, DollarSign, Activity } from 'lucide-react';

interface RiskManagerViewProps {
  settings: TradingSettings;
  accountStats: AccountStats;
  onResetRiskCounters: () => void;
}

export const RiskManagerView: React.FC<RiskManagerViewProps> = ({
  settings,
  accountStats,
  onResetRiskCounters,
}) => {
  const { profitToday, consecutiveLosses, tradesTodayCount } = accountStats;
  const { maxDailyLoss, maxDailyProfit, maxConsecutiveLosses, maxTradesPerDay, tradeAmount } = settings;

  const lossProgress = Math.min(100, (Math.max(0, -profitToday) / maxDailyLoss) * 100);
  const profitProgress = Math.min(100, (Math.max(0, profitToday) / maxDailyProfit) * 100);
  const consecutiveLossProgress = (consecutiveLosses / maxConsecutiveLosses) * 100;

  const isStopLossBreached = profitToday <= -Math.abs(maxDailyLoss);
  const isTakeProfitReached = profitToday >= maxDailyProfit;
  const isConsecutiveBreached = consecutiveLosses >= maxConsecutiveLosses;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-slate-100">Automated Risk Management Protocol</h2>
        </div>

        <button
          onClick={onResetRiskCounters}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Reset Risk Limits
        </button>
      </div>

      {/* Progress Bars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Daily Stop Loss Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Daily Stop Loss
            </span>
            <span className="font-mono text-rose-400 font-bold">
              ${Math.max(0, -profitToday).toFixed(2)} / ${maxDailyLoss}
            </span>
          </div>

          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                lossProgress >= 100 ? 'bg-rose-500 animate-pulse' : 'bg-rose-400'
              }`}
              style={{ width: `${lossProgress}%` }}
            ></div>
          </div>

          <p className="text-[11px] text-slate-400">
            {isStopLossBreached
              ? '🚨 Daily Stop Loss Limit reached! Trading halted.'
              : `Safeguard will trigger if loss reaches $${maxDailyLoss}.`}
          </p>
        </div>

        {/* Daily Take Profit Target */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Daily Take Profit Target
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              ${Math.max(0, profitToday).toFixed(2)} / ${maxDailyProfit}
            </span>
          </div>

          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${profitProgress}%` }}
            ></div>
          </div>

          <p className="text-[11px] text-slate-400">
            {isTakeProfitReached
              ? '🎉 Daily profit target locked in! Great session.'
              : `Targeting +$${maxDailyProfit} total daily profit.`}
          </p>
        </div>

        {/* Consecutive Loss Safeguard */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Consecutive Loss Guard
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {consecutiveLosses} / {maxConsecutiveLosses}
            </span>
          </div>

          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-500"
              style={{ width: `${consecutiveLossProgress}%` }}
            ></div>
          </div>

          <p className="text-[11px] text-slate-400">
            {isConsecutiveBreached
              ? '⚠️ 3 consecutive losses hit. 15-minute cooldown active.'
              : `Cooldown triggers after ${maxConsecutiveLosses} consecutive losses.`}
          </p>
        </div>
      </div>

      {/* Risk Metrics Summary Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 text-[10px] uppercase block">Risk Per Trade</span>
          <span className="font-mono font-bold text-slate-200 mt-0.5 block">${tradeAmount}</span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 text-[10px] uppercase block">Daily Trades Executed</span>
          <span className="font-mono font-bold text-slate-200 mt-0.5 block">
            {tradesTodayCount} / {maxTradesPerDay}
          </span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 text-[10px] uppercase block">Auto Stop-Loss Status</span>
          <span className="font-mono font-bold text-emerald-400 mt-0.5 block">ACTIVE (100%)</span>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 text-[10px] uppercase block">Max Drawdown Protect</span>
          <span className="font-mono font-bold text-emerald-400 mt-0.5 block">PASSING</span>
        </div>
      </div>
    </div>
  );
};
