import React, { useState, useEffect } from 'react';
import { Copy, Check, ShieldCheck, Clock, Send, Wallet, X, Zap, CheckCircle2, Sparkles, CreditCard, Lock, RotateCcw } from 'lucide-react';
import { OFFICIAL_USDT_TRC20_ADDRESS, SubscriptionPlan, UserAccount, CardDetails } from '../types';
import { authService } from '../services/authService';
import { IQBotLogo } from './IQBotLogo';

type PaymentMethod = 'USDT' | 'MASTERCARD';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onPaymentSubmitted: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPaymentSubmitted,
}) => {
  const [selectedPlan] = useState<SubscriptionPlan>('LIFETIME');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('USDT');
  const [txidInput, setTxidInput] = useState('');
  const [cardData, setCardData] = useState<CardDetails>({
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    pin: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [remainingCooldownSeconds, setRemainingCooldownSeconds] = useState<number>(0);

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
        const cooldownTotal = 10 * 60; // 10 minutes = 600 seconds
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

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(OFFICIAL_USDT_TRC20_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitTxid = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (remainingCooldownSeconds > 0) {
      setErrorMsg(`Please wait ${Math.floor(remainingCooldownSeconds / 60)}m ${remainingCooldownSeconds % 60}s before re-submitting payment.`);
      return;
    }

    if (!txidInput.trim() || txidInput.trim().length < 8) {
      setErrorMsg('Please enter a valid TRC20 Transaction Hash (TXID).');
      return;
    }

    if (!currentUser?.email) {
      setErrorMsg('Please log in or register your account before submitting payment.');
      return;
    }
    const emailToUse = currentUser.email;
    const res = authService.submitPaymentTxid(txidInput, selectedPlan, emailToUse);
    if (res.success) {
      setTxidInput('');
      setShowSuccessPopup(true);
      onPaymentSubmitted();
    } else {
      setErrorMsg(res.error || 'Submission failed.');
    }
  };

  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (remainingCooldownSeconds > 0) {
      setErrorMsg(`Please wait ${Math.floor(remainingCooldownSeconds / 60)}m ${remainingCooldownSeconds % 60}s before submitting a new payment.`);
      return;
    }

    if (!cardData.cardHolderName || !cardData.cardNumber || !cardData.expiryDate || !cardData.pin) {
      setErrorMsg('Please fill in all card details correctly.');
      return;
    }

    if (!currentUser?.email) {
      setErrorMsg('Please log in or register before paying.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate beautiful processing state
    setTimeout(() => {
      const res = authService.submitCardPayment(cardData, selectedPlan, currentUser.email);
      setIsProcessing(false);
      if (res.success) {
        setShowSuccessPopup(true);
        onPaymentSubmitted();
      } else {
        setErrorMsg(res.error || 'Card payment failed.');
      }
    }, 2000);
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
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
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold flex items-center gap-1 mr-6">
                <Zap className="w-3 h-3" />
                $50 LIFETIME
              </span>
            </div>

            {/* Payment Method Switcher */}
            <div className="flex p-1 mx-4 mt-4 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                onClick={() => setPaymentMethod('USDT')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black rounded-lg transition ${
                  paymentMethod === 'USDT' 
                    ? 'bg-slate-800 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                USDT TRC20
              </button>
              <button
                onClick={() => setPaymentMethod('MASTERCARD')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black rounded-lg transition ${
                  paymentMethod === 'MASTERCARD' 
                    ? 'bg-slate-800 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                MASTERCARD
              </button>
            </div>

            {/* Compact Modal Content */}
            <div className="p-4 space-y-3.5 text-xs">

              {/* STATUS AWARENESS BANNER */}
              {(currentUser?.status === 'ACTIVE' || currentUser?.approved) ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 flex flex-col items-center gap-2.5 text-center animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="w-10 h-10" />
                  <div>
                    <p className="font-black text-sm uppercase">Account Already Active</p>
                    <p className="text-[10px] opacity-80 mt-1">You have already completed your payment and your account is fully verified. You can now use all Pro features and the Chrome Extension.</p>
                  </div>
                  <button onClick={onClose} className="mt-2 w-full py-2 bg-emerald-500 text-slate-950 rounded-xl font-black text-[11px] uppercase cursor-pointer active:scale-95 transition">
                    Close / Back to Dashboard
                  </button>
                </div>
              ) : isUnderReview ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 flex flex-col items-center gap-2.5 text-center animate-in fade-in zoom-in duration-300">
                  <Clock className="w-10 h-10 animate-pulse text-amber-400" />
                  <div>
                    <p className="font-black text-sm uppercase">Payment Under Review</p>
                    <p className="text-[10px] opacity-80 mt-1">We have received your payment request. Our team is currently verifying the transaction.</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full font-mono text-xs font-bold text-amber-300">
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Re-try available in: {cooldownMinutes}:{cooldownSecondsFormatted}</span>
                    </div>
                  </div>
                  <button onClick={onClose} className="mt-2 w-full py-2 bg-amber-500 text-slate-950 rounded-xl font-black text-[11px] uppercase cursor-pointer active:scale-95 transition">
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
                  <span className="text-slate-400 truncate max-w-[200px]">
                    User: <span className="font-bold text-slate-200">{currentUser.email}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      currentUser.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : currentUser.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-700/40 text-slate-300 border border-slate-600/50'
                    }`}
                  >
                    {currentUser.status || 'UNPAID'}
                  </span>
                </div>
              )}

                  {/* Selected Lifetime Plan Box */}
                  <div className="p-3 rounded-xl border border-emerald-500/40 bg-slate-950 flex items-center justify-between relative overflow-hidden">
                    <div>
                      <div className="text-xs font-black text-slate-100 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Lifetime Pro Access</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Live Signals, Auto-Bot & Extension
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-emerald-400 font-mono">$50 USDT</div>
                      <div className="text-[9px] text-emerald-500 font-bold uppercase">TRC-20</div>
                    </div>
                  </div>

                  {/* ADMIN DIRECT ACTIVATION BYPASS */}
                  {currentUser && (currentUser.email === 'somfxstore@gmail.com' || currentUser.email === 'hamze.zakarie@gmail.com') && (
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase">
                        <ShieldCheck className="w-4 h-4" />
                        Admin Test Tools
                      </div>
                      <button
                        onClick={() => {
                          const res = authService.approveUser(currentUser.email);
                          if (res) {
                            onPaymentSubmitted();
                            onClose();
                            alert('Admin Account Activated Instantly!');
                          }
                        }}
                        className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase transition cursor-pointer shadow-lg"
                      >
                        ⚡ Instant Admin Activation
                      </button>
                    </div>
                  )}

                  {/* PAYMENT FORMS */}
              {paymentMethod === 'USDT' ? (
                <>
                  {/* TRC20 Wallet Address & Copy */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                        Send $50 USDT (TRC-20) To:
                      </span>
                      <span className="text-emerald-400 font-mono">TRON NETWORK</span>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="font-mono text-[11px] text-cyan-300 font-bold select-all truncate flex-1">
                        {OFFICIAL_USDT_TRC20_ADDRESS}
                      </span>
                      <button
                        onClick={handleCopyAddress}
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition shrink-0 cursor-pointer shadow"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Submit Tx Hash Form */}
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
                <form onSubmit={handleCardPayment} className="space-y-3 p-4 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <CreditCard className="w-16 h-16 text-rose-500 rotate-12" />
                  </div>
                  
                  <div className="space-y-3 relative z-10">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Check className="w-3 h-3 text-rose-400" />
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="NAME ON CARD"
                        value={cardData.cardHolderName}
                        onChange={(e) => setCardData({...cardData, cardHolderName: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-rose-400" />
                        Card Number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="0000 0000 0000 0000"
                        value={cardData.cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                          setCardData({...cardData, cardNumber: val});
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Valid Date (MM/YY)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={cardData.expiryDate}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                            if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
                            setCardData({...cardData, expiryDate: val});
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
                          <Lock className="w-3 h-3" />
                          PIN
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="****"
                          value={cardData.pin}
                          onChange={(e) => setCardData({...cardData, pin: e.target.value.replace(/\D/g, '').substring(0, 4)})}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition text-center tracking-widest"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-2.5 mt-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer uppercase"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Pay $50 via Mastercard</span>
                        </>
                      )}
                    </button>
                  </div>
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
                <span>Verification Time: <strong className="text-white font-mono">1m - 10m</strong>. Signals & Extension download unlock automatically once approved.</span>
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

