import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, X, User } from 'lucide-react';
import { authService } from '../services/authService';
import { UserAccount, SubscriptionPlan } from '../types';
import { IQBotLogo } from './IQBotLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  onOpenPaymentModal: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [plan] = useState<SubscriptionPlan>('LIFETIME');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (!email || !password || !confirmPassword) {
          setError('Please fill in all required fields.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please try again.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        const res = authService.register(email, password, plan, undefined, name);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Failed to create account.');
        }
      } else {
        if (!email || !password) {
          setError('Please fill in both email and password.');
          setLoading(false);
          return;
        }

        const res = await authService.loginAsync(email, password);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Invalid credentials.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-b from-blue-950/50 to-slate-900 p-6 pb-4 text-center border-b border-slate-800/60">
          <IQBotLogo size="md" showSubtitle={true} />
          <h2 className="text-lg font-black text-slate-100 mt-3">
            {isRegister ? 'Create Account' : 'Sign In to iQ Bot'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister
              ? 'Register your account to access the Pocket Option AI platform'
              : 'Enter your account credentials to access Pocket Option AI Bot'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                !isRegister
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>🔑 LOG IN</span>
            </button>

            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                isRegister
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>👤 REGISTER</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex flex-col gap-1.5 font-medium">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(null); }}
                  className="text-left text-blue-400 hover:text-blue-300 font-bold underline text-[11px] cursor-pointer mt-0.5"
                >
                  👉 Don't have an account? Click here to Register in 10 seconds
                </button>
              )}
            </div>
          )}

          {/* Full Name (Only on Register) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required={isRegister}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-100 placeholder-slate-600 focus:outline-none ${
                  isRegister ? 'focus:border-emerald-500' : 'focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-100 placeholder-slate-600 focus:outline-none ${
                  isRegister ? 'focus:border-emerald-500' : 'focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          {/* Confirm Password (Only on Register) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required={isRegister}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 font-black text-xs rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            } ${
              isRegister
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 shadow-emerald-500/20 text-slate-950'
                : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 shadow-blue-500/20 text-white'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Authenticating with Database...</span>
              </>
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                🚀 CREATE ACCOUNT
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                🔑 LOG IN TO ACCOUNT
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
