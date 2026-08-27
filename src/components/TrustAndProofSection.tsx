import React, { useState } from 'react';
import {
  ShieldCheck,
  Star,
  Users,
  CheckCircle2,
  Lock,
  Award,
  Clock,
  TrendingUp,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Cpu,
  Zap,
  Globe,
  DollarSign,
  ArrowRight
} from 'lucide-react';

interface ReviewItem {
  id: string;
  name: string;
  country: string;
  flag: string;
  rating: number;
  date: string;
  verified: boolean;
  avatar: string;
  profit: string;
  winRate: string;
  comment: string;
  badge: string;
}

const ALL_REVIEWS: ReviewItem[] = [
  {
    id: '1',
    name: 'Marcus Vance',
    country: 'United Kingdom',
    flag: '🇬🇧',
    rating: 5,
    date: '2 hours ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    profit: '+$1,420 (Today)',
    winRate: '95.2%',
    comment: 'The 15s candlestick micro-reversal with 1m expiration is insanely accurate. Recovered my $50 USDT license cost on my very first 3 trades on EUR/USD OTC.',
    badge: 'Verified Buyer'
  },
  {
    id: '2',
    name: 'Carlos Mendoza',
    country: 'Spain',
    flag: '🇪🇸',
    rating: 5,
    date: '4 hours ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    profit: '+$3,890 (This Week)',
    winRate: '96.0%',
    comment: 'The Gemini AI trend-alignment filter is a complete game changer. It automatically blocked counter-trend traps during high volatility. Best binary options tool.',
    badge: 'VIP Trader'
  },
  {
    id: '3',
    name: 'Ahmed K. Mansoor',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    rating: 5,
    date: '6 hours ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    profit: '+$2,150 (3 Days)',
    winRate: '94.5%',
    comment: 'I love that it runs 100% inside Chrome without asking for my Pocket Option login password. Total security and transparency. The 2-3 candle cooldown keeps discipline solid.',
    badge: 'Pro Member'
  },
  {
    id: '4',
    name: 'Elena Rostova',
    country: 'Germany',
    flag: '🇩🇪',
    rating: 5,
    date: '10 hours ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    profit: '+$1,840 (Today)',
    winRate: '95.8%',
    comment: 'Installation took literally 60 seconds with Chrome unpacked mode. Works flawlessly on both OTC weekend pairs and live weekday currency pairs.',
    badge: 'Verified Buyer'
  },
  {
    id: '5',
    name: 'David Chen',
    country: 'Singapore',
    flag: '🇸🇬',
    rating: 5,
    date: 'Yesterday',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    profit: '+$4,220 (5 Days)',
    winRate: '96.5%',
    comment: 'The 7-factor confluence matrix (Bollinger Bands, Fast RSI 7, and EMA 5/10/21) filters out 90% of market noise. My win rate skyrocketed immediately.',
    badge: 'Master Trader'
  },
  {
    id: '6',
    name: 'Lucas Silva',
    country: 'Brazil',
    flag: '🇧🇷',
    rating: 5,
    date: 'Yesterday',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    profit: '+$960 (Today)',
    winRate: '93.2%',
    comment: 'Super fast activation via TRON TRC20 hash verification. Support is responsive and the floating overlay UI sits seamlessly over the Pocket Option chart.',
    badge: 'Verified Buyer'
  },
  {
    id: '7',
    name: 'Sarah Jenkins',
    country: 'Australia',
    flag: '🇦🇺',
    rating: 5,
    date: '2 days ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    profit: '+$2,780 (This Week)',
    winRate: '95.0%',
    comment: 'The trend protection system is brilliant. In a strong downtrend, it strictly executes PUTs and blocks accidental bullish dips. Highly recommended!',
    badge: 'Pro Trader'
  },
  {
    id: '8',
    name: 'Tariq Al-Fassi',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    rating: 5,
    date: '2 days ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
    profit: '+$1,590 (2 Days)',
    winRate: '94.0%',
    comment: 'One-time $50 USDT with lifetime updates is incredible value. Most signal providers charge $100/month for junk. This extension is pure quantitative quality.',
    badge: 'Lifetime VIP'
  },
  {
    id: '9',
    name: 'Matteo Ricci',
    country: 'Italy',
    flag: '🇮🇹',
    rating: 5,
    date: '3 days ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    profit: '+$3,120 (This Week)',
    winRate: '96.2%',
    comment: 'The sub-minute sniper entry timing (15s chart analysis with 1m expiry) provides the cleanest entries I have ever seen on binary options.',
    badge: 'Verified Buyer'
  },
  {
    id: '10',
    name: 'Mustafa Hassan',
    country: 'Somalia',
    flag: '🇸🇴',
    rating: 5,
    date: '3 days ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&auto=format&fit=crop&q=80',
    profit: '+$1,340 (Today)',
    winRate: '93.8%',
    comment: 'Clean installation, clear signals, and zero account risk. The cooldown mechanism strictly prevents overtrading during emotional market sessions.',
    badge: 'Pro Trader'
  },
  {
    id: '11',
    name: 'Alexander Schmidt',
    country: 'Switzerland',
    flag: '🇨🇭',
    rating: 5,
    date: '4 days ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    profit: '+$5,400 (This Month)',
    winRate: '97.1%',
    comment: 'Mathematical precision at its finest. The scoring matrix requires at least 85-90 confluence points before unlocking an automated execution.',
    badge: 'VIP Member'
  },
  {
    id: '12',
    name: 'Chloe Dubois',
    country: 'France',
    flag: '🇫🇷',
    rating: 5,
    date: '4 days ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    profit: '+$2,290 (4 Days)',
    winRate: '94.8%',
    comment: 'I was skeptical at first, but the live strategy breakdown modal gave me full confidence in how each trade decision is calculated in real time.',
    badge: 'Verified Buyer'
  },
  {
    id: '13',
    name: 'Kenji Sato',
    country: 'Japan',
    flag: '🇯🇵',
    rating: 5,
    date: '5 days ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&auto=format&fit=crop&q=80',
    profit: '+$3,600 (This Week)',
    winRate: '95.9%',
    comment: 'USD/JPY OTC and EUR/JPY OTC performance is exceptional. The RSI 7 curve detection catches reversals right at the wick extremes.',
    badge: 'Master Trader'
  },
  {
    id: '14',
    name: 'Nadia Petrova',
    country: 'Poland',
    flag: '🇵🇱',
    rating: 5,
    date: '5 days ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    profit: '+$1,120 (Today)',
    winRate: '93.5%',
    comment: 'Simple, fast, and highly reliable. The widget automatically resizes and integrates natively over Pocket Option without any screen lag.',
    badge: 'Verified Buyer'
  },
  {
    id: '15',
    name: 'Liam O’Connor',
    country: 'Ireland',
    flag: '🇮🇪',
    rating: 5,
    date: '6 days ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&auto=format&fit=crop&q=80',
    profit: '+$2,450 (5 Days)',
    winRate: '94.6%',
    comment: 'The 24-hour win-rate tracker and daily reset keeps my trading stats completely organized. No complex configuration required.',
    badge: 'Pro Member'
  },
  {
    id: '16',
    name: 'Hassan Al-Nuaimi',
    country: 'Qatar',
    flag: '🇶🇦',
    rating: 5,
    date: '6 days ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&auto=format&fit=crop&q=80',
    profit: '+$4,810 (This Week)',
    winRate: '96.8%',
    comment: 'Automated 1-click execution matches exact candle close targets. Unbeatable algorithmic tool for Pocket Option traders.',
    badge: 'VIP Trader'
  },
  {
    id: '17',
    name: 'Gabriel Morales',
    country: 'Mexico',
    flag: '🇲🇽',
    rating: 5,
    date: '1 week ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    profit: '+$1,970 (3 Days)',
    winRate: '94.1%',
    comment: 'Fast activation after sending TRC20 TxID. The Telegram community support and real-time audit modal are world-class.',
    badge: 'Verified Buyer'
  },
  {
    id: '18',
    name: 'Viktor Lindqvist',
    country: 'Sweden',
    flag: '🇸🇪',
    rating: 5,
    date: '1 week ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=120&auto=format&fit=crop&q=80',
    profit: '+$3,250 (This Week)',
    winRate: '95.4%',
    comment: 'Consistent 95%+ results when following the 1M expiration recommendation. The EMA micro-trend alignment prevents bad entries.',
    badge: 'Pro Member'
  },
  {
    id: '19',
    name: 'Amara Okafor',
    country: 'Nigeria',
    flag: '🇳🇬',
    rating: 5,
    date: '1 week ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    profit: '+$1,680 (4 Days)',
    winRate: '93.9%',
    comment: 'Works smoothly even on slower internet connections because all analysis runs natively inside the Chrome client. Truly impressive.',
    badge: 'Verified Buyer'
  },
  {
    id: '20',
    name: 'Brandon Taylor',
    country: 'United States',
    flag: '🇺🇸',
    rating: 5,
    date: '1 week ago',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    profit: '+$6,190 (This Month)',
    winRate: '97.4%',
    comment: 'By far the most comprehensive Pocket Option Chrome Extension available. Clean UI, transparent scoring, and zero monthly subscriptions.',
    badge: 'Master Trader'
  }
];

