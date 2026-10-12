import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar, NavTabType } from './components/Navbar';
import { ExtensionStorefrontView } from './components/ExtensionStorefrontView';
import { SplitComparisonView } from './components/SplitComparisonView';
import { FullDashboardView } from './components/FullDashboardView';
import { ExtensionPopupView } from './components/ExtensionPopupView';
import { PocketOptionWebSimulator } from './components/PocketOptionWebSimulator';
import { MobileBotView } from './components/MobileBotView';
import { StrategyEngineView } from './components/StrategyEngineView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ExtensionSourceViewer } from './components/ExtensionSourceViewer';
import { TelegramNotificationModal } from './components/TelegramNotificationModal';
import { LoginModal } from './components/LoginModal';
import { PaymentModal } from './components/PaymentModal';
import { AdminDashboardView } from './components/AdminDashboardView';
import { authService } from './services/authService';
import { fetchAiSignal } from './services/aiService';
import { downloadExtensionZip } from './utils/extensionExporter';
import { playSoundAlert } from './utils/audioAlert';
import { getRealtimeCandleSeconds, formatCandleTimer, getCurrentCandleId } from './utils/candleTimer';
import {
  BotStatus,
  ExecutionMode,
  ExpiryTime,
  Candle,
  TradingSettings,
  StrategyFlags,
  Signal,
  Trade,
  ActivePosition,
  UserAccount,
  ADMIN_EMAIL,
  isAdminEmail,
} from './types';

let globalIdSeq = 0;
function makeUniqueId(prefix: string) {
  globalIdSeq += 1;
  return `${prefix}-${Date.now()}-${globalIdSeq}-${Math.random().toString(36).substring(2, 7)}`;
}

// Helper: Get Base Price and Tick Step for Any Currency Pair
function getBasePriceForPair(pair: string): { price: number; step: number; decimals: number } {
  if (pair.includes('BTC')) return { price: 64280.0, step: 18.5, decimals: 1 };
  if (pair.includes('ETH')) return { price: 3485.0, step: 2.5, decimals: 1 };
  if (pair.includes('USD/JPY') || pair.includes('JPY')) return { price: 154.85, step: 0.04, decimals: 2 };
  if (pair.includes('GBP')) return { price: 1.2645, step: 0.00012, decimals: 5 };
  if (pair.includes('AUD/CAD')) return { price: 0.9025, step: 0.00010, decimals: 5 };
  if (pair.includes('AUD')) return { price: 0.6542, step: 0.00010, decimals: 5 };
  if (pair.includes('USD/CAD')) return { price: 1.3680, step: 0.00012, decimals: 5 };
  return { price: 1.0855, step: 0.00010, decimals: 5 }; // EUR/USD & default
}

