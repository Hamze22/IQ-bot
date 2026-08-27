import { evaluateMarketStrategy } from './strategy.js';
import { checkRiskLimits } from './riskManager.js';
import { sendTelegramNotification } from './utils.js';

let botTimer = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log('[PocketOption AI] Extension Service Worker installed.');
  chrome.storage.local.set({
    botStatus: 'STOPPED',
    settings: {
      tradeAmount: 25,
      expiryTime: '1m',
      maxDailyLoss: 100,
      maxDailyProfit: 300,
      maxConsecutiveLosses: 3,
      maxTradesPerDay: 50,
      autoRestart: true,
      mode: 'DEMO',
      minConfidence: 80
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_BOT') {
    startBotLoop();
    sendResponse({ success: true });
  } else if (message.type === 'STOP_BOT' || message.type === 'EMERGENCY_STOP') {
    stopBotLoop();
    sendResponse({ success: true });
  }
  return true;
});

function startBotLoop() {
  if (botTimer) clearInterval(botTimer);
  console.log('[PocketOption AI] Bot loop initiated.');

  botTimer = setInterval(async () => {
    const { botStatus, settings, accountStats, lastSignal } = await chrome.storage.local.get(['botStatus', 'settings', 'accountStats', 'lastSignal']);

    if (botStatus !== 'RUNNING') return;

    // Evaluate Risk Manager Limits
    const riskCheck = checkRiskLimits(accountStats, settings);
    if (!riskCheck.allowed) {
      console.warn('[RiskManager] Limit breached:', riskCheck.reason);
      chrome.storage.local.set({ botStatus: 'STOPPED' });
      stopBotLoop();
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Risk Manager Auto-Stop',
        message: riskCheck.reason
      });
      return;
    }

    // Only run Strategy Engine if signal lock for current 1m candle has expired
    const now = Date.now();
    const isSignalExpired = !lastSignal || !lastSignal.lockUntil || now >= lastSignal.lockUntil;

    if (isSignalExpired) {
      const signal = await evaluateMarketStrategy(settings);
      if (signal && signal.confidence >= settings.minConfidence) {
        signal.lockUntil = now + 60000; // 60 seconds candle lock
        chrome.storage.local.set({ lastSignal: signal });
        if (settings.telegramToken && settings.telegramChatId) {
          sendTelegramNotification(settings.telegramToken, settings.telegramChatId, signal);
        }
      }
    }
  }, 5000); // 5s tick loop
}

function stopBotLoop() {
  if (botTimer) {
    clearInterval(botTimer);
    botTimer = null;
  }
}