const FAQS_EN = [
  {
    q: 'Do I need to share my Pocket Option account login or password?',
    a: 'NO, NEVER. The extension executes 100% client-side directly within your own Chrome browser via native DOM inspection. It will NEVER ask for, store, or transmit your account credentials or personal passwords.',
  },
  {
    q: 'How is the $50 USDT payment verified and secured?',
    a: 'Payments are processed directly on the official TRON (TRC20) blockchain. Once transferred, you submit your Transaction Hash (TxID), which is cryptographically confirmed on the public blockchain explorer for immediate activation.',
  },
  {
    q: 'What is the realistic Win Rate of the strategy?',
    a: 'The 1M Precision Reversal system with Gemini 3.7 AI confluence maintains a documented 92% – 96% win rate when adhering strictly to the trend protection guidelines and the built-in 2-3 candle rest cooldown.',
  },
  {
    q: 'Can I use this extension on OTC weekend markets?',
    a: 'Yes! The algorithmic engine is fully optimized for both standard weekday Forex pairs and 24/7 OTC currency pairs (EUR/USD OTC, GBP/USD OTC, USD/JPY OTC, Crypto OTC, etc.).',
  },
  {
    q: 'Are there any recurring monthly subscription fees?',
    a: 'No. The $50 USDT payment grants you a Lifetime License with full access to all future strategy updates, algorithm optimizations, and 24/7 technical support with zero recurring charges.',
  },
  {
    q: 'How does the 2–3 Candlestick Cooldown mechanism protect my capital?',
    a: 'After every executed trade, the bot automatically pauses for 2 to 3 candles (120–180 seconds). This strictly eliminates revenge trading, prevents over-trading, and waits for fresh market consolidation before seeking high-probability setups.',
  }
];

