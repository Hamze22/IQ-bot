import { evaluateMarketStrategy } from './strategy.js';
import { checkRiskLimits } from './riskManager.js';
import { sendTelegramNotification } from './utils.js';

let botTimer = null;

function isInjectableUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return (url.startsWith('http://') || url.startsWith('https://')) &&
    !url.startsWith('https://chrome.google.com/webstore') &&
    !url.startsWith('https://chromewebstore.google.com');
}

async function injectOverlayIntoOpenTabs() {
  if (!chrome.tabs || !chrome.scripting) return;
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.id || !isInjectableUrl(tab.url)) continue;
      try {
        await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['content.css'] });
      } catch (e) {}
      try {
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
      } catch (e) {}
    }
  } catch (e) {}
}

chrome.runtime.onInstalled.addListener(() => {
  const defaultVIP = {
    id: 'usr_trade_vip_gmail_com',
    uid: 'usr_trade_vip_gmail_com',
    email: 'trade.vip@gmail.com',
    role: 'USER',
    status: 'ACTIVE',
    approved: true,
    active: true,
    password: 'vip12345',
    plan: 'LIFETIME',
    balance: 2500.00
  };
  chrome.storage.local.get(['activeUser'], (res) => {
    const _err = chrome.runtime && chrome.runtime.lastError;
    const updates = {
      botStatus: 'RUNNING',
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
    };
    if (!res || !res.activeUser) {
      updates.activeUser = defaultVIP;
      updates.userEmail = defaultVIP.email;
    }
    chrome.storage.local.set(updates);
  });

  // Immediately inject content overlay into any already-open Pocket Option tabs!
  injectOverlayIntoOpenTabs();
  startBotLoop();
});

if (chrome.runtime.onStartup) {
  chrome.runtime.onStartup.addListener(() => {
    injectOverlayIntoOpenTabs();
    startBotLoop();
  });
}

if (chrome.tabs && chrome.tabs.onUpdated) {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab && isInjectableUrl(tab.url)) {
      if (/pocketoption|po\d*\.(trade|capital|broker|cash|market|app)|\/cabinet/i.test(tab.url)) {
        try {
          chrome.scripting.insertCSS({ target: { tabId }, files: ['content.css'] }).catch(() => {});
          chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] }).catch(() => {});
        } catch (e) {}
      }
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (!message || !message.type) {
      sendResponse({ success: true });
      return false;
    }
    if (message.type === 'START_BOT') {
      startBotLoop();
      sendResponse({ success: true });
    } else if (message.type === 'STOP_BOT' || message.type === 'EMERGENCY_STOP') {
      stopBotLoop();
      sendResponse({ success: true });
    } else if (message.type === 'MANUAL_TRADE') {
      sendResponse({ success: true, executed: message.direction || 'CALL' });
    } else if (message.type === 'INJECT_OPEN_TABS') {
      injectOverlayIntoOpenTabs().then(() => sendResponse({ success: true })).catch(() => sendResponse({ success: false }));
      return true;
    } else {
      sendResponse({ success: true });
    }
  } catch (e) {
    sendResponse({ success: false });
  }
  return false;
});

function startBotLoop() {
  if (botTimer) clearInterval(botTimer);

  botTimer = setInterval(async () => {
    try {
      const { botStatus, settings = {}, accountStats = {}, lastSignal } = await chrome.storage.local.get([
        'botStatus',
        'settings',
        'accountStats',
        'lastSignal'
      ]);

      if (botStatus !== 'RUNNING') return;

      const riskCheck = checkRiskLimits(accountStats, settings);
      if (!riskCheck.allowed) {
        chrome.storage.local.set({ botStatus: 'STOPPED' });
        stopBotLoop();
        if (chrome.notifications) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Risk Manager Auto-Stop',
            message: riskCheck.reason
          });
        }
        return;
      }

      const now = Date.now();
      const isSignalExpired = !lastSignal || !lastSignal.lockUntil || now >= lastSignal.lockUntil;

      if (isSignalExpired) {
        const signal = await evaluateMarketStrategy(settings);
        if (signal && signal.confidence >= (settings.minConfidence || 80)) {
          signal.lockUntil = now + 60000;
          chrome.storage.local.set({ lastSignal: signal });
          if (settings.telegramToken && settings.telegramChatId) {
            sendTelegramNotification(settings.telegramToken, settings.telegramChatId, signal);
          }
        }
      }
    } catch (e) {}
  }, 5000);
}

function stopBotLoop() {
  if (botTimer) {
    clearInterval(botTimer);
    botTimer = null;
  }
}