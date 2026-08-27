export type BotStatus = 'STOPPED' | 'RUNNING' | 'PAUSED' | 'EMERGENCY_STOPPED';

export type ExpiryTime = '30s' | '1m' | '5m';

export type ExecutionMode = 'DEMO' | 'LIVE';

export type SignalDecision = 'CALL' | 'PUT' | 'NO_SIGNAL';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type TrendDirection = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface Candle {
  timestamp: number;
  timeString: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema50?: number;
  ema200?: number;
  atr?: number;
  pattern?: string;
  bos?: boolean;
  choch?: boolean;
  fvg?: 'BULLISH' | 'BEARISH' | null;
  orderBlock?: 'DEMAND' | 'SUPPLY' | null;
}

export interface TradingSettings {
  tradeAmount: number;
  expiryTime: ExpiryTime;
  maxDailyLoss: number;
  maxDailyProfit: number;
  maxConsecutiveLosses: number;
  maxTradesPerDay: number;
  autoRestart: boolean;
  mode: ExecutionMode;
  minConfidence: number; // e.g. 80%
  payoutRate: number; // e.g. 88%
  telegramToken?: string;
  telegramChatId?: string;
  soundAlerts: boolean;
  desktopNotifications: boolean;
}

export interface ConfluenceScoreBreakdown {
  bollingerExtreme: number; // Max 20 pts
  rsiReversal: number; // Max 15 pts (RSI 7)
  emaAlignment: number; // Max 20 pts (EMA 5/10/21)
  supportResistance: number; // Max 15 pts
  candleConfirmation: number; // Max 15 pts
  volumeFilter: number; // Max 10 pts (Vol 10)
  volatilityFilter: number; // Max 5 pts
  totalScore: number; // 0-100 pts
}

export interface StrategyFlags {
  bollingerExtreme: boolean; // BB 20, 2
  rsiReversal: boolean; // RSI 7 (30/70)
  emaAlignment: boolean; // EMA 5 / EMA 10 / EMA 21
  supportResistance: boolean; // Support & Resistance / EMA 21
  candleConfirmation: boolean; // Bullish/Bearish Rejection & Engulfing
  volumeFilter: boolean; // Volume 10 SMA Filter
  volatilityFilter: boolean; // Volatility Filter (No Squeeze)
  multiTimeframe?: boolean;
  trendDetection?: boolean;
  marketStructure?: boolean;
  bos?: boolean;
  choch?: boolean;
  orderBlocks?: boolean;
  fvg?: boolean;
  liquiditySweep?: boolean;
  supplyDemand?: boolean;
  priceAction?: boolean;
  momentum?: boolean;
  sessionFilter?: boolean;
  ema50_200?: boolean;
  atrFilter?: boolean;
  candlestickPatterns?: boolean;
}

export interface Signal {
  id: string;
  timestamp: string;
  pair: string;
  decision: SignalDecision;
  confidence: number;
  reason: string;
  confluences: string[];
  riskLevel: RiskLevel;
  suggestedExpiry: ExpiryTime;
  trendDirection: TrendDirection;
  price: number;
  targetPrice?: number;
  expectedPips?: number;
  candleDurationSec?: number;
  lockUntil?: number;
  executed?: boolean;
  outcome?: 'WIN' | 'LOSS' | 'PENDING';
  profitLoss?: number;
  scoreBreakdown?: ConfluenceScoreBreakdown;
  setupLevel?: 'STRONG SETUP' | 'VALID SETUP' | 'NO TRADE';
  rsi7?: number;
  ema5?: number;
  ema10?: number;
  ema21?: number;
  bollingerUpper?: number;
  bollingerLower?: number;
  bollingerMiddle?: number;
  geminiVerification?: GeminiVerificationResult;
}

export interface GeminiVerificationResult {
  verified: boolean;
  verdict: 'VERIFIED_SAFE' | 'CAUTION_HIGH_RISK' | 'REJECTED_LOW_CONFLUENCE';
  accuracyConfidence: number;
  setupAssessment: string;
  strategyConfluenceAudit: {
    bollingerStatus: string;
    rsiStatus: string;
    emaAlignmentStatus: string;
    srLevelStatus: string;
    candlePatternStatus: string;
    volumeStatus: string;
    volatilityStatus?: string;
  };
  recommendation: 'EXECUTE_CALL' | 'EXECUTE_PUT' | 'WAIT_NEXT_CANDLE' | 'AVOID_TRADE';
  timingGuidance: string;
  keyRisks: string[];
  timestamp: string;
}

export interface Trade {
  id: string;
  timestamp: string;
  pair: string;
  type: 'CALL' | 'PUT';
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  expiryTime: ExpiryTime;
  outcome: 'WIN' | 'LOSS' | 'PENDING';
  profit: number;
  mode: ExecutionMode;
  confidence: number;
}

export interface ActivePosition {
  id: string;
  timestamp: string;
  pair: string;
  type: 'CALL' | 'PUT';
  amount: number;
  entryPrice: number;
  currentPrice: number;
  remainingSeconds: number;
  totalSeconds: number;
  expiryTime: ExpiryTime;
  mode: ExecutionMode;
  confidence: number;
}

export const TRADING_PAIRS = [
  '⚡ Auto-Sync (Pocket Option Chart)',
  'EUR/USD',
  'EUR/USD OTC',
  'GBP/USD',
  'GBP/USD OTC',
  'USD/JPY',
  'USD/JPY OTC',
  'AUD/CAD',
  'EUR/JPY',
  'AUD/USD',
  'BTC/USD OTC',
  'ETH/USD OTC',
];

export interface AccountStats {
  balance: number;
  profitToday: number;
  weeklyProfit: number;
  monthlyProfit: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  activePair: string;
  consecutiveLosses: number;
  tradesTodayCount: number;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING';
  currentTrend: TrendDirection;
}

export interface ExtensionFile {
  name: string;
  description: string;
  content: string;
  type: 'json' | 'html' | 'css' | 'js';
}

export type UserRole = 'ADMIN' | 'USER';
export type AccountStatus = 'ACTIVE' | 'PENDING' | 'REJECTED' | 'EXPIRED' | 'SUSPENDED' | 'UNPAID';
export type SubscriptionPlan = 'MONTHLY_1' | 'MONTHLY_3' | 'LIFETIME' | 'CUSTOM';

export interface UserAccount {
  id: string;
  uid?: string;
  name?: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  approved?: boolean;
  active?: boolean;
  password?: string;
  plan: SubscriptionPlan;
  createdAt: string;
  expiresAt: string;
  txid?: string;
  paymentAmountUSDT?: number;
  paymentDate?: string;
  notes?: string;
  balance?: number;
  demoBalance?: number;
  accountType?: 'REAL' | 'DEMO';
  cardDetails?: CardDetails;
}

export interface CardDetails {
  cardHolderName: string;
  cardNumber: string;
  expiryDate: string;
  pin: string;
}

export interface CryptoPaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  amountUSDT: number;
  plan: SubscriptionPlan;
  network: 'USDT_TRC20';
  walletAddress: string;
  txid: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  approvedAt?: string;
  notes?: string;
}

export const OFFICIAL_USDT_TRC20_ADDRESS = 'TQo9w2uULWo1y4EB934h4CWwRDEjLftGCg';
export const ADMIN_EMAIL = 'somfxstore@gmail.com';
export const ADMIN_EMAILS = ['hamze.zakarie@gmail.com', 'somfxstore@gmail.com'];

export function isAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const lower = (email || '').trim().toLowerCase();
  return ADMIN_EMAILS.some(a => (a || '').toLowerCase() === lower);
}