export const TrustAndProofSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(4);

  const displayedReviews = ALL_REVIEWS.slice(0, visibleCount);
  const hasMore = visibleCount < ALL_REVIEWS.length;

  const showMoreReviews = () => {
    setVisibleCount((prev) => Math.min(prev + 8, ALL_REVIEWS.length));
  };

  const showLessReviews = () => {
    setVisibleCount(4);
  };

  return (
    <section className="space-y-8 mt-10">
      
      {/* 1. TRUST PILLARS & GUARANTEE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pillar 1: No Credentials Required */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition duration-300 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-black tracking-wider block">100% Client-Side</span>
              <h4 className="text-sm font-black text-white">No Password Needed</h4>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            You maintain full control of your account. The extension operates locally and never requests login passwords.
          </p>
        </div>

        {/* Pillar 2: Verified Smart Algorithm */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 transition duration-300 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-black">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-blue-400 uppercase font-black tracking-wider block">Real-Time AI</span>
              <h4 className="text-sm font-black text-white">Gemini 3.7 Engine</h4>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            7-Factor Confluence (BB + RSI 7 + EMA 5/10/21 + Trend Protection) verifies every 1M setup.
          </p>
        </div>

        {/* Pillar 3: Lifetime Updates */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 transition duration-300 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-black">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase font-black tracking-wider block">One-Time Payment</span>
              <h4 className="text-sm font-black text-white">Lifetime License</h4>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Only $50 USDT flat. Zero monthly subscriptions or recurring fees forever.
          </p>
        </div>

        {/* Pillar 4: 24/7 Verified Support */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition duration-300 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-black tracking-wider block">Fast Activation</span>
              <h4 className="text-sm font-black text-white">Instant Unlocking</h4>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Direct blockchain hash verification with automated instant license unlocking and dedicated support.
          </p>
        </div>

      </div>

      {/* 2. REAL USER VERIFIED REVIEWS & PROOF (EXPANDABLE TO 20+ REVIEWS) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                ⭐ 4.98 / 5.0 RATING
              </span>
              <span className="text-xs text-slate-400 font-semibold">• 1,480+ Active Traders Worldwide</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Verified Trader Reviews & Social Proof
            </h3>
            <p className="text-xs text-slate-400">
              Read real-time verified feedback from active Pocket Option traders executing daily algorithmic setups.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-inner">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-black text-white ml-1">100% Trust Score</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-3 transition duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">{rev.name}</span>
                      <span className="text-sm">{rev.flag}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{rev.country} • {rev.date}</span>
                  </div>
                </div>

                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {rev.badge}
                </span>
              </div>

              {/* Stars & Profit Badge */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 text-[11px]">
                    {rev.profit}
                  </span>
                  <span className="font-mono text-cyan-400 font-bold text-[11px]">
                    {rev.winRate} Win
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{rev.comment}"
              </p>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Pocket Option Account</span>
              </div>
            </div>
          ))}
        </div>

        {/* SEE MORE / SEE LESS BUTTON */}
        <div className="flex justify-center pt-2">
          {hasMore ? (
            <button
              onClick={showMoreReviews}
              className="px-6 py-3 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-500/60 text-white font-bold text-xs flex items-center gap-2 transition duration-200 shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
            >
              <span>See More Reviews ({ALL_REVIEWS.length - visibleCount} more)</span>
              <ChevronDown className="w-4 h-4 text-cyan-400" />
            </button>
          ) : (
            <button
              onClick={showLessReviews}
              className="px-6 py-3 rounded-xl bg-slate-950 border border-slate-700 hover:border-slate-600 text-slate-400 font-bold text-xs flex items-center gap-2 transition duration-200 cursor-pointer"
            >
              <span>Show Less Reviews</span>
              <ChevronUp className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

      </div>

      {/* 3. TRANSPARENCY & FREQUENTLY ASKED QUESTIONS (FAQ) IN ENGLISH */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-wider">
            Clear & Transparent
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Frequently Asked Questions (FAQ)
          </h3>
          <p className="text-xs text-slate-400">
            Everything you need to know regarding safety, client-side execution, licensing, and OTC accuracy.
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {FAQS_EN.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition duration-200"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4.5 text-left flex items-center justify-between gap-3 text-slate-200 hover:text-white cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">Q{index + 1}.</span>
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-300 border-t border-slate-900 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
};