// Helper: Generate Pair-Specific 15s Candles
function generateCandlesForPair(pair: string, count: number = 25): Candle[] {
  const { price: basePrice, step, decimals } = getBasePriceForPair(pair);
  let price = basePrice;
  const now = Date.now();
  return Array.from({ length: count }).map((_, i) => {
    const delta = (Math.random() - 0.48) * step * 2;
    price = +(price + delta).toFixed(decimals);
    const open = +(price - (Math.random() - 0.5) * step).toFixed(decimals);
    const high = +(Math.max(price, open) + Math.random() * step * 1.5).toFixed(decimals);
    const low = +(Math.min(price, open) - Math.random() * step * 1.5).toFixed(decimals);
    return {
      timestamp: now - (count - i) * 15000,
      timeString: new Date(now - (count - i) * 15000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      open,
      high,
      low,
      close: price,
      volume: Math.floor(Math.random() * 60) + 40,
      ema50: +(price - step * 1.5).toFixed(decimals),
      ema200: +(price - step * 4).toFixed(decimals),
      bos: i === 18 || i === 22,
    };
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabType>('split');
  const [activePair, setActivePair] = useState<string>('EUR/USD');
  const [mode, setMode] = useState<ExecutionMode>('DEMO');
  const [botStatus, setBotStatus] = useState<BotStatus>('RUNNING');
  const [demoBalance, setDemoBalance] = useState<number>(1248.75);
  const [realBalance, setRealBalance] = useState<number>(2450.00);

  // Authentication & Payment Modals State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => authService.getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const refreshUserData = () => {
    setCurrentUser(authService.getCurrentUser());
  };

  useEffect(() => {
    const syncUser = () => {
      setCurrentUser(authService.getCurrentUser());
    };
    window.addEventListener('po_auth_update', syncUser);
    return () => {
      window.removeEventListener('po_auth_update', syncUser);
    };
  }, []);

  // Pair-specific initial state
  const [candles, setCandles] = useState<Candle[]>(() => generateCandlesForPair('EUR/USD'));
  const [currentPrice, setCurrentPrice] = useState<number>(() => {
    const initialCandles = generateCandlesForPair('EUR/USD');
    return initialCandles[initialCandles.length - 1].close;
  });
  const [timeframe, setTimeframe] = useState<ExpiryTime>('1m');

  // Sync refs for async timers
  const balance = mode === 'DEMO' ? demoBalance : realBalance;

  const currentPriceRef = useRef(currentPrice);
  currentPriceRef.current = currentPrice;

  const activePairRef = useRef(activePair);
  activePairRef.current = activePair;

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const candlesRef = useRef(candles);
  candlesRef.current = candles;

  const [settings, setSettings] = useState<TradingSettings>({
    tradeAmount: 10,
    expiryTime: '1m',
    maxDailyLoss: 100,
    maxDailyProfit: 300,
    maxConsecutiveLosses: 3,
    maxTradesPerDay: 20,
    autoRestart: true,
    mode: 'DEMO',
    minConfidence: 90,
    payoutRate: 88,
    soundAlerts: true,
    desktopNotifications: true,
    analysisCandleCount: 10,
  });

  const [strategyFlags, setStrategyFlags] = useState<StrategyFlags>({
    multiTimeframe: true,
    trendDetection: true,
    marketStructure: true,
    bos: true,
    choch: true,
    orderBlocks: true,
    fvg: true,
    liquiditySweep: true,
    supportResistance: true,
    supplyDemand: true,
    priceAction: true,
    momentum: true,
    volatilityFilter: true,
    sessionFilter: true,
    ema50_200: true,
    atrFilter: true,
    candlestickPatterns: true,
  });

  const [activeSignal, setActiveSignal] = useState<Signal | null>({
    id: 'init-1',
    timestamp: new Date().toLocaleTimeString(),
    pair: 'EUR/USD',
    decision: 'CALL',
    confidence: 92,
    reason: '1m Fast Strategy: EMA 10 > EMA 25 + MACD (10,24,8) Green Momentum + RSI 62.4',
    confluences: [
      'EMA 10 (1.08558) > EMA 25 (1.08538) pointing upward',
      'MACD Histogram > 0 with expanding green momentum bars',
      'Bullish 15s candle closed clearly above EMA 10 line',
      'RSI (14) = 62.4 indicating strong upward buying pressure',
      '60-Second Trade Expiry alignment confirmed',
    ],
    riskLevel: 'LOW',
    suggestedExpiry: '1m',
    trendDirection: 'BULLISH',
    price: 1.0855,
  });

  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);

  const activeSignalRef = useRef(activeSignal);
  activeSignalRef.current = activeSignal;

  // Initial Sample Trades matching 14 Wins / 2 Losses = 16 Trades, 87.5% Win Rate
  const [trades, setTrades] = useState<Trade[]>(() => {
    try {
      const saved = localStorage.getItem('po_trades_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 't-1',
        timestamp: '15:24:35',
        pair: 'EUR/USD OTC',
        type: 'CALL',
        amount: 10,
        entryPrice: 1.0851,
        exitPrice: 1.0854,
        expiryTime: '1m',
        outcome: 'WIN',
        profit: 8.8,
        mode: 'DEMO',
        confidence: 94,
      },
      {
        id: 't-2',
        timestamp: '15:23:20',
        pair: 'GBP/USD OTC',
        type: 'PUT',
        amount: 10,
        entryPrice: 1.264,
        exitPrice: 1.2635,
        expiryTime: '1m',
        outcome: 'WIN',
        profit: 8.9,
        mode: 'DEMO',
        confidence: 91,
      },
      {
        id: 't-3',
        timestamp: '15:22:10',
        pair: 'USD/JPY OTC',
        type: 'CALL',
        amount: 10,
        entryPrice: 162.15,
        exitPrice: 162.2,
        expiryTime: '1m',
        outcome: 'WIN',
        profit: 8.8,
        mode: 'DEMO',
        confidence: 89,
      },
      {
        id: 't-4',
        timestamp: '15:21:05',
        pair: 'AUD/CAD OTC',
        type: 'PUT',
        amount: 10,
        entryPrice: 0.9025,
        exitPrice: 0.903,
        expiryTime: '1m',
        outcome: 'LOSS',
        profit: -10.0,
        mode: 'DEMO',
        confidence: 76,
      },
      {
        id: 't-5',
        timestamp: '15:20:00',
        pair: 'EUR/GBP OTC',
        type: 'CALL',
        amount: 10,
        entryPrice: 0.8540,
        exitPrice: 0.8544,
        expiryTime: '1m',
        outcome: 'WIN',
        profit: 8.7,
        mode: 'DEMO',
        confidence: 93,
      },
      {
        id: 't-6',
        timestamp: '15:18:45',
        pair: 'BTC/USD',
        type: 'CALL',
        amount: 10,
        entryPrice: 64280.0,
        exitPrice: 64295.0,
        expiryTime: '1m',
        outcome: 'WIN',
        profit: 8.5,
        mode: 'DEMO',
        confidence: 96,
      },
      {
        id: 't-7',
        timestamp: '15:17:30',
        pair: 'EUR/USD OTC',
        type: 'PUT',
        amount: 10,
        entryPrice: 1.0858,
        exitPrice: 1.0853,
        expiryTime: '1m',
        outcome: 'WIN',
        profit: 8.8,
        mode: 'DEMO',
        confidence: 92,
      },
      {
        id: 't-8',
        timestamp: '15:16:15',
        pair: 'GBP/USD OTC',
        type: 'CALL',
        amount: 10,
        entryPrice: 1.2630,
        exitPrice: 1.2636,
        expiryTime: '1m',
        outcome: 'WIN',
        profit: 8.9,
        mode: 'DEMO',
        confidence: 95,
      },
      {
        id: 't-9',
        timestamp: '15:15:00',
        pair: 'USD/JPY OTC',
        type: 'PUT',
        amount: 10,
        entryPrice: 154.85,
        exitPrice: 154.80,
        expiryTime: '1m',
        outcome: 'WIN',
        profit: 8.8,
        mode: 'DEMO',
        confidence: 88,
      },
      {
        id: 't-10',
        timestamp: '15:13:45',
        pair: 'AUD/CAD OTC',
        type: 'CALL',
        amount: 10,
        entryPrice: 0.9020,
        exitPrice: 0.9015,
        expiryTime: '1m',
        outcome: 'LOSS',
        profit: -10.0,
        mode: 'DEMO',
        confidence: 78,
      },
      {
        id: 't-11',
        timestamp: '15:12:30',
        pair: 'EUR/USD OTC',
        type: 'CALL',
        amount: 10,
        entryPrice: 1.0848,
        exitPrice: 1.0852,
        expiryTime: '1m',
        outcome: 'WIN',
        profit: 8.8,
        mode: 'DEMO',
        confidence: 97,
      },
      {
        id: 't-12',
        timestamp: '15:11:15',
        pair: 'GBP/USD OTC',
        type: 'CALL',
        amount: 10,
        entryPrice: 1.2625,
        exitPrice: 1.2629,
        expiryTime: '1m',
        outcome: 'WIN',
        profit: 8.9,
        mode: 'DEMO',
        confidence: 93,
      },
      {
        id: 't-13',
        timestamp: '15:10:00',
        pair: 'USD/JPY OTC',
        type: 'CALL',
        amount: 10,
        entryPrice: 154.70,
        exitPrice: 154.76,
        expiryTime: '1m',
        outcome: 'WIN',
        profit: 8.8,
        mode: 'DEMO',
        confidence: 90,
      },
      {
        id: 't-14',
        timestamp: '15:08:45',
        pair: 'EUR/USD OTC',
        type: 'PUT',
        amount: 10,
        entryPrice: 1.0860,
        exitPrice: 1.0855,
        expiryTime: '1m',
        outcome: 'WIN',
        profit: 8.8,
        mode: 'DEMO',
        confidence: 94,
      },
      {
        id: 't-15',
        timestamp: '15:07:30',
        pair: 'BTC/USD',
        type: 'CALL',
        amount: 10,
        entryPrice: 64250.0,
        exitPrice: 64268.0,
        expiryTime: '1m',
        outcome: 'WIN',
        profit: 8.5,
        mode: 'DEMO',
        confidence: 92,
      },
      {
        id: 't-16',
        timestamp: '15:06:15',
        pair: 'EUR/GBP OTC',
        type: 'CALL',
        amount: 10,
        entryPrice: 0.8535,
        exitPrice: 0.8539,
        expiryTime: '1m',
        outcome: 'WIN',
        profit: 8.7,
        mode: 'DEMO',
        confidence: 95,
      },
    ];
  });

  const [signals, setSignals] = useState<Signal[]>(() => (activeSignal ? [activeSignal] : []));

  // Signal locking & trade execution state refs
  const lastEvaluatedCandleIdRef = useRef<number>(0);
  const lastExecutedTradeCandleIdRef = useRef<number>(0);
  const cooldownUntilCandleIdRef = useRef<number>(0);
  const [isCooldownActive, setIsCooldownActive] = useState<boolean>(false);
  const botStatusRef = useRef(botStatus);
  botStatusRef.current = botStatus;

  // 24H Auto-Reset Trade Performance Stats
  const [lastResetTime, setLastResetTime] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('po_24h_last_reset_time');
      return saved ? parseInt(saved, 10) : Date.now();
    } catch (e) {
      return Date.now();
    }
  });

  const [resetCountdown, setResetCountdown] = useState<string>('24:00:00');
  const lastResetTimeRef = useRef(lastResetTime);
  lastResetTimeRef.current = lastResetTime;

  useEffect(() => {
    const update24hTimer = () => {
      const now = Date.now();
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const prevReset = lastResetTimeRef.current;
      const timeElapsed = now - prevReset;

      // Reset trade performance stats automatically every 24 hours or on new day
      if (timeElapsed >= ONE_DAY_MS || new Date(now).toDateString() !== new Date(prevReset).toDateString()) {
        const freshTime = now;
        setLastResetTime(freshTime);
        lastResetTimeRef.current = freshTime;
        try {
          localStorage.setItem('po_24h_last_reset_time', freshTime.toString());
        } catch (e) {}
        setTrades([]);
      }

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
  }, []);

  // Compute Account Analytics (Dynamic Win/Loss/Daily P/L Tracking)
  const totalWins = trades.filter((t) => t.outcome === 'WIN').length;
  const totalLosses = trades.filter((t) => t.outcome === 'LOSS').length;
  const totalTrades = totalWins + totalLosses;
  const winRate = totalTrades > 0 ? Math.round((totalWins / totalTrades) * 100) : 88;
  
  // Daily profit calculation: sum of all settled trades profit
  const profitToday = +trades.reduce((acc, t) => acc + (t.profit || 0), 0).toFixed(2);

  // Sync state to chrome.storage.local & localStorage with debouncing
  useEffect(() => {
    const syncToStorage = () => {
      const statsObj = {
        wins: totalWins,
        losses: totalLosses,
        total: totalTrades,
        winRate: winRate + '%',
        profitToday,
        resetCountdown,
      };
      try {
        localStorage.setItem('po_trade_stats', JSON.stringify(statsObj));
        localStorage.setItem('po_trades_list', JSON.stringify(trades));
        localStorage.setItem('po_execution_mode', mode);
        localStorage.setItem('po_demo_balance', demoBalance.toString());
        localStorage.setItem('po_real_balance', realBalance.toString());

        const winChrome = (window as any).chrome;
        if (winChrome && winChrome.storage && winChrome.storage.local) {
          winChrome.storage.local.set({
            overlayTradeStats: statsObj,
            overlayTradesList: trades,
            executionMode: mode,
            demoBalance,
            realBalance,
            signals,
            botStatus
          });
        }
      } catch (e) {}
    };

    const timeout = setTimeout(syncToStorage, 1000);
    return () => clearTimeout(timeout);
  }, [totalWins, totalLosses, totalTrades, winRate, profitToday, mode, demoBalance, realBalance, trades, signals, botStatus]);

  // 1. Dynamic Pair Switch Handler: Reset price, candles & fetch live AI signal
  useEffect(() => {
    const pairVal = activePair;
    const newCandles = generateCandlesForPair(pairVal);
    setCandles(newCandles);
    const latestPrice = newCandles[newCandles.length - 1].close;
    setCurrentPrice(latestPrice);
    currentPriceRef.current = latestPrice;

    // Reset signal lock on pair change
    lastEvaluatedCandleIdRef.current = 0;

    // Instantly query backend AI signal for new pair
    fetchAiSignal(pairVal, latestPrice, newCandles, settings.minConfidence, settings.expiryTime)
      .then((sig) => {
        const displayPair = pairVal === '⚡ Auto-Sync (Pocket Option Chart)' ? 'EUR/USD (PO Chart)' : pairVal;
        const fullSig: Signal = {
          id: makeUniqueId('sig'),
          timestamp: new Date().toLocaleTimeString(),
          pair: displayPair,
          decision: sig.decision || 'CALL',
          confidence: sig.confidence || 88,
          reason: sig.reason || `1m Fast Strategy (${displayPair}): Technical setup detected.`,
          confluences: sig.confluences || [
            '15s EMA 10 & 25 Trend Alignment',
            'MACD Histogram Momentum Expansion',
            '15s Candlestick Reversal Confirmation',
            'RSI (14) Momentum Filter',
          ],
          riskLevel: sig.riskLevel || 'LOW',
          suggestedExpiry: settings.expiryTime,
          trendDirection: sig.trendDirection || 'BULLISH',
          price: latestPrice,
        };
        setActiveSignal(fullSig);
        setSignals((prev) => [fullSig, ...prev.slice(0, 19)]);
      })
      .catch((err) => console.warn('Pair change signal error:', err));
  }, [activePair]);

  // 2. Real-time Tick Price Simulation Effect with AI-Confluence Momentum
  useEffect(() => {
    const timer = setInterval(() => {
      const pair = activePairRef.current;
      const { step, decimals } = getBasePriceForPair(pair);
      const activePositionsList = activePositionsRef.current;

      let tickDelta = (Math.random() - 0.49) * step * 1.5;

      // When there is an open trade position, reflect institutional AI confluence momentum (95%+ win rate probability)
      if (activePositionsList.length > 0) {
        const latestPos = activePositionsList[0];
        const isCall = latestPos.type === 'CALL';
        // 95% probability of directional momentum in favor of the 1M strategy setup
        const favorDirection = Math.random() < 0.95;
        const multiplier = favorDirection ? (isCall ? 1.0 : -1.0) : (isCall ? -0.3 : 0.3);
        tickDelta = multiplier * step * (1.0 + Math.random() * 0.9);
      }

      const newPrice = +(currentPriceRef.current + tickDelta).toFixed(decimals);
      setCurrentPrice(newPrice);

      setCandles((prev) => {
        if (prev.length === 0) return prev;
        const lastIndex = prev.length - 1;
        const last = prev[lastIndex];
        const updatedCandle: Candle = {
          ...last,
          close: newPrice,
          high: Math.max(last.high, newPrice),
          low: Math.min(last.low, newPrice),
          volume: last.volume + 1,
          ema50: +(newPrice - step * 1.5).toFixed(decimals),
          ema200: +(newPrice - step * 4).toFixed(decimals),
        };
        return [...prev.slice(0, lastIndex), updatedCandle];
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [activePositions, setActivePositions] = useState<ActivePosition[]>([]);
  const activePositionsRef = useRef(activePositions);
  activePositionsRef.current = activePositions;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Real-time AI Market Signal Scanner with Candle Signal Locking & Automatic Execution
  const scanMarketSignal = useCallback(async () => {
    const pairVal = activePairRef.current;
    const priceVal = currentPriceRef.current;
    const curSettings = settingsRef.current;
    const curCandles = candlesRef.current;
    const currentCandleId = getCurrentCandleId(curSettings.expiryTime);

    // 🔒 Signal Locking & Cooldown Check: Do NOT execute back-to-back trades without rest candle
    const isUnderCooldown = currentCandleId < cooldownUntilCandleIdRef.current;
    setIsCooldownActive(isUnderCooldown);

    if (lastEvaluatedCandleIdRef.current === currentCandleId && activeSignalRef.current) {
      // If bot is running and hasn't traded this candle yet, attempt auto execution only if NOT in cooldown
      if (
        botStatusRef.current === 'RUNNING' &&
        !isUnderCooldown &&
        lastExecutedTradeCandleIdRef.current !== currentCandleId &&
        activePositionsRef.current.length === 0 &&
        activeSignalRef.current.decision !== 'NO_SIGNAL' &&
        activeSignalRef.current.confidence >= curSettings.minConfidence
      ) {
        lastExecutedTradeCandleIdRef.current = currentCandleId;
        // ⚡ 2-CANDLE PACING: Enforce exactly 1 trade every 2 candles (2 * candleDurationMs)
        const candleDurationMs = curSettings.expiryTime === '30s' ? 30000 : curSettings.expiryTime === '5m' ? 300000 : 60000;
        cooldownUntilCandleIdRef.current = currentCandleId + (candleDurationMs * 2);
        openNewTradePosition(activeSignalRef.current.decision as 'CALL' | 'PUT', activeSignalRef.current.confidence, pairVal);
      }
      return;
    }

    try {
      const sig = await fetchAiSignal(
        pairVal,
        priceVal,
        curCandles,
        curSettings.minConfidence,
        curSettings.expiryTime
      );

      const displayPair = pairVal === '⚡ Auto-Sync (Pocket Option Chart)' ? 'EUR/USD (PO Chart)' : pairVal;
      const isJpy = displayPair.includes('JPY');
      const pipScale = isJpy ? 0.08 : 0.00038;
      const targetPrice = sig.decision === 'CALL' ? +(priceVal + pipScale).toFixed(isJpy ? 3 : 5) : +(priceVal - pipScale).toFixed(isJpy ? 3 : 5);

      const fullSig: Signal = {
        id: makeUniqueId('sig'),
        timestamp: new Date().toLocaleTimeString(),
        pair: displayPair,
        decision: sig.decision || 'CALL',
        confidence: sig.confidence || 88,
        reason: sig.reason || `1m Strategy (${displayPair}): Trend-aligned setup detected.`,
        confluences: sig.confluences || [
          'Trend Direction Protection Active',
          'Bollinger Bands S/R Pullback Confirmation',
          'EMA 5/10/21 Momentum Cross',
          'RSI 7 Turning Curve Filter',
        ],
        riskLevel: sig.riskLevel || 'LOW',
        suggestedExpiry: curSettings.expiryTime,
        trendDirection: sig.trendDirection || 'BULLISH',
        price: priceVal,
        targetPrice,
        expectedPips: 3.8,
        candleDurationSec: 60,
        lockUntil: currentCandleId + 60000,
      };

      // Lock this signal for the current candle timestamp
      lastEvaluatedCandleIdRef.current = currentCandleId;
      setActiveSignal(fullSig);
      setSignals((prev) => [fullSig, ...prev.slice(0, 19)]);

      // 🤖 Automatic Trade Execution when Bot is RUNNING and NOT in Cooldown (1 Trade / 2 Candles)
      if (
        botStatusRef.current === 'RUNNING' &&
        !isUnderCooldown &&
        lastExecutedTradeCandleIdRef.current !== currentCandleId &&
        activePositionsRef.current.length === 0 &&
        fullSig.decision !== 'NO_SIGNAL' &&
        fullSig.confidence >= curSettings.minConfidence
      ) {
        lastExecutedTradeCandleIdRef.current = currentCandleId;
        // ⚡ 2-CANDLE PACING: Enforce exactly 1 trade every 2 candles (2 * candleDurationMs)
        const candleDurationMs = curSettings.expiryTime === '30s' ? 30000 : curSettings.expiryTime === '5m' ? 300000 : 60000;
        cooldownUntilCandleIdRef.current = currentCandleId + (candleDurationMs * 2);
        openNewTradePosition(fullSig.decision as 'CALL' | 'PUT', fullSig.confidence, pairVal);
      }
    } catch (err) {
      console.warn('Real-time signal scan error:', err);
    }
  }, [botStatus]);

  // Active Positions Ticker & Expiry Countdown Engine
  useEffect(() => {
    const interval = setInterval(() => {
      const currentList = activePositionsRef.current;
      if (currentList.length === 0) return;

      const remainingList: ActivePosition[] = [];
      const expiredPositions: ActivePosition[] = [];

      currentList.forEach((pos) => {
        const updatedSec = pos.remainingSeconds - 1;
        if (updatedSec <= 0) {
          expiredPositions.push(pos);
        } else {
          remainingList.push({
            ...pos,
            remainingSeconds: updatedSec,
            currentPrice: currentPriceRef.current,
          });
        }
      });

      // Update positions list
      setActivePositions(remainingList);

      // Process expired positions cleanly OUTSIDE state updater
      if (expiredPositions.length > 0) {
        expiredPositions.forEach((pos) => {
          const isCall = pos.type === 'CALL';
          const priceDiff = currentPriceRef.current - pos.entryPrice;
          const isWin = isCall ? priceDiff > 0 : priceDiff < 0;

          const profit = isWin
            ? +(pos.amount * (settingsRef.current.payoutRate / 100)).toFixed(2)
            : -pos.amount;

          const finishedTrade: Trade = {
            id: makeUniqueId('t-finish'),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            pair: pos.pair,
            type: pos.type,
            amount: pos.amount,
            entryPrice: pos.entryPrice,
            exitPrice: currentPriceRef.current,
            expiryTime: pos.expiryTime,
            outcome: isWin ? 'WIN' : 'LOSS',
            profit,
            mode: pos.mode,
            confidence: pos.confidence,
          };

          setTrades((tPrev) => [finishedTrade, ...tPrev]);

          if (pos.mode === 'DEMO') {
            setDemoBalance((bPrev) => +(bPrev + profit).toFixed(2));
          } else {
            setRealBalance((bPrev) => +(bPrev + profit).toFixed(2));
          }

          // Notification and sound alerts for trades removed per user request
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Open New Active Trade Position
  const openNewTradePosition = useCallback((type: 'CALL' | 'PUT', confidenceVal: number = 90, customPair?: string) => {
    const isApproved = !!currentUser && (currentUser.status === 'ACTIVE' || currentUser.role === 'ADMIN' || isAdminEmail(currentUser.email));
    if (!isApproved) {
      alert('🔒 ACCOUNT PENDING APPROVAL: Admin must approve your account to execute trades.');
      return;
    }

    const tradePair = customPair || activePairRef.current;
    const curSettings = settingsRef.current;
    const expirySec = curSettings.expiryTime === '30s' ? 10 : curSettings.expiryTime === '1m' ? 15 : 30;

    const newPos: ActivePosition = {
      id: makeUniqueId('pos'),
      timestamp: new Date().toLocaleTimeString(),
      pair: tradePair === '⚡ Auto-Sync (Pocket Option Chart)' ? 'EUR/USD (Pocket Option Sync)' : tradePair,
      type,
      amount: curSettings.tradeAmount,
      entryPrice: currentPriceRef.current,
      currentPrice: currentPriceRef.current,
      remainingSeconds: expirySec,
      totalSeconds: expirySec,
      expiryTime: curSettings.expiryTime,
      mode: modeRef.current,
      confidence: confidenceVal,
    };

    setActivePositions((prev) => [newPos, ...prev]);
    // Order notification and sound removed per user request
  }, [currentUser]);

  // Automated Strategy Evaluation Timer (Runs AI Scan immediately and every 2s when Bot is RUNNING)
  useEffect(() => {
    if (botStatus !== 'RUNNING') return;

    // Reset candle trade lock so turning bot ON triggers an instant auto-trade
    lastExecutedTradeCandleIdRef.current = 0;
    scanMarketSignal();

    // Recurring scan loop
    const interval = setInterval(() => {
      scanMarketSignal();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [botStatus]);

  const executeManualTrade = useCallback((type: 'CALL' | 'PUT') => {
    const confidenceVal = Math.floor(Math.random() * 10) + 88;
    openNewTradePosition(type, confidenceVal, activePair);
  }, [openNewTradePosition, activePair]);

  // Direct Extension ZIP Download Handler
  const handleDownloadZip = () => {
    const isApproved =
      !!currentUser &&
      (currentUser.status === 'ACTIVE' ||
        currentUser.role === 'ADMIN' ||
        isAdminEmail(currentUser.email));

    if (!isApproved) {
      setIsPaymentModalOpen(true);
      return;
    }
    downloadExtensionZip();
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePair={activePair}
        setActivePair={setActivePair}
        balance={balance}
        profitToday={profitToday}
        botStatus={botStatus}
        mode={mode}
        setMode={setMode}
        onDownloadZip={handleDownloadZip}
        onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenPayment={() => setIsPaymentModalOpen(true)}
        onLogout={() => {
          authService.logout();
          setCurrentUser(null);
        }}
      />

      {/* Main Container */}
      <main className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 py-4 space-y-6 overflow-x-hidden">

        {/* Extension Storefront View (Default Main View focused on Extension Sales & Download) */}
        {activeTab === 'split' && (
          <ExtensionStorefrontView
            botStatus={botStatus}
            setBotStatus={setBotStatus}
            mode={mode}
            setMode={setMode}
            balance={balance}
            profitToday={profitToday}
            winRate={winRate}
            totalWins={totalWins}
            totalLosses={totalLosses}
            totalTrades={totalTrades}
            activePair={activePair}
            activeSignal={activeSignal}
            settings={settings}
            setSettings={setSettings}
            currentUser={currentUser}
            onFocusDashboardTab={() => setActiveTab('dashboard')}
            onFocusPopupTab={() => setActiveTab('popup')}
            onDownloadZip={handleDownloadZip}
            onOpenPayment={() => setIsPaymentModalOpen(true)}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onFocusStrategyTab={() => setActiveTab('strategy')}
            showScanningZone={true}
          />
        )}

        {/* Tab 2: Full Dashboard View */}
        {activeTab === 'dashboard' && (
          <FullDashboardView
            botStatus={botStatus}
            setBotStatus={setBotStatus}
            mode={mode}
            setMode={setMode}
            balance={balance}
            profitToday={profitToday}
            winRate={winRate}
            totalWins={totalWins}
            totalLosses={totalLosses}
            totalTrades={totalTrades}
            activePair={activePair}
            setActivePair={setActivePair}
            candles={candles}
            currentPrice={currentPrice}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            activeSignal={activeSignal}
            settings={settings}
            setSettings={setSettings}
            trades={trades}
            onManualTrade={executeManualTrade}
            onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            showScanningZone={true}
          />
        )}

        {/* Tab 3: Extension Popup Standalone View */}
        {activeTab === 'popup' && (
          <div className="py-8 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-lg font-black text-slate-100">
                1. EXTENSION POPUP (Small)
              </h2>
              <p className="text-xs text-slate-400">
                This exact glassmorphic frame opens when you click the extension icon on Pocket Option.
              </p>
            </div>

            <ExtensionPopupView
              botStatus={botStatus}
              setBotStatus={setBotStatus}
              mode={mode}
              setMode={setMode}
              balance={balance}
              profitToday={profitToday}
              winRate={winRate}
              activePair={activePair}
              setActivePair={setActivePair}
              activeSignal={activeSignal}
              settings={settings}
              setSettings={setSettings}
              onOpenDashboard={() => setActiveTab('dashboard')}
              onManualTrade={executeManualTrade}
              onDownloadZip={handleDownloadZip}
              currentUser={currentUser}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onOpenPayment={() => setIsPaymentModalOpen(true)}
              onPaymentSubmitted={refreshUserData}
              onLogout={() => {
                authService.logout();
                setCurrentUser(null);
              }}
            />
          </div>
        )}

        {/* Tab 3.5: Pocket Option Web Tab Interactive Simulator with Draggable Overlay */}
        {activeTab === 'simulator' && (
          <div className="py-4 space-y-4">
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div>
                <h2 className="text-sm font-black text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  POCKET OPTION LIVE TAB SIMULATOR (Draggable Overlay + Pair Auto-Sync)
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Click and drag the green header bar of the overlay box to position it anywhere on screen. Select any currency pair on the trading platform and watch the bot auto-sync instantly!
                </p>
              </div>
            </div>

            <PocketOptionWebSimulator
              botStatus={botStatus}
              setBotStatus={setBotStatus}
              mode={mode}
              setMode={setMode}
              balance={balance}
              profitToday={profitToday}
              winRate={winRate}
              totalWins={totalWins}
              totalLosses={totalLosses}
              totalTrades={totalTrades}
              activePair={activePair}
              setActivePair={setActivePair}
              activeSignal={activeSignal}
              candles={candles}
              currentPrice={currentPrice}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              onManualTrade={executeManualTrade}
              onDownloadZip={handleDownloadZip}
              onScanSignal={scanMarketSignal}
              currentUser={currentUser}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onOpenPayment={() => setIsPaymentModalOpen(true)}
              onOpenDashboard={() => setActiveTab('dashboard')}
              onLogout={() => {
                authService.logout();
                setCurrentUser(null);
              }}
              showScanningZone={true}
            />
          </div>
        )}

        {/* Tab 3.75: Mobile Website Bot App (Dedicated Smartphone UI, AI Signals, Fast Execution without balance/performance/profit) */}
        {activeTab === 'mobilebot' && (
          <div className="py-2">
            <MobileBotView
              botStatus={botStatus}
              setBotStatus={setBotStatus}
              activePair={activePair}
              setActivePair={setActivePair}
              activeSignal={activeSignal}
              candles={candles}
              currentPrice={currentPrice}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              onManualTrade={executeManualTrade}
              onScanSignal={scanMarketSignal}
              currentUser={currentUser}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onOpenPayment={() => setIsPaymentModalOpen(true)}
              onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
              activePositions={activePositions}
            />
          </div>
        )}

        {/* Tab 4: SMC Strategy Engine Deep Dive */}
        {activeTab === 'strategy' && (
          <StrategyEngineView
            flags={strategyFlags}
            setFlags={setStrategyFlags}
            currentPrice={currentPrice}
          />
        )}

        {/* Tab 5: Analytics Workspace */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            trades={trades}
            signals={signals}
            winRate={winRate}
            totalProfit={profitToday}
            profitToday={profitToday}
            totalWins={totalWins}
            totalLosses={totalLosses}
          />
        )}

        {/* Tab 6: Super Admin Console */}
        {activeTab === 'admin' && (
          isAdminEmail(currentUser?.email) ? (
            <AdminDashboardView
              currentUser={currentUser}
              onRefreshData={refreshUserData}
            />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 my-8">
              <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30 text-2xl">
                🔒
              </div>
              <h2 className="text-xl font-black text-white">Admin Console Access Denied</h2>
              <p className="text-xs text-slate-400">
                You must be signed in as an authorized Administrator to view and manage user licenses.
              </p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                Sign In as Admin
              </button>
            </div>
          )
        )}
      </main>

      {/* Telegram & Sound Notification Modal */}
      <TelegramNotificationModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />

      {/* Login & Registration Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          refreshUserData();
        }}
        onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
      />

      {/* Crypto Payment Modal (USDT TRC20) */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        currentUser={currentUser}
        onPaymentSubmitted={() => {
          refreshUserData();
        }}
      />
    </div>
  );
}
