import React from 'react';

interface RsiGaugeProps {
  rsiValue?: number;
}

export const RsiGauge: React.FC<RsiGaugeProps> = ({ rsiValue = 31.4 }) => {
  const isOverbought = rsiValue >= 70;
  const isOversold = rsiValue <= 30;
  const isBullish = rsiValue >= 50;

  const colorClass = isOverbought
    ? 'text-rose-400'
    : isOversold
    ? 'text-emerald-400'
    : isBullish
    ? 'text-cyan-400'
    : 'text-amber-400';

  const barBgClass = isOverbought
    ? 'bg-rose-500'
    : isOversold
    ? 'bg-emerald-400'
    : isBullish
    ? 'bg-cyan-400'
    : 'bg-amber-400';

  const statusLabel = isOverbought
    ? 'Overbought (>70) Reversal Setup'
    : isOversold
    ? 'Oversold (<30) Reversal Setup'
    : isBullish
    ? 'Bullish Momentum (>50)'
    : 'Bearish Momentum (<50)';

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg space-y-1 font-mono">
      {/* Top Row: RSI (7) & Value */}
      <div className="flex items-center justify-between text-[9px]">
        <span className="text-slate-400 font-bold">RSI (7) Reversal</span>
        <span className={`font-black text-[10px] ${colorClass}`}>{rsiValue.toFixed(1)}</span>
      </div>

      {/* Middle Row: Progress Bar */}
      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barBgClass}`}
          style={{ width: `${Math.min(100, Math.max(0, rsiValue))}%` }}
        />
      </div>

      {/* Bottom Row: Status Label */}
      <div className={`text-[8px] font-bold ${colorClass}`}>
        {statusLabel}
      </div>
    </div>
  );
};

