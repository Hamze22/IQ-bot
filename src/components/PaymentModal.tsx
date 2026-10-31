import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Send,
  Wallet,
  X,
  Zap,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Tag,
} from 'lucide-react';
import { OFFICIAL_USDT_TRC20_ADDRESS, PromoCode, UserAccount } from '../types';
import { authService } from '../services/authService';
import { IQBotLogo } from './IQBotLogo';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onPaymentSubmitted: () => void;
}

const BASE_LIFETIME_PRICE_USDT = 50;

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPaymentSubmitted,
}) => {
  const [txidInput, setTxidInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [remainingCooldownSeconds, setRemainingCooldownSeconds] = useState<number>(0);
  const [offerCountdown, setOfferCountdown] = useState({ hours: 23, minutes: 59, seconds: 59 });

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    promo: PromoCode;
    discountAmountUSDT: number;
    finalAmountUSDT: number;
  } | null>(null);
  const [promoFeedback, setPromoFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync latest promo codes when modal opens
  useEffect(() => {
    if (isOpen) {
      authService.forceSyncFromFirestore().catch(() => {});
    }
  }, [isOpen]);

  // Urgency Discount Timer (24h rolling)
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const diff = endOfDay.getTime() - now.getTime();
      if (diff <= 0) {
        setOfferCountdown({ hours: 23, minutes: 59, seconds: 59 });
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setOfferCountdown({ hours: h, minutes: m, seconds: s });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 10-minute cooldown calculator (600 seconds)
  useEffect(() => {
    if (!isOpen || !currentUser) {
      setRemainingCooldownSeconds(0);
      return;
    }

    const checkCooldown = () => {
      if (currentUser.paymentDate) {
        const submittedMs = new Date(currentUser.paymentDate).getTime();
        const nowMs = Date.now();
        const diffSec = Math.floor((nowMs - submittedMs) / 1000);
        const cooldownTotal = 10 * 60;
        if (diffSec >= 0 && diffSec < cooldownTotal) {
          setRemainingCooldownSeconds(cooldownTotal - diffSec);
          return;
        }
      }
      setRemainingCooldownSeconds(0);
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const finalPayableUSDT = appliedPromo ? appliedPromo.finalAmountUSDT : BASE_LIFETIME_PRICE_USDT;
  const discountAmountUSDT = appliedPromo ? appliedPromo.discountAmountUSDT : 0;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(OFFICIAL_USDT_TRC20_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyPromo = async () => {
    const clean = promoInput.trim().toUpperCase();
    if (!clean) {
      setPromoFeedback({ type: 'error', text: 'Please enter a promo code.' });
      return;
    }

    setIsCheckingPromo(true);
    setPromoFeedback(null);

    // 1. Validate locally first
    let localRes = authService.validatePromoCode(clean, BASE_LIFETIME_PRICE_USDT);
    if (localRes.valid && localRes.promo) {
      setAppliedPromo({
        promo: localRes.promo,
        discountAmountUSDT: localRes.discountAmountUSDT,
        finalAmountUSDT: localRes.finalAmountUSDT,
      });
      setPromoFeedback({
        type: 'success',
        text: `Promo "${localRes.promo.code}" applied! -$${localRes.discountAmountUSDT} discount.`,
      });
      setIsCheckingPromo(false);
      return;
    }

    // 2. Fallback check against backend / Firestore in case Admin just created it
    try {
      const resp = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean, baseAmount: BASE_LIFETIME_PRICE_USDT }),
      });
      const data = await resp.json();
      if (resp.ok && data.valid && data.promo) {
        await authService.forceSyncFromFirestore();
        setAppliedPromo({
          promo: data.promo,
          discountAmountUSDT: data.discountAmountUSDT,
          finalAmountUSDT: data.finalAmountUSDT,
        });
        setPromoFeedback({
          type: 'success',
          text: `Promo "${data.promo.code}" applied! -$${data.discountAmountUSDT} discount.`,
        });
        setIsCheckingPromo(false);
        return;
      }
      setAppliedPromo(null);
      setPromoFeedback({ type: 'error', text: data.error || localRes.error || 'Invalid promo code.' });
    } catch (_e) {
      setAppliedPromo(null);
      setPromoFeedback({ type: 'error', text: localRes.error || 'Invalid promo code.' });
    } finally {
      setIsCheckingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoFeedback(null);
  };

  const handleSubmitTxid = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (remainingCooldownSeconds > 0) {
      setErrorMsg(
        `Please wait ${Math.floor(remainingCooldownSeconds / 60)}m ${remainingCooldownSeconds % 60}s before re-submitting payment.`
      );
      return;
    }

    const effectiveTxid =
      finalPayableUSDT <= 0 && appliedPromo
        ? `PROMO_FREE_${appliedPromo.promo.code}_${Date.now()}`
        : txidInput.trim();

    if (finalPayableUSDT > 0 && (!effectiveTxid || effectiveTxid.length < 8)) {
      setErrorMsg('Please enter a valid TRC20 Transaction Hash (TXID).');
      return;
    }

    if (!currentUser?.email) {
      setErrorMsg('Please log in or register your account before submitting payment.');
      return;
    }

    const res = authService.submitPaymentTxid(
      effectiveTxid,
      'LIFETIME',
      currentUser.email,
      appliedPromo?.promo.code
    );
    if (res.success) {
      setTxidInput('');
      setShowSuccessPopup(true);
      onPaymentSubmitted();
    } else {
      setErrorMsg(res.error || 'Submission failed.');
    }
  };

  const handleCloseAll = () => {
    setShowSuccessPopup(false);
    onClose();
  };

  const isUnderReview = currentUser?.status === 'PENDING' && remainingCooldownSeconds > 0;
  const cooldownMinutes = Math.floor(remainingCooldownSeconds / 60);
  const cooldownSecondsFormatted = String(remainingCooldownSeconds % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={handleCloseAll}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* SUCCESS CONFIRMATION POPUP OVERLAY */}
        {showSuccessPopup ? (
          <div className="p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full inline-block">
                PAYMENT SUBMITTED SUCCESSFULLY
              </span>
              <h3 className="text-lg font-black text-white">
                Payment Submitted Successfully!
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                Please allow <span className="text-emerald-400 font-bold font-mono">1 to 10 minutes</span> for Admin verification. Once approved, Pro Features & Chrome Extension Download will unlock automatically.
              </p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-amber-300 font-mono flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <span>Status: PENDING ADMIN VERIFICATION (1m - 10m)</span>
            </div>

            <button
              onClick={handleCloseAll}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer uppercase tracking-wider"
            >
              Got It / OK
            </button>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IQBotLogo size="sm" showSubtitle={false} />
                <span className="text-xs font-black text-slate-100">Secure Checkout</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1 mr-6">
                <Zap className="w-3 h-3" />
                ${finalPayableUSDT} LIFETIME
              </span>
            </div>

            {/* Official Payment Method Header */}
            <div className="flex items-center justify-between p-2.5 mx-4 mt-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-400 font-mono">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>OFFICIAL USDT (TRC20) PAYMENT</span>
              </div>
              <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                TRON (TRC20)
              </span>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-3 text-xs">
              {/* STATUS AWARENESS BANNER */}
              {(currentUser?.status === 'ACTIVE' || currentUser?.approved) ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 flex flex-col items-center gap-2.5 text-center animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="w-10 h-10" />
                  <div>
                    <p className="font-black text-sm uppercase">Account Already Active</p>
                    <p className="text-[10px] opacity-80 mt-1">
                      You have already completed your payment and your account is fully verified. You can now use all Pro features and the Chrome Extension.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-2 w-full py-2 bg-emerald-500 text-slate-950 rounded-xl font-black text-[11px] uppercase cursor-pointer active:scale-95 transition"
                  >
                    Close / Back to Dashboard
                  </button>
                </div>
              ) : isUnderReview ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 flex flex-col items-center gap-2.5 text-center animate-in fade-in zoom-in duration-300">
                  <Clock className="w-10 h-10 animate-pulse text-amber-400" />
                  <div>
                    <p className="font-black text-sm uppercase">Payment Under Review</p>
                    <p className="text-[10px] opacity-80 mt-1">
                      We have received your payment request. Our team is currently verifying the transaction.
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg font-mono text-xs font-bold text-amber-300">
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Re-try available in: {cooldownMinutes}:{cooldownSecondsFormatted}</span>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-2 w-full py-2 bg-amber-500 text-slate-950 rounded-xl font-black text-[11px] uppercase cursor-pointer active:scale-95 transition"
                  >
                    Check Later / Close
                  </button>
                </div>
              ) : (
                <>
                  {currentUser?.status === 'PENDING' && (
                    <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 text-[11px] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                        <span>10-min verification window passed. You may re-submit payment details below.</span>
                      </span>
                    </div>
                  )}

                  {/* Logged-in info */}
                  {currentUser && (
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 truncate max-w-[220px]">
                        User: <span className="font-bold text-slate-200">{currentUser.email}</span>
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase text-slate-300">
                        {currentUser.status || 'UNPAID'}
                      </span>
                    </div>
                  )}

                  {/* SINGLE $50 LIFETIME VIP PLAN CARD */}
                  <div className="p-3.5 rounded-xl border border-emerald-500/60 bg-emerald-500/10 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-black text-white uppercase tracking-wide">
                          Lifetime VIP License
                        </span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>

                    <div className="mt-2 flex items-end justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white font-mono">
                            ${finalPayableUSDT}
                          </span>
                          {discountAmountUSDT > 0 ? (
                            <span className="text-xs text-slate-400 line-through font-bold font-mono">
                              $50
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 line-through font-bold font-mono">
                              $100
                            </span>
                          )}
                          <span className="text-[10px] text-emerald-300 font-bold uppercase">
                            USDT / Once
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-300 mt-0.5">
                          Unlimited Live Signals, Mobile Bot & PO Overlay Extension
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-mono font-black text-emerald-400 uppercase block">
                          Infinity Access
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">TRC-20</span>
                      </div>
                    </div>
                  </div>

                  {/* PROMO CODE LABEL & INPUT */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-200 uppercase tracking-wider">
                        <Tag className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Promo Code</span>
                      </label>
                      {appliedPromo && (
                        <span className="text-[10px] font-mono font-bold text-emerald-400">
                          -${appliedPromo.discountAmountUSDT} USDT OFF
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={appliedPromo ? appliedPromo.promo.code : promoInput}
                        disabled={!!appliedPromo}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          if (promoFeedback) setPromoFeedback(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (!appliedPromo) handleApplyPromo();
                          }
                        }}
                        placeholder="Enter Promo Code (Optional)"
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono font-bold uppercase text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-75"
                      />
                      {appliedPromo ? (
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-[11px] rounded-lg transition cursor-pointer shrink-0"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={isCheckingPromo || !promoInput.trim()}
                          className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-black text-[11px] rounded-lg transition cursor-pointer uppercase shrink-0"
                        >
                          {isCheckingPromo ? '...' : 'Apply'}
                        </button>
                      )}
                    </div>

                    {promoFeedback && (
                      <div
                        className={`text-[11px] font-medium flex items-center justify-between pt-0.5 ${
                          promoFeedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        <span>{promoFeedback.text}</span>
                        {appliedPromo && (
                          <span className="font-mono font-bold">
                            Pay: ${appliedPromo.finalAmountUSDT} USDT
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* URGENCY TIMER BANNER */}
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-rose-400 uppercase tracking-wider">
                          Limited Discount Offer
                        </p>
                        <p className="text-[9px] text-slate-400">Lifetime VIP standard $100</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs font-black text-white bg-rose-600 px-2 py-1 rounded-lg">
                      <span>{String(offerCountdown.hours).padStart(2, '0')}</span>
                      <span>:</span>
                      <span>{String(offerCountdown.minutes).padStart(2, '0')}</span>
                      <span>:</span>
                      <span>{String(offerCountdown.seconds).padStart(2, '0')}</span>
                    </div>
                  </div>

                  {/* ADMIN DIRECT ACTIVATION BYPASS */}
                  {currentUser &&
                    (currentUser.email === 'somfxstore@gmail.com' ||
                      currentUser.email === 'hamze.zakarie@gmail.com') && (
                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase">
                          <ShieldCheck className="w-4 h-4" />
                          Admin Test Tools
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const res = authService.approveUser(currentUser.email);
                            if (res) {
                              onPaymentSubmitted();
                              onClose();
                            }
                          }}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase transition cursor-pointer shadow-lg"
                        >
                          Instant Admin Activation
                        </button>
                      </div>
                    )}

                  {/* PAYMENT FORM (USDT TRC-20 OR 100% PROMO CLAIM) */}
                  {finalPayableUSDT > 0 ? (
                    <>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1 text-slate-200">
                            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                            Send ${finalPayableUSDT} USDT (TRC-20) To:
                          </span>
                          <span className="text-emerald-400 font-mono">TRON NETWORK</span>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="font-mono text-[11px] text-cyan-300 font-bold select-all truncate flex-1">
                            {OFFICIAL_USDT_TRC20_ADDRESS}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyAddress}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition shrink-0 cursor-pointer shadow"
                          >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleSubmitTxid} className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                          Submit TRC20 Tx Hash / TxID:
                        </label>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={txidInput}
                            onChange={(e) => setTxidInput(e.target.value)}
                            placeholder="Paste USDT TRC20 Tx Hash / TxID"
                            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow transition active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer uppercase"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Submit
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <form onSubmit={handleSubmitTxid}>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Activate Free Promo VIP ($0 USDT)</span>
                      </button>
                    </form>
                  )}

                  {errorMsg && (
                    <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px]">
                      {errorMsg}
                    </div>
                  )}

                  {/* Verification Timing Notice */}
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-300/90 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>
                      Verification Time: <strong className="text-white font-mono">1m - 10m</strong>. Signals & Extension download unlock automatically once approved.
                    </span>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
