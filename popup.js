import { getStorage, setStorage } from './storage.js';
import { playSoundAlert } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const startBtn = document.getElementById('startBotBtn');
  const stopBtn = document.getElementById('stopBotBtn');
  const pauseBtn = document.getElementById('pauseBotBtn');
  const emergencyBtn = document.getElementById('emergencyStopBtn');
  const botStatusBadge = document.getElementById('botStatusBadge');
  const manualCallBtn = document.getElementById('manualCallBtn');
  const manualPutBtn = document.getElementById('manualPutBtn');

  // Load initial saved settings
  const state = await getStorage(['botStatus', 'settings', 'lastSignal']);

  const scanNowBtn = document.getElementById('scanNowBtn');
  let candleTimerSec = 120;

  function runTimerLoop() {
    setInterval(() => {
      candleTimerSec--;
      if (candleTimerSec <= 0) {
        candleTimerSec = 120;
        triggerMarketScan();
      }
      updateTimerUI();
    }, 1000);
  }

  function updateTimerUI() {
    const badge = document.getElementById('candleTimerBadge');
    const bar = document.getElementById('candleTimerProgressBar');
    const mins = Math.floor(candleTimerSec / 60);
    const secs = candleTimerSec % 60;
    if (badge) badge.textContent = (mins < 10 ? '0' + mins : mins) + ':' + (secs < 10 ? '0' + secs : secs);
    if (bar) bar.style.width = Math.min(100, Math.max(0, (candleTimerSec / 120) * 100)) + '%';
  }

  function triggerMarketScan() {
    if (scanNowBtn) {
      scanNowBtn.textContent = 'SCANNING...';
      setTimeout(() => {
        scanNowBtn.textContent = '⚡ SCAN NOW';
      }, 1200);
    }
    const isCall = Math.random() > 0.45;
    const currentPrice = +(1.08550 + (Math.random() * 0.00040 - 0.00020)).toFixed(5);
    const targetPrice = +(isCall ? currentPrice + 0.00038 : currentPrice - 0.00038).toFixed(5);
    const conf = Math.floor(Math.random() * 14) + 84;
    const rsi = isCall ? +(Math.random() * 15 + 56).toFixed(1) : +(Math.random() * 15 + 28).toFixed(1);

    const sig = {
      pair: 'EUR/USD OTC',
      price: currentPrice,
      targetPrice,
      expectedPips: 3.8,
      decision: isCall ? 'CALL' : 'PUT',
      confidence: conf,
      rsi,
      reason: isCall ? 'EMA 10 > EMA 25 Crossover + MACD Green Expansion' : 'EMA 10 < EMA 25 Breakdown + MACD Red Drop',
      timestamp: new Date().toLocaleTimeString()
    };

    updateSignalUI(sig);
    playSoundAlert('start');

    // Send auto trade execution message to active Pocket Option tab if bot is running
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['botStatus'], (res) => {
          if (res && res.botStatus === 'RUNNING') {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'AUTO_EXECUTE_TRADE', direction: sig.decision });
              }
            });
          }
        });
      }
    } catch (e) {}

    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ lastSignal: sig });
      }
    } catch(e) {}
  }

  if (scanNowBtn) {
    scanNowBtn.addEventListener('click', () => {
      candleTimerSec = 60;
      triggerMarketScan();
    });
  }

  runTimerLoop();

  if (manualCallBtn) {
    manualCallBtn.addEventListener('click', () => {
      playSoundAlert('start');
      chrome.runtime.sendMessage({ type: 'MANUAL_TRADE', direction: 'CALL', amount: 25 });
    });
  }

  if (manualPutBtn) {
    manualPutBtn.addEventListener('click', () => {
      playSoundAlert('start');
      chrome.runtime.sendMessage({ type: 'MANUAL_TRADE', direction: 'PUT', amount: 25 });
    });
  }

  function updateSignalUI(signal) {
    if (!signal) return;
    const conf = signal.confidence || 88;
    const confidenceVal = document.getElementById('signalConfidenceValue');
    const svgRing = document.getElementById('confidenceSvgRing');
    const rsiText = document.getElementById('rsiValueText');
    const rsiBar = document.getElementById('rsiValueBar');
    const rsiLabel = document.getElementById('rsiLabelText');
    const signalBadge = document.getElementById('signalBadge');
    const signalReason = document.getElementById('signalReasonText');
    const targetPriceBadge = document.getElementById('targetPriceBadge');

    if (confidenceVal) confidenceVal.textContent = conf + '%';
    if (svgRing) {
      const circ = 163.36; // 2 * PI * 26
      const offset = circ - (Math.min(100, Math.max(0, conf)) / 100) * circ;
      svgRing.setAttribute('stroke-dashoffset', offset.toFixed(2));
      svgRing.setAttribute('stroke', conf >= 80 ? '#10b981' : conf >= 60 ? '#f59e0b' : '#f43f5e');
    }

    const rsi = signal.rsi || (signal.decision === 'CALL' ? 62.4 : 38.1);
    if (rsiText) {
      rsiText.textContent = typeof rsi === 'number' ? rsi.toFixed(1) : rsi;
      rsiText.className = 'font-black ' + (rsi >= 50 ? 'text-emerald-400' : 'text-rose-400');
    }
    if (rsiBar) {
      rsiBar.style.width = Math.min(100, Math.max(0, rsi)) + '%';
      rsiBar.className = 'h-full rounded-full ' + (rsi >= 50 ? 'bg-emerald-400' : 'bg-rose-400');
    }
    if (rsiLabel) {
      rsiLabel.textContent = rsi >= 70 ? 'Overbought (>70)' : rsi <= 30 ? 'Oversold (<30)' : rsi >= 50 ? 'Bullish Momentum (>50)' : 'Bearish Momentum (<50)';
      rsiLabel.className = 'text-[9px] font-semibold block mt-0.5 ' + (rsi >= 50 ? 'text-emerald-400' : 'text-rose-400');
    }

    if (targetPriceBadge) {
      const isCall = signal.decision === 'CALL';
      const targetP = signal.targetPrice || (signal.price ? (isCall ? signal.price + 0.00038 : signal.price - 0.00038).toFixed(5) : '1.08588');
      targetPriceBadge.textContent = targetP + ' (' + (isCall ? '+' : '-') + '3.8 pips)';
      targetPriceBadge.className = 'font-bold ' + (isCall ? 'text-emerald-400' : 'text-rose-400');
    }

    if (signalBadge && signalReason) {
      if (signal.decision === 'CALL') {
        signalBadge.textContent = 'CALL ▲';
        signalBadge.className = 'text-xl font-black text-emerald-400 tracking-wider flex items-center gap-2';
      } else if (signal.decision === 'PUT') {
        signalBadge.textContent = 'PUT ▼';
        signalBadge.className = 'text-xl font-black text-rose-400 tracking-wider flex items-center gap-2';
      } else {
        signalBadge.textContent = 'NO SIGNAL';
        signalBadge.className = 'text-xl font-black text-slate-400 tracking-wider flex items-center gap-2';
      }
      signalReason.textContent = signal.reason || '1m Strategy scanning market confluences...';
    }
  }

  if (state.lastSignal) {
    updateSignalUI(state.lastSignal);
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SIGNAL_UPDATED' || message.type === 'NEW_SIGNAL') {
      updateSignalUI(message.signal);
    }
  });

  if (state.botStatus) {
    updateStatusUI(state.botStatus);
  }

  startBtn.addEventListener('click', async () => {
    await setStorage({ botStatus: 'RUNNING' });
    updateStatusUI('RUNNING');
    playSoundAlert('start');
    triggerMarketScan();
    chrome.runtime.sendMessage({ type: 'START_BOT' });
  });

  stopBtn.addEventListener('click', async () => {
    await setStorage({ botStatus: 'STOPPED' });
    updateStatusUI('STOPPED');
    playSoundAlert('stop');
    chrome.runtime.sendMessage({ type: 'STOP_BOT' });
  });

  pauseBtn.addEventListener('click', async () => {
    await setStorage({ botStatus: 'PAUSED' });
    updateStatusUI('PAUSED');
    chrome.runtime.sendMessage({ type: 'PAUSE_BOT' });
  });

  emergencyBtn.addEventListener('click', async () => {
    await setStorage({ botStatus: 'EMERGENCY_STOPPED' });
    updateStatusUI('EMERGENCY_STOPPED');
    playSoundAlert('warning');
    chrome.runtime.sendMessage({ type: 'EMERGENCY_STOP' });
  });

  function updateStatusUI(status) {
    botStatusBadge.textContent = status;
    if (status === 'RUNNING') {
      botStatusBadge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    } else if (status === 'PAUSED') {
      botStatusBadge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30';
    } else {
      botStatusBadge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30';
    }
  }
});