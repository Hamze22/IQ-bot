import React, { useState, useEffect } from 'react';
import { Candle, ExpiryTime } from '../types';
import { Activity, Layers, Clock, ShieldCheck, Lock } from 'lucide-react';
import { getRealtimeCandleSeconds, formatCandleTimer } from '../utils/candleTimer';

interface LiveChartProps {
  pair: string;
  candles: Candle[];
  currentPrice: number;
  timeframe: ExpiryTime;
  setTimeframe: (tf: ExpiryTime) => void;
  activeSignal: any;
}

export const LiveChart: React.FC<LiveChartProps> = ({
  pair,
  candles,
  currentPrice,
  timeframe,
  setTimeframe,
  activeSignal,
}) => {
  const [showIndicators, setShowIndicators] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [candleSec, setCandleSec] = useState<number>(() => getRealtimeCandleSeconds(timeframe));

  useEffect(() => {
    const timer = setInterval(() => {
      setCandleSec(getRealtimeCandleSeconds(timeframe));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeframe]);

  if (!candles || candles.length === 0) {
    return <div className="p-8 text-center text-slate-500">Initializing chart feeds...</div>;
  }

  // Calculate High / Low range for SVG canvas scale
  const prices = candles.flatMap((c) => [c.high, c.low, c.ema50 || c.close, c.ema200 || c.close]);
  const minPrice = Math.min(...prices) - 0.0002;
  const maxPrice = Math.max(...prices) + 0.0002;
  const priceRange = maxPrice - minPrice || 0.001;

  const height = 360;
  const width = 800;
  const candleWidth = Math.max(6, Math.floor((width - 60) / candles.length) - 3);

  const getY = (price: number) => {
    return height - 40 - ((price - minPrice) / priceRange) * (height - 80);
  };

  // Generate EMA polyline points
  const ema50Points = candles
    .map((c, i) => {
      const x = 30 + i * (candleWidth + 3) + candleWidth / 2;
      const y = getY(c.ema50 || c.close);
      return `${x},${y}`;
    })
    .join(' ');

  const ema200Points = candles
    .map((c, i) => {
      const x = 30 + i * (candleWidth + 3) + candleWidth / 2;
      const y = getY(c.ema200 || c.close);
      return `${x},${y}`;
    })
    .join(' ');

  const lastCandle = candles[candles.length - 1];
  const priceDiff = lastCandle.close - candles[0].close;
  const priceDiffPercent = ((priceDiff / candles[0].close) * 100).toFixed(3);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md relative overflow-hidden">
      {/* Chart Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-mono font-bold text-slate-100">{pair}</span>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                priceDiff >= 0
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {priceDiff >= 0 ? '+' : ''}
              {priceDiffPercent}%
            </span>
          </div>

          <div className="text-xl font-mono font-bold text-slate-100 pl-3 border-l border-slate-800">
            {currentPrice.toFixed(5)}
          </div>

          {/* Real-time synchronized Candle Expiry Timer Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded-lg text-xs font-mono font-bold text-cyan-300 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Candle Timer: {formatCandleTimer(candleSec)}</span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30 font-sans font-bold ml-1">
              ⚡ SIGNAL ACTIVE
            </span>
          </div>
        </div>

        {/* Timeframe & Toggles */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {(['30s', '1m', '5m'] as ExpiryTime[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  timeframe === tf ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowZones(!showZones)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
              showZones
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
            title="Toggle Order Blocks & Fair Value Gaps (FVG)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SMC Zones</span>
          </button>

          <button
            onClick={() => setShowIndicators(!showIndicators)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
              showIndicators
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
            title="Toggle EMA 50 / 200 Indicators"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">EMA 50/200</span>
          </button>
        </div>
      </div>

      {/* SVG Candlestick Chart Area */}
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[320px] select-none">
          <defs>
            <linearGradient id="demandZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="supplyZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="fvgGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => {
            const y = height * ratio;
            const priceVal = maxPrice - ratio * priceRange;
            return (
              <g key={idx}>
                <line x1="30" y1={y} x2={width - 40} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                <text x={width - 35} y={y + 3} fill="#64748b" fontSize="10" fontFamily="monospace">
                  {priceVal.toFixed(5)}
                </text>
              </g>
            );
          })}

          {/* SMC Order Blocks (Demand & Supply) */}
          {showZones && (
            <>
              {/* Demand Zone */}
              <rect
                x="30"
                y={getY(minPrice + priceRange * 0.25)}
                width={width - 70}
                height={28}
                fill="url(#demandZone)"
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="4 2"
                rx="4"
              />
              <text
                x="40"
                y={getY(minPrice + priceRange * 0.25) + 18}
                fill="#34d399"
                fontSize="10"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                1m Bullish Order Block (Demand Zone)
              </text>

              {/* Supply Zone */}
              <rect
                x="30"
                y={getY(maxPrice - priceRange * 0.25)}
                width={width - 70}
                height={28}
                fill="url(#supplyZone)"
                stroke="#f43f5e"
                strokeWidth="1"
                strokeDasharray="4 2"
                rx="4"
              />
              <text
                x="40"
                y={getY(maxPrice - priceRange * 0.25) + 18}
                fill="#fb7185"
                fontSize="10"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                1m Bearish Supply Zone
              </text>
            </>
          )}

          {/* EMAs */}
          {showIndicators && (
            <>
              <polyline points={ema200Points} fill="none" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.8" />
              <polyline points={ema50Points} fill="none" stroke="#38bdf8" strokeWidth="2" />
            </>
          )}

          {/* Render Candlesticks */}
          {candles.map((c, i) => {
            const x = 30 + i * (candleWidth + 3);
            const isGreen = c.close >= c.open;
            const bodyTop = getY(Math.max(c.open, c.close));
            const bodyBottom = getY(Math.min(c.open, c.close));
            const bodyHeight = Math.max(2, bodyBottom - bodyTop);
            const highY = getY(c.high);
            const lowY = getY(c.low);
            const centerX = x + candleWidth / 2;

            return (
              <g key={i} className="cursor-pointer hover:opacity-80">
                {/* Wick */}
                <line
                  x1={centerX}
                  y1={highY}
                  x2={centerX}
                  y2={lowY}
                  stroke={isGreen ? '#10b981' : '#f43f5e'}
                  strokeWidth="1.2"
                />
                {/* Body */}
                <rect
                  x={x}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isGreen ? '#10b981' : '#f43f5e'}
                  rx="1"
                />

                {/* BOS / CHOCH Annotations */}
                {c.bos && (
                  <g>
                    <line
                      x1={centerX - 10}
                      y1={highY - 8}
                      x2={centerX + 10}
                      y2={highY - 8}
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <text x={centerX - 12} y={highY - 12} fill="#38bdf8" fontSize="9" fontWeight="bold">
                      BOS
                    </text>
                  </g>
                )}

                {/* Volume bar at bottom */}
                <rect
                  x={x}
                  y={height - 20 - (c.volume / 100) * 15}
                  width={candleWidth}
                  height={(c.volume / 100) * 15}
                  fill={isGreen ? '#10b981' : '#f43f5e'}
                  opacity="0.3"
                />
              </g>
            );
          })}

          {/* Current Live Price Horizontal Line */}
          <line
            x1="30"
            y1={getY(currentPrice)}
            x2={width - 40}
            y2={getY(currentPrice)}
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <rect
            x={width - 40}
            y={getY(currentPrice) - 10}
            width="38"
            height="20"
            fill="#10b981"
            rx="4"
          />
          <text
            x={width - 38}
            y={getY(currentPrice) + 4}
            fill="#022c22"
            fontSize="9"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {currentPrice.toFixed(4)}
          </text>
        </svg>
      </div>

      {/* Legend & Active Indicators */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-sky-400"></span>
            EMA 50: <strong className="text-sky-400 font-mono">{lastCandle.ema50?.toFixed(5)}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-purple-400"></span>
            EMA 200: <strong className="text-purple-400 font-mono">{lastCandle.ema200?.toFixed(5)}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500"></span>
            Order Block (Demand)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">Session:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[11px]">
            London / New York Overlap (High Liquidity)
          </span>
        </div>
      </div>
    </div>
  );
};
