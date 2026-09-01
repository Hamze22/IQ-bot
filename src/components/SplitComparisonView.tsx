import React from 'react';
import { ExtensionPopupView } from './ExtensionPopupView';
import { FullDashboardView } from './FullDashboardView';
import { PocketOptionWebSimulator } from './PocketOptionWebSimulator';
import { HowItWorksBanner } from './HowItWorksBanner';
import {
  BotStatus,
  ExecutionMode,
  ExpiryTime,
  Candle,
  TradingSettings,
  Signal,
  Trade,
} from '../types';
import { Sparkles, Maximize2, ExternalLink, Zap } from 'lucide-react';

interface SplitComparisonViewProps {
  botStatus: BotStatus;
  setBotStatus: (s: BotStatus) => void;
  mode: ExecutionMode;
  setMode: (m: ExecutionMode) => void;
  balance: number;
  profitToday: number;
  winRate: number;
  totalWins: number;
  totalLosses: number;
  totalTrades: number;
  activePair: string;
  setActivePair: (p: string) => void;
  candles: Candle[];
  currentPrice: number;
  timeframe: ExpiryTime;
  setTimeframe: (t: ExpiryTime) => void;
  activeSignal: Signal | null;
  settings: TradingSettings;
  setSettings: React.Dispatch<React.SetStateAction<TradingSettings>>;
  trades: Trade[];
  onFocusDashboardTab: () => void;
  onFocusPopupTab: () => void;
  onManualTrade?: (type: 'CALL' | 'PUT') => void;
  onDownloadZip?: () => void;
  onScanSignal?: () => void;
  showScanningZone?: boolean;
}

export const SplitComparisonView: React.FC<SplitComparisonViewProps> = ({
  botStatus,
  setBotStatus,
  mode,
  setMode,
  balance,
  profitToday,
  winRate,
  totalWins,
  totalLosses,
  totalTrades,
  activePair,
  setActivePair,
  candles,
  currentPrice,
  timeframe,
  setTimeframe,
  activeSignal,
  settings,
  setSettings,
  trades,
  onFocusDashboardTab,
  onFocusPopupTab,
  onManualTrade,
  onDownloadZip,
  onScanSignal,
  showScanningZone = true,
}) => {
  return (
    <div className="space-y-8">
      {/* Top Main Section Titles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: 1. EXTENSION POPUP (Small) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div>
              <h2 className="text-sm font-black text-slate-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-mono text-xs flex items-center justify-center">
                  1
                </span>
                EXTENSION POPUP (Small)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Shows when you click the extension icon in browser
              </p>
            </div>

            <button
              onClick={onFocusPopupTab}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition border border-slate-700 flex items-center gap-1"
              title="Fullscreen Popup Mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex justify-center">
            <ExtensionPopupView
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
              onOpenDashboard={onFocusDashboardTab}
              onManualTrade={onManualTrade}
            />
          </div>
        </div>

        {/* Right Side: 2. DASHBOARD (Full Page) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div>
              <h2 className="text-sm font-black text-slate-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-mono text-xs flex items-center justify-center">
                  2
                </span>
                DASHBOARD (Full Page)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Opens in a new tab when you click "Open Dashboard"
              </p>
            </div>

            <button
              onClick={onFocusDashboardTab}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-blue-600/20 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Focus Full Workspace
            </button>
          </div>

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
            onManualTrade={onManualTrade}
            showScanningZone={showScanningZone}
          />
        </div>

      </div>

      {/* Middle Section: 3. POCKET OPTION LIVE TAB SIMULATOR WITH FLOATING DRAGGABLE OVERLAY */}
      <div className="space-y-4">
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div>
            <h2 className="text-sm font-black text-emerald-400 uppercase tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-slate-950 font-mono text-xs font-black flex items-center justify-center">
                3
              </span>
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
              POCKET OPTION LIVE TAB SIMULATOR (Draggable Floating Overlay + Auto-Sync)
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Experience the exact Pocket Option web DOM injection. Click & drag the green header of the AI box anywhere on screen!
            </p>
          </div>
          {onDownloadZip && (
            <button
              onClick={onDownloadZip}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2"
            >
              📥 Download Chrome Extension v2.5.0 ZIP
            </button>
          )}
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
          onManualTrade={onManualTrade}
          onDownloadZip={onDownloadZip}
          onScanSignal={onScanSignal}
          showScanningZone={showScanningZone}
        />
      </div>

      {/* Bottom Section: HOW IT WORKS Banner */}
      <HowItWorksBanner />
    </div>
  );
};

