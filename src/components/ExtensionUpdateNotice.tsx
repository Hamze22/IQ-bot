import React, { useState } from 'react';
import { Download, Sparkles, CheckCircle2, ShieldCheck, Zap, X, FileCode, Layers, Radio } from 'lucide-react';
import { IQBotLogo } from './IQBotLogo';

interface ExtensionUpdateNoticeProps {
  onDownloadZip: () => void;
}

export const ExtensionUpdateNotice: React.FC<ExtensionUpdateNoticeProps> = ({ onDownloadZip }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    onDownloadZip();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 4000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-xs rounded-full shadow-2xl shadow-emerald-500/40 border border-emerald-300/60 hover:scale-105 active:scale-95 transition-all animate-bounce"
      >
        <Sparkles className="w-4 h-4 fill-slate-950" />
        <span>Update v3.0.0 ZIP Ready</span>
        <span className="bg-slate-950 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-mono">
          DOWNLOAD
        </span>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-b border-emerald-500/40 px-4 py-3 text-slate-100 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative z-10">
        
        {/* Left: Info & Badges */}
        <div className="flex items-center gap-3">
          <IQBotLogo size="sm" showSubtitle={false} />

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black tracking-wide uppercase text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> LATEST CHROME EXTENSION BUILD
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                v3.0.0 PRO (LATEST)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-mono">
                24H Auto-Reset Stats
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              <strong className="text-slate-100">All requested updates are integrated:</strong> SMC Smart Money Concepts (Order Blocks & FVG), Real-time Pocket Option Web Overlay, Automatic Risk Circuit Breaker, Audio Signals, and Telegram Alerting.
            </p>

            {/* Quick Feature Checklist */}
            <div className="flex items-center gap-4 mt-1.5 text-[11px] text-slate-400 flex-wrap">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> SMC Order Blocks & FVG
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> PO Web DOM Overlay
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> Automated Risk Safeguards
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> Audio & Telegram Alerts
              </span>
            </div>
          </div>
        </div>

        {/* Right: Download Action Button & Close */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs rounded-xl shadow-xl shadow-emerald-500/30 transition active:scale-95 border border-emerald-200 cursor-pointer"
          >
            <Download className={`w-4 h-4 ${downloaded ? 'animate-bounce' : ''}`} />
            <span>{downloaded ? '✓ Extension ZIP Downloaded!' : 'Download Extension ZIP (v3.0.0)'}</span>
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition cursor-pointer"
            title="Minimize Banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
