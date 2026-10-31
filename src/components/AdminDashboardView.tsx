import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  UserPlus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Search,
  Lock,
  Wallet,
  RefreshCw,
  AlertCircle,
  Zap,
  CreditCard,
  Eye,
  EyeOff,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ChevronRight,
  X,
  Award,
  Tag,
  Percent,
  Plus,
  Power,
} from 'lucide-react';
import { authService } from '../services/authService';
import {
  UserAccount,
  CryptoPaymentRequest,
  PromoCode,
  PromoDiscountType,
  OFFICIAL_USDT_TRC20_ADDRESS,
  SubscriptionPlan,
  AccountStatus,
  ADMIN_EMAIL,
  isAdminEmail,
} from '../types';
import { IQBotLogo } from './IQBotLogo';

type AdminTab = 'overview' | 'crypto' | 'cards' | 'users' | 'promos' | 'revenue';
type UserFilterCategory = 'ALL' | 'ACTIVE' | 'PENDING' | 'UNPAID' | 'SUSPENDED';

interface AdminDashboardViewProps {
  currentUser: UserAccount | null;
  onRefreshData: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<UserAccount[]>(() => authService.getUsers());
  const [payments, setPayments] = useState<CryptoPaymentRequest[]>(() => authService.getPayments());
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => authService.getPromoCodes());
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [userCategory, setUserCategory] = useState<UserFilterCategory>('ALL');
  const [cryptoStatusFilter, setCryptoStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [cardStatusFilter, setCardStatusFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED'>('ALL');

  // UI helpers
  const [copiedTxid, setCopiedTxid] = useState<string | null>(null);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [showCardNumbers, setShowCardNumbers] = useState<Record<string, boolean>>({});
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // Promo Code Creation Form State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoDiscountType, setPromoDiscountType] = useState<PromoDiscountType>('FIXED');
  const [promoDiscountValue, setPromoDiscountValue] = useState<string>('15');
  const [promoMaxUses, setPromoMaxUses] = useState<string>('');
  const [promoDescription, setPromoDescription] = useState<string>('');
  const [promoFormError, setPromoFormError] = useState<string | null>(null);

  // Inspection Modal (Detailed User/Payment Review)
  const [inspectUser, setInspectUser] = useState<UserAccount | null>(null);
  const [inspectPayment, setInspectPayment] = useState<CryptoPaymentRequest | null>(null);
  const [showInspectPin, setShowInspectPin] = useState(false);
  const [showInspectCardNumber, setShowInspectCardNumber] = useState(false);

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newPlan, setNewPlan] = useState<SubscriptionPlan>('LIFETIME');
  const [newStatus, setNewStatus] = useState<AccountStatus>('ACTIVE');
  const [modalError, setModalError] = useState<string | null>(null);

  const isAdmin = isAdminEmail(currentUser?.email);

  useEffect(() => {
    const syncData = () => {
      setUsers(authService.getUsers());
      setPayments(authService.getPayments());
      setPromoCodes(authService.getPromoCodes());
    };

    authService.forceSyncFromFirestore().then(() => {
      syncData();
    });

    window.addEventListener('po_auth_update', syncData);
    const timer = setInterval(syncData, 2500);

    return () => {
      window.removeEventListener('po_auth_update', syncData);
      clearInterval(timer);
    };
  }, []);

  const handleRefresh = async () => {
    setIsSyncingCloud(true);
    try {
      await authService.forceSyncFromFirestore();
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      const refreshedUsers = authService.getUsers();
      const refreshedPayments = authService.getPayments();
      const refreshedPromos = authService.getPromoCodes();
      setUsers(refreshedUsers);
      setPayments(refreshedPayments);
      setPromoCodes(refreshedPromos);
      
      // Update currently inspected user if open
      if (inspectUser) {
        const found = refreshedUsers.find(u => u.id === inspectUser.id || u.uid === inspectUser.uid || u.email === inspectUser.email);
        if (found) setInspectUser(found);
      }
      if (inspectPayment) {
        const foundP = refreshedPayments.find(p => p.id === inspectPayment.id);
        if (foundP) setInspectPayment(foundP);
      }

      setIsSyncingCloud(false);
      onRefreshData();
    }
  };

  // Actions
  const handleApprovePayment = (paymentId: string) => {
    authService.approvePayment(paymentId);
    handleRefresh();
  };

  const handleRejectPayment = (paymentId: string) => {
    authService.rejectPayment(paymentId);
    handleRefresh();
  };

  const handleApproveUser = (userIdOrEmail: string) => {
    authService.approveUser(userIdOrEmail);
    handleRefresh();
  };

  const handleRejectUser = (userIdOrEmail: string) => {
    authService.rejectUser(userIdOrEmail);
    handleRefresh();
  };

  const handleToggleStatus = (userId: string, newStatus: AccountStatus) => {
    authService.setUserStatus(userId, newStatus);
    handleRefresh();
  };

  const handleDeleteUser = (userId: string) => {
    authService.deleteUser(userId);
    if (inspectUser && (inspectUser.id === userId || inspectUser.uid === userId)) {
      setInspectUser(null);
    }
    setAdminNotice('User account deleted.');
    setTimeout(() => setAdminNotice(null), 3000);
    handleRefresh();
  };

  const handleActivateAll = () => {
    const count = authService.activateAllUsers();
    setAdminNotice(`Activated ${count} user(s) successfully!`);
    setTimeout(() => setAdminNotice(null), 3500);
    handleRefresh();
  };

  const handleCreatePromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoFormError(null);
    const numVal = Number(promoDiscountValue);
    if (!promoCodeInput.trim()) {
      setPromoFormError('Please enter a promo code name (e.g. VIP20).');
      return;
    }
    if (Number.isNaN(numVal) || numVal <= 0) {
      setPromoFormError('Please enter a valid discount amount greater than 0.');
      return;
    }
    const maxUsesNum = promoMaxUses.trim() ? Number(promoMaxUses) : 0;
    const res = authService.createPromoCode({
      code: promoCodeInput,
      discountType: promoDiscountType,
      discountValue: numVal,
      maxUses: maxUsesNum > 0 ? maxUsesNum : 0,
      description: promoDescription,
    });
    if (!res.success || !res.promo) {
      setPromoFormError(res.error || 'Could not create promo code.');
      return;
    }
    setPromoCodes(authService.getPromoCodes());
    setPromoCodeInput('');
    setPromoDescription('');
    setPromoMaxUses('');
    setAdminNotice(`Promo code "${res.promo.code}" saved!`);
    setTimeout(() => setAdminNotice(null), 3500);
  };

  const handleGenerateRandomPromo = () => {
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    setPromoCodeInput(`VIP${suffix}`);
  };

  const handleTogglePromo = (id: string) => {
    authService.togglePromoCodeStatus(id);
    setPromoCodes(authService.getPromoCodes());
  };

  const handleDeletePromo = (id: string) => {
    authService.deletePromoCode(id);
    setPromoCodes(authService.getPromoCodes());
    setAdminNotice('Promo code deleted.');
    setTimeout(() => setAdminNotice(null), 3000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCopyTxid = (txid: string) => {
    navigator.clipboard.writeText(txid);
    setCopiedTxid(txid);
    setTimeout(() => setCopiedTxid(null), 2000);
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(OFFICIAL_USDT_TRC20_ADDRESS);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const toggleShowCardNumber = (id: string) => {
    setShowCardNumbers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openUserInspection = (user: UserAccount) => {
    setInspectUser(user);
    // find related crypto payment if any
    const matchingPayment = payments.find(
      p => p.userId === user.id || p.userId === user.uid || (p.userEmail && p.userEmail.toLowerCase() === user.email.toLowerCase())
    );
    setInspectPayment(matchingPayment || null);
    setShowInspectPin(false);
    setShowInspectCardNumber(false);
  };

  const openPaymentInspection = (payment: CryptoPaymentRequest) => {
    setInspectPayment(payment);
    const matchingUser = users.find(
      u => u.id === payment.userId || u.uid === payment.userId || (u.email && u.email.toLowerCase() === payment.userEmail.toLowerCase())
    );
    setInspectUser(matchingUser || null);
    setShowInspectPin(false);
    setShowInspectCardNumber(false);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!newEmail.trim()) {
      setModalError('Please enter a valid user email.');
      return;
    }

    const res = authService.createUserByAdmin(newEmail, newPassword, newPlan, newStatus);
    if (res.success) {
      setShowCreateModal(false);
      setNewEmail('');
      setNewPassword('123456');
      handleRefresh();
    } else {
      setModalError(res.error || 'Failed to create user.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-100">Admin Access Required</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You are currently logged in as <span className="font-mono text-slate-200">{currentUser?.email || 'Guest'}</span>. Only the primary administrator (<span className="font-mono text-amber-400 font-bold">{ADMIN_EMAIL}</span>) can access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  // --- DERIVED DATA & METRICS ---
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'ACTIVE' || u.approved).length;
  const pendingUsers = users.filter(u => u.status === 'PENDING');
  const unpaidUsers = users.filter(u => {
    const hasCrypto = !!u.txid || payments.some(p => p.userId === u.id || p.userId === u.uid || p.userEmail?.toLowerCase() === u.email.toLowerCase());
    const hasCard = !!u.cardDetails;
    return !hasCrypto && !hasCard && u.status !== 'ACTIVE' && !u.approved;
  });
  const suspendedUsers = users.filter(u => u.status === 'SUSPENDED' || u.status === 'REJECTED');

  // Crypto Metrics
  const cryptoPaymentsList = payments;
  const pendingCryptoPayments = payments.filter(p => p.status === 'PENDING');
  const approvedCryptoPayments = payments.filter(p => p.status === 'APPROVED');
  const totalCryptoRevenue = approvedCryptoPayments.reduce((sum, p) => sum + (p.amountUSDT || 50), 0);

  // Card Metrics
  const cardUsersList = users.filter(u => !!u.cardDetails);
  const pendingCardUsers = cardUsersList.filter(u => u.status === 'PENDING');
  const approvedCardUsers = cardUsersList.filter(u => u.status === 'ACTIVE' || u.approved);
  const totalCardRevenue = approvedCardUsers.reduce((sum, u) => sum + (u.paymentAmountUSDT || 50), 0);

  // Total Gross Revenue
  const totalGrossRevenue = totalCryptoRevenue + totalCardRevenue;
  const pendingPotentialRevenue = (pendingCryptoPayments.length + pendingCardUsers.length) * 50;

  // Filtered Crypto Payments
  const filteredCryptoPayments = cryptoPaymentsList.filter(p => {
    const term = (searchTerm || '').trim().toLowerCase();
    const matchesSearch = !term || p.userEmail.toLowerCase().includes(term) || (p.txid && p.txid.toLowerCase().includes(term));
    const matchesStatus = cryptoStatusFilter === 'ALL' || p.status === cryptoStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Card Payments
  const filteredCardUsers = cardUsersList.filter(u => {
    const term = (searchTerm || '').trim().toLowerCase();
    const uEmail = (u.email || '').toLowerCase();
    const cardHolder = (u.cardDetails?.cardHolderName || '').toLowerCase();
    const last4 = (u.cardDetails?.cardNumber || '').slice(-4);
    const matchesSearch = !term || uEmail.includes(term) || cardHolder.includes(term) || last4.includes(term);
    const matchesStatus =
      cardStatusFilter === 'ALL' ||
      (cardStatusFilter === 'PENDING' && u.status === 'PENDING') ||
      (cardStatusFilter === 'ACTIVE' && (u.status === 'ACTIVE' || u.approved)) ||
      (cardStatusFilter === 'REJECTED' && u.status === 'REJECTED');
    return matchesSearch && matchesStatus;
  });

  // Filtered Users Directory
  const filteredUsers = users.filter(u => {
    const term = (searchTerm || '').trim().toLowerCase();
    const uEmail = (u.email || '').toLowerCase();
    const matchesSearch = !term || uEmail.includes(term);

    if (!matchesSearch) return false;

    if (userCategory === 'ALL') return true;
    if (userCategory === 'ACTIVE') return u.status === 'ACTIVE' || u.approved;
    if (userCategory === 'PENDING') return u.status === 'PENDING';
    if (userCategory === 'UNPAID') {
      const hasCrypto = !!u.txid || payments.some(p => p.userId === u.id || p.userId === u.uid || p.userEmail?.toLowerCase() === u.email.toLowerCase());
      const hasCard = !!u.cardDetails;
      return !hasCrypto && !hasCard && u.status !== 'ACTIVE' && !u.approved;
    }
    if (userCategory === 'SUSPENDED') return u.status === 'SUSPENDED' || u.status === 'REJECTED';

    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 overflow-x-hidden animate-in fade-in duration-300 font-sans">
      
      {/* 1. TOP BRANDED ADMIN HEADER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <IQBotLogo size="md" showSubtitle={true} />
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-extrabold flex items-center gap-1.5 shadow-sm">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              ENTERPRISE ADMIN CONSOLE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 max-w-2xl">
            Control platform subscriptions, review USDT TRC20 & Mastercard payments, inspect user credentials, and manage automated bot access.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={isSyncingCloud}
            className={`flex items-center gap-1.5 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition cursor-pointer shadow ${
              isSyncingCloud ? 'opacity-75' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span>{isSyncingCloud ? 'Syncing Cloud...' : 'Sync Firestore DB'}</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Direct User (Free / Direct)</span>
          </button>

          <button
            onClick={() => setActiveTab('promos')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-cyan-600/20 transition cursor-pointer"
          >
            <Tag className="w-4 h-4" />
            <span>+ Add Promo Code</span>
          </button>
        </div>
      </div>

      {adminNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {adminNotice}
          </span>
          <button onClick={() => setAdminNotice(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. NAVIGATION BAR (SECTIONS & TABS) */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-950/90 border border-slate-800/90 rounded-2xl overflow-x-auto shadow-inner backdrop-blur-md">
        
        {/* Tab: Overview */}
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Overview & Stats</span>
        </button>

        {/* Tab: Crypto Payments */}
        <button
          onClick={() => setActiveTab('crypto')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'crypto'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span>Crypto (USDT TRC20)</span>
          {pendingCryptoPayments.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
              {pendingCryptoPayments.length}
            </span>
          )}
        </button>

        {/* Tab: Mastercard Payments */}
        <button
          onClick={() => setActiveTab('cards')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'cards'
              ? 'bg-gradient-to-r from-rose-600 to-orange-600 text-white shadow-lg shadow-rose-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <CreditCard className="w-4 h-4 text-rose-400" />
          <span>Mastercard Submissions</span>
          {pendingCardUsers.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
              {pendingCardUsers.length}
            </span>
          )}
        </button>

        {/* Tab: All Users Directory */}
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Users className="w-4 h-4 text-purple-400" />
          <span>All Users Directory</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
            {totalUsers}
          </span>
        </button>

        {/* Tab: Promo Codes & Discounts */}
        <button
          onClick={() => setActiveTab('promos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'promos'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Tag className="w-4 h-4 text-cyan-400" />
          <span>Promo Codes & Discounts</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
            {promoCodes.filter(p => p.active).length}
          </span>
        </button>

        {/* Tab: Revenue & Financials */}
        <button
          onClick={() => setActiveTab('revenue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 ${
            activeTab === 'revenue'
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <DollarSign className="w-4 h-4 text-teal-400" />
          <span>Revenue & Financials</span>
        </button>

      </div>

      {/* 3. ACTIVE TAB CONTENT */}

      {/* ======================= TAB 1: OVERVIEW & STATS ======================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Users Card */}
            <div 
              onClick={() => setActiveTab('users')}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition cursor-pointer shadow-lg group"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Total Registered</span>
                <Users className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
              </div>
              <div className="text-3xl font-black text-slate-100 font-mono mt-2">{totalUsers}</div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                <span>Active: <strong className="text-emerald-400 font-mono">{activeUsers}</strong></span>
                <span>Pending: <strong className="text-amber-400 font-mono">{pendingUsers.length}</strong></span>
              </div>
            </div>

            {/* Total Gross Revenue */}
            <div 
              onClick={() => setActiveTab('revenue')}
              className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 hover:border-teal-500/50 transition cursor-pointer shadow-lg group"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Total Collected Revenue</span>
                <DollarSign className="w-4 h-4 text-teal-400 group-hover:scale-110 transition" />
              </div>
              <div className="text-3xl font-black text-teal-300 font-mono mt-2">${totalGrossRevenue} USD</div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>Crypto: <strong className="text-emerald-400 font-mono">${totalCryptoRevenue}</strong></span>
                <span>Cards: <strong className="text-rose-400 font-mono">${totalCardRevenue}</strong></span>
              </div>
            </div>

            {/* Pending Crypto TRC20 */}
            <div 
              onClick={() => setActiveTab('crypto')}
              className={`p-5 rounded-2xl border transition cursor-pointer shadow-lg group ${
                pendingCryptoPayments.length > 0
                  ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Pending USDT TRC20</span>
                <Wallet className={`w-4 h-4 ${pendingCryptoPayments.length > 0 ? 'text-amber-400 animate-spin' : 'text-slate-500'}`} />
              </div>
              <div className="text-3xl font-black text-amber-400 font-mono mt-2 flex items-center justify-between">
                <span>{pendingCryptoPayments.length}</span>
                {pendingCryptoPayments.length > 0 && (
                  <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-sans font-extrabold">
                    REVIEW
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-2">Value: ${pendingCryptoPayments.length * 50} USDT</div>
            </div>

            {/* Pending Mastercard Submissions */}
            <div 
              onClick={() => setActiveTab('cards')}
              className={`p-5 rounded-2xl border transition cursor-pointer shadow-lg group ${
                pendingCardUsers.length > 0
                  ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                <span>Pending Cards</span>
                <CreditCard className="w-4 h-4 text-rose-400 group-hover:scale-110 transition" />
              </div>
              <div className="text-3xl font-black text-rose-400 font-mono mt-2 flex items-center justify-between">
                <span>{pendingCardUsers.length}</span>
                {pendingCardUsers.length > 0 && (
                  <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-sans font-extrabold">
                    REVIEW
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-2">Value: ${pendingCardUsers.length * 50} USD</div>
            </div>

          </div>

          {/* Pending Action Queue (If any pending payments exist) */}
          {(pendingCryptoPayments.length > 0 || pendingCardUsers.length > 0) && (
            <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-rose-950/30 border border-amber-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Urgent Payment Verifications Awaiting Admin
                  </h3>
                </div>
                <span className="text-xs text-amber-300 font-mono font-bold">
                  {pendingCryptoPayments.length + pendingCardUsers.length} Total Submissions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Pending Crypto Preview */}
                {pendingCryptoPayments.slice(0, 3).map(pay => (
                  <div
                    key={pay.id}
                    onClick={() => openPaymentInspection(pay)}
                    className="p-3 bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl flex items-center justify-between gap-2 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        USDT
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{pay.userEmail}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">TXID: {pay.txid}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400 block">${pay.amountUSDT} USDT</span>
                      <span className="text-[10px] text-cyan-400 hover:underline flex items-center justify-end gap-0.5">
                        Inspect <ArrowUpRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                ))}

                {/* Pending Card Preview */}
                {pendingCardUsers.slice(0, 3).map(usr => (
                  <div
                    key={usr.id}
                    onClick={() => openUserInspection(usr)}
                    className="p-3 bg-slate-950/80 border border-slate-800 hover:border-rose-500/50 rounded-xl flex items-center justify-between gap-2 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                        CARD
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{usr.email}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {usr.cardDetails?.cardHolderName || 'Cardholder'} •••• {usr.cardDetails?.cardNumber.slice(-4)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-rose-400 block">$50 USD</span>
                      <span className="text-[10px] text-cyan-400 hover:underline flex items-center justify-end gap-0.5">
                        Inspect <ArrowUpRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions & Receiving Wallet Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  Official USDT TRC-20 Payment Wallet
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    RECEIVING ADDRESS
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-blue-300 mt-0.5 select-all">
                  {OFFICIAL_USDT_TRC20_ADDRESS}
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyWallet}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedWallet ? 'Copied!' : 'Copy Wallet'}</span>
            </button>
          </div>

        </div>
      )}

      {/* ======================= TAB 2: CRYPTO (USDT TRC20) ======================= */}
      {activeTab === 'crypto' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl animate-in fade-in duration-200">
          
          {/* Header & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span>USDT TRC20 Payment Submissions</span>
                <span className="px-2 py-0.5 text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg">
                  {filteredCryptoPayments.length} records
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Click any row to open the complete payment inspection dialog with 1-click verification on Tronscan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search email or TXID..."
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={cryptoStatusFilter}
                onChange={(e) => setCryptoStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {filteredCryptoPayments.length === 0 ? (
            <div className="p-12 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 text-xs text-slate-500">
              No crypto payments found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4">User Email</th>
                    <th className="py-3 px-4">Plan / Amount</th>
                    <th className="py-3 px-4">TRC20 TXID Hash</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  {filteredCryptoPayments.map((pay) => (
                    <tr
                      key={pay.id}
                      onClick={() => openPaymentInspection(pay)}
                      className="hover:bg-slate-800/50 transition cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-bold text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="group-hover:text-emerald-300 transition">{pay.userEmail}</span>
                          <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition">
                            (Click to Inspect)
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className="text-emerald-400 font-bold">${pay.amountUSDT} USDT</span>
                        <span className="text-slate-400 text-[10px] ml-1.5 font-sans">(LIFETIME)</span>
                        {pay.promoCode && (
                          <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                            Promo: {pay.promoCode} (-${pay.discountAmountUSDT || 0})
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-300" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[160px] text-cyan-300">{pay.txid}</span>
                          <button
                            onClick={() => handleCopyTxid(pay.txid)}
                            title="Copy TXID"
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                          >
                            {copiedTxid === pay.txid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                          <a
                            href={`https://tronscan.org/#/transaction/${pay.txid}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Verify on TRONSCAN"
                            className="p-1 hover:bg-slate-800 rounded text-blue-400"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            pay.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : pay.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {pay.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(pay.submittedAt).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        {pay.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprovePayment(pay.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-lg transition active:scale-95 shadow cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectPayment(pay.id)}
                              className="px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/30 font-bold text-[11px] rounded-lg transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openPaymentInspection(pay)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-lg transition cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 3: MASTERCARD SUBMISSIONS ======================= */}
      {activeTab === 'cards' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl animate-in fade-in duration-200">
          
          {/* Header & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-rose-400" />
                <span>Mastercard Payment Submissions</span>
                <span className="px-2 py-0.5 text-xs font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg">
                  {filteredCardUsers.length} cardholders
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                View cardholder name, card number, expiration date, and PIN. Click any row to inspect complete details and activate access.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search name, email, card..."
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <select
                value={cardStatusFilter}
                onChange={(e) => setCardStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="ACTIVE">ACTIVE / APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {filteredCardUsers.length === 0 ? (
            <div className="p-12 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 text-xs text-slate-500">
              No Mastercard payment submissions found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4">Cardholder / Email</th>
                    <th className="py-3 px-4">Card Number</th>
                    <th className="py-3 px-4">Expiry (MM/YY)</th>
                    <th className="py-3 px-4">PIN / CVV</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  {filteredCardUsers.map((usr) => {
                    const card = usr.cardDetails;
                    const isVisible = showCardNumbers[usr.id];
                    return (
                      <tr
                        key={usr.id}
                        onClick={() => openUserInspection(usr)}
                        className="hover:bg-slate-800/50 transition cursor-pointer group"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-200 group-hover:text-rose-300 transition">
                            {card?.cardHolderName || 'Cardholder'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{usr.email}</div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-200" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <span>
                              {isVisible
                                ? card?.cardNumber
                                : `•••• •••• •••• ${card?.cardNumber.slice(-4)}`}
                            </span>
                            <button
                              onClick={() => toggleShowCardNumber(usr.id)}
                              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                              title={isVisible ? 'Hide' : 'Reveal'}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopy(card?.cardNumber || '', 'Card Number')}
                              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                              title="Copy Card Number"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                          {card?.expiryDate}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-amber-300">
                          {isVisible ? card?.pin : '••••'}
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              usr.status === 'ACTIVE' || usr.approved
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : usr.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {usr.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {usr.paymentDate ? new Date(usr.paymentDate).toLocaleString() : 'Recent'}
                        </td>

                        <td className="py-3 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          {usr.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApproveUser(usr.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-lg transition active:scale-95 shadow cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectUser(usr.id)}
                                className="px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/30 font-bold text-[11px] rounded-lg transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openUserInspection(usr)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-lg transition cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ======================= TAB 4: ALL USERS DIRECTORY ======================= */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl animate-in fade-in duration-200">
          
          {/* Header & Category Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Complete Platform Users Directory</span>
                <span className="px-2 py-0.5 text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg">
                  {filteredUsers.length} total
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Active subscribers, pending verifications, unpaid registrations, and system accounts. Click any user to inspect and change permissions.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleActivateAll}
                title="Activate all users in database so they can log in to bot"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Activate All for Bot</span>
              </button>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search user email..."
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Sub-tabs for User Categories */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setUserCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                userCategory === 'ALL' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Users ({totalUsers})
            </button>
            <button
              onClick={() => setUserCategory('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                userCategory === 'ACTIVE' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              Active Subscribers ({activeUsers})
            </button>
            <button
              onClick={() => setUserCategory('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                userCategory === 'PENDING' ? 'bg-amber-500 text-slate-950 shadow' : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              Pending Reviews ({pendingUsers.length})
            </button>
            <button
              onClick={() => setUserCategory('UNPAID')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                userCategory === 'UNPAID' ? 'bg-slate-700 text-slate-200 shadow' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Unpaid / No Payment ({unpaidUsers.length})
            </button>
            <button
              onClick={() => setUserCategory('SUSPENDED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                userCategory === 'SUSPENDED' ? 'bg-rose-600 text-white shadow' : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              Suspended / Rejected ({suspendedUsers.length})
            </button>
          </div>

          {/* Users Table */}
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 text-xs text-slate-500">
              No users found in this category.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4">User Account</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Expires At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  {filteredUsers.map((usr) => {
                    const hasCrypto = !!usr.txid || payments.some(p => p.userId === usr.id || p.userId === usr.uid || p.userEmail?.toLowerCase() === usr.email.toLowerCase());
                    const hasCard = !!usr.cardDetails;
                    return (
                      <tr
                        key={usr.id}
                        onClick={() => openUserInspection(usr)}
                        className="hover:bg-slate-800/50 transition cursor-pointer group"
                      >
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="group-hover:text-purple-300 transition">{usr.email}</span>
                            {isAdminEmail(usr.email) && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold border border-amber-500/30">
                                PRIMARY ADMIN
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {hasCard ? (
                            <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold flex items-center gap-1 w-fit">
                              <CreditCard className="w-3 h-3" />
                              Mastercard
                            </span>
                          ) : hasCrypto ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1 w-fit">
                              <Wallet className="w-3 h-3" />
                              USDT TRC20
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono w-fit block">
                              Direct / Unpaid
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              usr.status === 'ACTIVE' || usr.approved
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : usr.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {usr.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300">
                          {usr.plan}
                        </td>

                        <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                          {new Date(usr.expiresAt).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          {!isAdminEmail(usr.email) && (
                            <>
                              <select
                                value={usr.status}
                                onChange={(e) => handleToggleStatus(usr.id, e.target.value as AccountStatus)}
                                className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300 font-bold focus:outline-none"
                              >
                                <option value="ACTIVE">Set ACTIVE</option>
                                <option value="PENDING">Set PENDING</option>
                                <option value="SUSPENDED">Set SUSPENDED</option>
                                <option value="REJECTED">Set REJECTED</option>
                              </select>

                              <button
                                onClick={() => openUserInspection(usr)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold transition"
                              >
                                Details
                              </button>

                              <button
                                onClick={() => handleDeleteUser(usr.id)}
                                title="Delete Account"
                                className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ======================= TAB 5: REVENUE & FINANCIALS ======================= */}
      {activeTab === 'revenue' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Total Gross */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950/50 to-slate-900 border border-teal-500/40 shadow-xl">
              <div className="flex items-center justify-between text-teal-400 text-xs font-bold uppercase tracking-wider">
                <span>Gross Realized Earnings</span>
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-4xl font-black text-white font-mono mt-3">${totalGrossRevenue} USD</div>
              <p className="text-xs text-slate-400 mt-2">
                From {approvedCryptoPayments.length + approvedCardUsers.length} total approved transactions across all channels.
              </p>
            </div>

            {/* Crypto Revenue Breakdown */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-xl">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <span>USDT (TRC-20) Collections</span>
                <Wallet className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-emerald-300 font-mono mt-3">${totalCryptoRevenue} USDT</div>
              <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                <span>Approved: <strong>{approvedCryptoPayments.length}</strong></span>
                <span>Pending: <strong className="text-amber-400">{pendingCryptoPayments.length}</strong></span>
              </div>
            </div>

            {/* Card Revenue Breakdown */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-xl">
              <div className="flex items-center justify-between text-rose-400 text-xs font-bold uppercase tracking-wider">
                <span>Mastercard Collections</span>
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-rose-300 font-mono mt-3">${totalCardRevenue} USD</div>
              <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                <span>Approved: <strong>{approvedCardUsers.length}</strong></span>
                <span>Pending: <strong className="text-rose-400">{pendingCardUsers.length}</strong></span>
              </div>
            </div>

          </div>

          {/* Revenue Analytics Details */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Financial Breakdown & Pipeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Pending Potential</div>
                <div className="text-xl font-bold font-mono text-amber-400 mt-1">${pendingPotentialRevenue} USD</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Awaiting Admin approval</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Standard Plan Price</div>
                <div className="text-xl font-bold font-mono text-cyan-300 mt-1">$50.00</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Lifetime License</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Approval Rate</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{activeUsers} of {totalUsers} users active</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Receiving Network</div>
                <div className="text-xl font-bold font-mono text-blue-400 mt-1">TRON (TRC20)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Instant settlement</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================= TAB: PROMO CODES & DISCOUNTS ======================= */}
      {activeTab === 'promos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Add Promo Code Form */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/95 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Add Promo Code</h3>
                    <p className="text-[11px] text-slate-400">Set promo code & discount given on $50 VIP plan</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreatePromoCode} className="space-y-3.5 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Promo Code Label
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomPromo}
                      className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      Auto-Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                    placeholder="e.g. SOMFX15 or VIP20"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono font-bold uppercase text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Discount Type
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPromoDiscountType('FIXED')}
                      className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        promoDiscountType === 'FIXED'
                          ? 'bg-cyan-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Fixed Amount ($ Off)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromoDiscountType('PERCENT')}
                      className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        promoDiscountType === 'PERCENT'
                          ? 'bg-cyan-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>Percentage (% Off)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      {promoDiscountType === 'FIXED' ? 'Discount Amount ($ USDT)' : 'Discount Percent (%)'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={promoDiscountType === 'FIXED' ? '50' : '100'}
                      step="1"
                      required
                      value={promoDiscountValue}
                      onChange={(e) => setPromoDiscountValue(e.target.value)}
                      placeholder={promoDiscountType === 'FIXED' ? '15' : '30'}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono font-bold text-emerald-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Max Uses (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={promoMaxUses}
                      onChange={(e) => setPromoMaxUses(e.target.value)}
                      placeholder="Unlimited"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Note / Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={promoDescription}
                    onChange={(e) => setPromoDescription(e.target.value)}
                    placeholder="e.g. Special Telegram VIP Discount"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Live Discount Preview */}
                {(() => {
                  const val = Math.max(0, Number(promoDiscountValue) || 0);
                  const rawDisc = promoDiscountType === 'PERCENT' ? (50 * Math.min(100, val)) / 100 : Math.min(50, val);
                  const disc = Number(rawDisc.toFixed(2));
                  const userPays = Math.max(0, Number((50 - disc).toFixed(2)));
                  return (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Base Lifetime VIP Plan:</span>
                        <span className="text-slate-200 font-bold">$50.00 USDT</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-400">
                        <span>Discount Given to User:</span>
                        <span className="font-bold">-${disc.toFixed(2)} USDT</span>
                      </div>
                      <div className="flex items-center justify-between text-white border-t border-slate-800 pt-1.5 text-xs">
                        <span className="font-sans font-bold">Final Amount User Pays:</span>
                        <span className="text-cyan-300 font-black">${userPays.toFixed(2)} USDT</span>
                      </div>
                    </div>
                  );
                })()}

                {promoFormError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px]">
                    {promoFormError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Promo Code</span>
                </button>
              </form>
            </div>

            {/* Promo Codes Directory Table */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/95 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-black text-white">Active & Saved Promo Codes</h3>
                  <p className="text-[11px] text-slate-400">
                    Users enter these codes in the $50 Payment Checkout to receive instant discounts
                  </p>
                </div>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  {promoCodes.length} Total
                </span>
              </div>

              {promoCodes.length === 0 ? (
                <div className="py-12 text-center space-y-2 border border-dashed border-slate-800 rounded-2xl">
                  <Tag className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-300">No Promo Codes Created Yet</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Use the form on the left to add a promo code and set the discount amount users receive on the $50 Lifetime VIP plan.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                        <th className="py-3 px-3.5">Promo Code</th>
                        <th className="py-3 px-3.5">Discount Given</th>
                        <th className="py-3 px-3.5">User Pays</th>
                        <th className="py-3 px-3.5">Uses</th>
                        <th className="py-3 px-3.5">Status</th>
                        <th className="py-3 px-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 bg-slate-900/60">
                      {promoCodes.map((promo) => {
                        const rawDisc =
                          promo.discountType === 'PERCENT'
                            ? (50 * promo.discountValue) / 100
                            : promo.discountValue;
                        const discUSDT = Math.min(50, Math.max(0, Number(rawDisc.toFixed(2))));
                        const finalUSDT = Math.max(0, Number((50 - discUSDT).toFixed(2)));
                        return (
                          <tr key={promo.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3 px-3.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-cyan-300 text-xs">
                                  {promo.code}
                                </span>
                                <button
                                  onClick={() => handleCopy(promo.code, `Promo ${promo.code}`)}
                                  title="Copy Promo Code"
                                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                              {promo.description && (
                                <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[160px]">
                                  {promo.description}
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-3.5 font-mono">
                              <span className="text-emerald-400 font-bold">-${discUSDT} USDT</span>
                              {promo.discountType === 'PERCENT' && (
                                <span className="text-[10px] text-slate-400 ml-1">
                                  ({promo.discountValue}%)
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3.5 font-mono font-black text-white">
                              ${finalUSDT} USDT
                            </td>

                            <td className="py-3 px-3.5 font-mono text-slate-300">
                              {promo.usageCount || 0}
                              {promo.maxUses && promo.maxUses > 0 ? ` / ${promo.maxUses}` : ' / ∞'}
                            </td>

                            <td className="py-3 px-3.5 font-mono text-[10px] font-bold">
                              <span className={promo.active ? 'text-emerald-400' : 'text-slate-500'}>
                                {promo.active ? 'ACTIVE' : 'PAUSED'}
                              </span>
                            </td>

                            <td className="py-3 px-3.5 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleTogglePromo(promo.id)}
                                  title={promo.active ? 'Pause Promo Code' : 'Activate Promo Code'}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                                    promo.active
                                      ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                                      : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                                  }`}
                                >
                                  <Power className="w-3 h-3" />
                                  <span>{promo.active ? 'Pause' : 'Enable'}</span>
                                </button>
                                <button
                                  onClick={() => handleDeletePromo(promo.id)}
                                  title="Delete Promo Code"
                                  className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. COMPREHENSIVE PAYMENT & IDENTITY INSPECTION MODAL */}
      {(inspectUser || inspectPayment) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Payment & User Verification Dialog</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {inspectUser?.email || inspectPayment?.userEmail}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setInspectUser(null);
                  setInspectPayment(null);
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification Toast for modal copies */}
            {copiedText && (
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied {copiedText} to clipboard!</span>
              </div>
            )}

            {/* SECTION A: PAYMENT METHOD DATA */}
            {inspectUser?.cardDetails ? (
              /* CARD DETAILS VIEW */
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/30 border border-rose-500/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-rose-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">Mastercard Details</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-black">
                    $50.00 USD
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Cardholder Name */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Cardholder Name</div>
                    <div className="text-xs font-bold text-white mt-1 flex items-center justify-between">
                      <span>{inspectUser.cardDetails.cardHolderName}</span>
                      <button
                        onClick={() => handleCopy(inspectUser.cardDetails?.cardHolderName || '', 'Cardholder Name')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                        title="Copy Name"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Expiration Date (MM/YY)</div>
                    <div className="text-xs font-bold font-mono text-cyan-300 mt-1 flex items-center justify-between">
                      <span>{inspectUser.cardDetails.expiryDate}</span>
                      <button
                        onClick={() => handleCopy(inspectUser.cardDetails?.expiryDate || '', 'Expiry Date')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Number */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 sm:col-span-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-mono">
                      <span>Card Number (16-Digits)</span>
                      <button
                        onClick={() => setShowInspectCardNumber(!showInspectCardNumber)}
                        className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {showInspectCardNumber ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showInspectCardNumber ? 'Hide' : 'Reveal Number'}</span>
                      </button>
                    </div>
                    <div className="text-sm font-black font-mono text-white mt-1.5 flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="tracking-widest">
                        {showInspectCardNumber
                          ? inspectUser.cardDetails.cardNumber
                          : `•••• •••• •••• ${inspectUser.cardDetails.cardNumber.slice(-4)}`}
                      </span>
                      <button
                        onClick={() => handleCopy(inspectUser.cardDetails?.cardNumber || '', 'Card Number')}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Card</span>
                      </button>
                    </div>
                  </div>

                  {/* PIN / CVV */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 sm:col-span-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-mono">
                      <span>Card PIN / Security Code</span>
                      <button
                        onClick={() => setShowInspectPin(!showInspectPin)}
                        className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {showInspectPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showInspectPin ? 'Hide PIN' : 'Reveal PIN'}</span>
                      </button>
                    </div>
                    <div className="text-sm font-black font-mono text-amber-300 mt-1.5 flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="tracking-widest">{showInspectPin ? inspectUser.cardDetails.pin : '••••'}</span>
                      <button
                        onClick={() => handleCopy(inspectUser.cardDetails?.pin || '', 'PIN')}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy PIN</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : inspectPayment || inspectUser?.txid ? (
              /* CRYPTO USDT TRC20 VIEW */
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30 border border-emerald-500/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">USDT (TRC-20) Payment</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-black">
                    TRON BLOCKCHAIN
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Submitted TRC20 TXID Hash</div>
                    <div className="text-xs font-bold font-mono text-cyan-300 mt-1 flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800 break-all select-all">
                      <span>{inspectPayment?.txid || inspectUser?.txid}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleCopy(inspectPayment?.txid || inspectUser?.txid || '', 'TXID')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy TXID</span>
                      </button>

                      <a
                        href={`https://tronscan.org/#/transaction/${inspectPayment?.txid || inspectUser?.txid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Verify on Tronscan</span>
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Amount Required</div>
                      <div className="text-sm font-black font-mono text-emerald-400 mt-0.5">
                        ${inspectPayment?.amountUSDT ?? inspectUser?.paymentAmountUSDT ?? 50} USDT
                      </div>
                      {(inspectPayment?.promoCode || inspectUser?.promoCode) && (
                        <div className="text-[10px] font-mono text-cyan-400 mt-0.5">
                          Promo: {inspectPayment?.promoCode || inspectUser?.promoCode} (-$
                          {inspectPayment?.discountAmountUSDT || inspectUser?.discountAmountUSDT || 0} off $50)
                        </div>
                      )}
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Official Wallet Target</div>
                      <div className="text-xs font-bold font-mono text-slate-300 mt-0.5 truncate">{OFFICIAL_USDT_TRC20_ADDRESS}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* DIRECT / NO PAYMENT VIEW */
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <span className="text-xs font-bold text-slate-300">Direct User Account</span>
                <p className="text-[11px] text-slate-500">
                  No crypto TXID or card payment has been submitted by this user yet.
                </p>
              </div>
            )}

            {/* SECTION B: USER PROFILE & ACCESS STATE */}
            {inspectUser && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Account Permissions & Status
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Account Status</span>
                    <span className={`font-black font-mono mt-0.5 block ${
                      inspectUser.status === 'ACTIVE' ? 'text-emerald-400' : inspectUser.status === 'PENDING' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {inspectUser.status}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Plan</span>
                    <span className="font-bold font-mono text-cyan-300 mt-0.5 block">{inspectUser.plan}</span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Role</span>
                    <span className="font-bold text-slate-200 mt-0.5 block">{inspectUser.role}</span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Expires</span>
                    <span className="font-mono text-slate-300 text-[11px] mt-0.5 block">
                      {new Date(inspectUser.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION C: ADMIN ACTION CONTROLS */}
            <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {inspectUser && (
                  <select
                    value={inspectUser.status}
                    onChange={(e) => handleToggleStatus(inspectUser.id, e.target.value as AccountStatus)}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none"
                  >
                    <option value="ACTIVE">Set Status: ACTIVE</option>
                    <option value="PENDING">Set Status: PENDING</option>
                    <option value="SUSPENDED">Set Status: SUSPENDED</option>
                    <option value="REJECTED">Set Status: REJECTED</option>
                  </select>
                )}

                {inspectUser && !isAdminEmail(inspectUser.email) && (
                  <button
                    onClick={() => handleDeleteUser(inspectUser.id)}
                    className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Approve Button */}
                <button
                  onClick={() => {
                    if (inspectPayment) handleApprovePayment(inspectPayment.id);
                    if (inspectUser) handleApproveUser(inspectUser.id);
                    setInspectUser(null);
                    setInspectPayment(null);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition active:scale-95 flex items-center gap-1.5 cursor-pointer uppercase"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Grant Full Access</span>
                </button>

                {/* Reject Button */}
                <button
                  onClick={() => {
                    if (inspectPayment) handleRejectPayment(inspectPayment.id);
                    if (inspectUser) handleRejectUser(inspectUser.id);
                    setInspectUser(null);
                    setInspectPayment(null);
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                Add Direct User Account
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-extrabold">
                NO PAYMENT NEEDED
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed space-y-1">
              <div className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Instant Activation Override</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Accounts created by Admin here are marked <strong className="text-emerald-400">ACTIVE</strong> immediately. The user can log in on both the PO AI Overlay and Chrome Extension without making a crypto or card payment.
              </p>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  User Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Initial Password
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="123456"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Plan Type
                  </label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as SubscriptionPlan)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="LIFETIME">Lifetime VIP ($50 / Free)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as AccountStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-extrabold text-emerald-400 focus:outline-none"
                  >
                    <option value="ACTIVE" className="text-emerald-400 font-bold">ACTIVE (Immediate)</option>
                    <option value="PENDING" className="text-amber-400 font-bold">PENDING</option>
                    <option value="SUSPENDED" className="text-rose-400 font-bold">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  Create & Activate User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
