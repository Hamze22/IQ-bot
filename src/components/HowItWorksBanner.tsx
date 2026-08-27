import React from 'react';
import { MousePointerClick, Zap, ExternalLink, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';

export const HowItWorksBanner: React.FC = () => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-slate-100">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-black tracking-wider uppercase text-slate-200">
          HOW IT WORKS
        </h3>
        <div className="h-px bg-slate-800 flex-1 ml-2"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Step 1 */}
        <div className="md:col-span-3 space-y-2 relative">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-black text-xs flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10">
              1
            </div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              Click Extension Icon
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden md:inline" />
            </h4>
          </div>
          <p className="text-xs text-slate-400 pl-11">
            Click the Pocket Option Bot icon in your browser toolbar to trigger the compact control popup.
          </p>

          {/* Browser Bar Visual Demonstration Box */}
          <div className="mt-3 ml-11 p-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <div className="flex gap-1 text-slate-600">
              <span>❮</span>
              <span>❯</span>
              <span>↻</span>
            </div>
            <div className="flex-1 bg-slate-900 rounded-md px-2 py-0.5 text-slate-500 truncate text-[9px]">
              pocketoption.com/trade
            </div>
            <div className="w-5 h-5 rounded bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center animate-pulse border border-blue-400">
              PO
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="md:col-span-3 space-y-2 relative">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-black text-xs flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10">
              2
            </div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              Quick Actions in Popup
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden md:inline" />
            </h4>
          </div>
          <p className="text-xs text-slate-400 pl-11">
            Start/Stop bot, check live signals, toggle risk parameters, and view real-time session win rates.
          </p>
        </div>

        {/* Step 3 */}
        <div className="md:col-span-3 space-y-2 relative">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-black text-xs flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              Open Full Dashboard
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden md:inline" />
            </h4>
          </div>
          <p className="text-xs text-slate-400 pl-11">
            Click "Open Dashboard" to launch the comprehensive multi-timeframe analytics workspace.
          </p>
        </div>

        {/* Step 4 & Security Card */}
        <div className="md:col-span-3 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
                4
              </div>
              <h4 className="text-xs font-bold text-slate-100">Trade Smarter</h4>
            </div>
            <p className="text-xs text-slate-400 pl-11">
              Let the AI engine scan SMC market structure, BOS, FVG, and execute trades automatically.
            </p>
          </div>

          {/* Safe & Secure Box */}
          <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-extrabold text-blue-300 uppercase tracking-wider block">
                SAFE & SECURE
              </span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Your account is protected. We never ask for your Pocket Option password or credentials.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
