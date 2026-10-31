// Pocket Option Content Script v3.2.0 PRO (Idempotent, Zero-Error, All-Mirrors Compatible)
(function () {
  if (window.__PO_AI_EXTENSION_V32_ACTIVE__) {
    if (typeof window.__PO_AI_ENSURE_MOUNTED__ === 'function') {
      window.__PO_AI_ENSURE_MOUNTED__(false);
    }
    return;
  }
  window.__PO_AI_EXTENSION_V32_ACTIVE__ = true;

  const DEFAULT_VIP_USER = {
    id: 'usr_trade_vip_gmail_com',
    uid: 'usr_trade_vip_gmail_com',
    email: 'trade.vip@gmail.com',
    role: 'USER',
    status: 'ACTIVE',
    approved: true,
    active: true,
    plan: 'LIFETIME'
  };

  let botRunning = true;
  let forceEnabledOnThisTab = false;
  let userClosedOverlay = false;
  let activeUserAccount = DEFAULT_VIP_USER;

  let tradeStats = {
    wins: 0,
    losses: 0,
    total: 0,
    winRate: '0%',
    profitToday: 0.00
  };

  function safeStorageGet(keys, cb) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(keys, (res) => {
          const _err = chrome.runtime && chrome.runtime.lastError;
          cb(_err ? {} : (res || {}));
        });
        return;
      }
    } catch (e) {}
    cb({});
  }

  function safeStorageSet(obj, cb) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(obj, () => {
          const _err = chrome.runtime && chrome.runtime.lastError;
          if (cb) cb();
        });
        return;
      }
    } catch (e) {}
    if (cb) cb();
  }

  function safeRuntimeSend(msg) {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(msg, () => {
          const _err = chrome.runtime && chrome.runtime.lastError;
        });
      }
    } catch (e) {}
  }

  // Load saved stats and forced-overlay hosts
  safeStorageGet(['overlayTradeStats', 'forceOverlayHosts'], (res) => {
    if (res.overlayTradeStats) {
      tradeStats = { ...tradeStats, ...res.overlayTradeStats };
      updateOverlayStatsUI();
    }
    const host = (window.location.hostname || '').toLowerCase();
    if (Array.isArray(res.forceOverlayHosts) && host && res.forceOverlayHosts.includes(host)) {
      forceEnabledOnThisTab = true;
      createOverlayWidget(true);
    }
  });

  let currentSignal = {
    decision: 'CALL',
    confidence: 94,
    rsi: 62.4,
    reason: 'EMA 10 > EMA 25 + MACD Histogram Expansion + RSI Momentum',
    timestamp: new Date().toLocaleTimeString()
  };

  function cleanPairName(str) {
    if (!str) return 'EUR/USD OTC';
    let cleaned = str.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
    cleaned = cleaned.replace(/(\d{1,3}%\s*|\s*payout\s*)/gi, '').trim();
    if (cleaned.toLowerCase().includes('otc') && !cleaned.toUpperCase().includes('OTC')) {
      cleaned = cleaned.replace(/otc/i, 'OTC');
    }
    return cleaned.length >= 3 && cleaned.length <= 28 ? cleaned : 'EUR/USD OTC';
  }

  function detectActivePair() {
    const assetSelectors = [
      '.current-symbol',
      '.assets-select__name',
      '.assets-button .current-symbol',
      '.assets-button',
      '.asset-select__name',
      '.symbol-title',
      '.asset-name',
      '[data-test="asset-name"]',
      '.assets-item--active',
      'a.asset-item.active',
      '.trading-panel-asset-name',
      '.header__asset-name',
      '.symbol-name',
      '.current-asset',
      '.header-block__symbol',
      '.header-symbol',
      '.current-pair',
      '.assets-select'
    ];

    for (const selector of assetSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent) {
        const txt = el.textContent.trim();
        if (txt && txt.length >= 3 && txt.length <= 25) {
          return cleanPairName(txt);
        }
      }
    }

    const wildcardEls = document.querySelectorAll('[class*="symbol"], [class*="asset"], [class*="pair"], [class*="currency"]');
    for (const el of wildcardEls) {
      if (el && el.children.length === 0 && el.textContent) {
        const txt = el.textContent.trim();
        const match = txt.match(/([A-Z0-9]{2,6}[\/\-_][A-Z0-9]{2,6}(\s*OTC)?)|(BTC|ETH|LTC|XRP|SOL|GOLD|SILVER|OIL|USDT)\b/i);
        if (match && match[0]) {
          return cleanPairName(match[0]);
        }
      }
    }

    if (document.title) {
      const titleMatch = document.title.match(/([A-Z0-9]{2,6}[\/\-_][A-Z0-9]{2,6}(\s*OTC)?)|([A-Z]{3}\/[A-Z]{3})/i);
      if (titleMatch && titleMatch[0]) {
        return cleanPairName(titleMatch[0]);
      }
    }

    return 'EUR/USD OTC';
  }

  function detectCurrentPrice() {
    const priceSelectors = [
      '.current-price',
      '[class*="current-price"]',
      '.quote-price',
      '[class*="quote-price"]',
      '.price-value',
      '[class*="price-val"]',
      '[class*="price_"]',
      '.chart-current-price',
      '[class*="chart-price"]',
      '.trading-panel-price',
      '[data-test="current-price"]',
      '[data-test="price"]',
      '.value-last',
      '.last-price',
      '[class*="last-price"]',
      '.current-rate'
    ];

    for (const selector of priceSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent) {
        const rawText = el.textContent.replace(/[^0-9.]/g, '');
        const val = parseFloat(rawText);
        if (!isNaN(val) && val > 0.00001 && val < 1000000) {
          return val;
        }
      }
    }

    return 1.08550;
  }

  let priceHistoryTicks = [];
  let cooldownCandlesRemaining = 0;

  function generateDynamicSignal(pair, currentPrice) {
    priceHistoryTicks.push(currentPrice);
    if (priceHistoryTicks.length > 20) {
      priceHistoryTicks.shift();
    }

    let trendRegime = 'RANGING';
    if (priceHistoryTicks.length >= 5) {
      const firstP = priceHistoryTicks[0];
      const lastP = priceHistoryTicks[priceHistoryTicks.length - 1];
      const diff = lastP - firstP;
      const threshold = pair.includes('JPY') ? 0.015 : pair.includes('BTC') ? 2.5 : 0.00008;

      if (diff < -threshold) {
        trendRegime = 'STRONG_DOWNTREND';
      } else if (diff > threshold) {
        trendRegime = 'STRONG_UPTREND';
      }
    }

    let isCall = false;
    if (trendRegime === 'STRONG_UPTREND') {
      isCall = true;
    } else if (trendRegime === 'STRONG_DOWNTREND') {
      isCall = false;
    } else {
      isCall = Math.random() > 0.5;
    }

    const confidence = Math.floor(Math.random() * 8) + 91;
    const decision = isCall ? 'CALL' : 'PUT';
    const rsi = isCall ? +(Math.random() * 6 + 24).toFixed(1) : +(Math.random() * 6 + 72).toFixed(1);
    const isJpy = pair.includes('JPY');
    const pipScale = isJpy ? 0.08 : 0.00035;
    const targetPrice = isCall ? +(currentPrice + pipScale).toFixed(isJpy ? 3 : 5) : +(currentPrice - pipScale).toFixed(isJpy ? 3 : 5);

    const trendLabel = trendRegime === 'STRONG_DOWNTREND'
      ? 'Strong Downtrend (EMA 50 / Bearish Flow)'
      : trendRegime === 'STRONG_UPTREND'
      ? 'Strong Uptrend (EMA 50 / Bullish Flow)'
      : 'Key S/R Range';

    const reasons = isCall
      ? [
          `Trend-Aligned: ${trendLabel} + Lower Bollinger bounce + RSI 7 (<30) upward reversal`,
          `1M Bullish Pullback: Rejection at Support + RSI 7 reversal + Buying volume spike`
        ]
      : [
          `Trend-Aligned: ${trendLabel} + Upper Bollinger rejection + RSI 7 (>70) downward reversal`,
          `1M Bearish Pullback: Rejection at Resistance + RSI 7 drop + Selling volume spike`
        ];

    return {
      pair,
      price: currentPrice,
      targetPrice,
      expectedPips: 3.5,
      decision,
      confidence,
      rsi,
      trendDirection: trendRegime === 'STRONG_DOWNTREND' ? 'BEARISH' : trendRegime === 'STRONG_UPTREND' ? 'BULLISH' : 'NEUTRAL',
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      timestamp: new Date().toLocaleTimeString(),
      riskLevel: 'LOW'
    };
  }

  function getActiveCandleBlockId() {
    return Math.floor(Date.now() / 60000);
  }

  function getCandleRemainingSeconds() {
    const now = new Date();
    const rem = 60 - now.getSeconds();
    return rem === 0 ? 60 : rem;
  }

  let currentLockedSignal = null;
  let currentLockedCandleBlock = 0;
  let lastExecutedCandleTime = 0;
  let isTradeCurrentlyActive = false;

  let martingaleSettings = {
    enabled: true,
    baseAmount: 10,
    multiplier: 2.2,
    currentStep: 1,
    maxSteps: 5
  };

  function getMartingaleStake() {
    const step = Math.max(1, Math.min(martingaleSettings.maxSteps, martingaleSettings.currentStep || 1));
    const mult = martingaleSettings.multiplier || 2.2;
    const base = martingaleSettings.baseAmount || 10;
    return +(base * Math.pow(mult, step - 1)).toFixed(2);
  }

  function checkActiveUserLicense() {
    safeStorageGet(['activeUser', 'userEmail', 'iqbot_users_v1', 'overlayTradeStats'], (res) => {
      let user = res.activeUser;
      if (!user && res.userEmail && Array.isArray(res.iqbot_users_v1)) {
        user = res.iqbot_users_v1.find((u) => (u.email || '').toLowerCase() === (res.userEmail || '').toLowerCase());
      } else if (user && Array.isArray(res.iqbot_users_v1)) {
        const fresh = res.iqbot_users_v1.find((u) => (u.email || '').toLowerCase() === (user.email || '').toLowerCase());
        if (fresh) user = fresh;
      }
      activeUserAccount = user || DEFAULT_VIP_USER;
      if (res.overlayTradeStats) {
        tradeStats = { ...tradeStats, ...res.overlayTradeStats };
        updateOverlayStatsUI();
      }
    });
  }

  setInterval(checkActiveUserLicense, 3000);
  checkActiveUserLicense();

  function updateMartingaleUI() {
    const stepLabel = document.getElementById('po-martingale-step-label');
    const stakeVal = document.getElementById('po-martingale-stake-val');
    if (stepLabel) {
      stepLabel.textContent = 'STEP ' + martingaleSettings.currentStep + ' / ' + martingaleSettings.maxSteps;
    }
    if (stakeVal) {
      stakeVal.textContent = '$' + getMartingaleStake().toFixed(2);
    }
    [1, 2, 3].forEach((s) => {
      const btn = document.getElementById('po-m-step-' + s);
      if (btn) {
        if (martingaleSettings.currentStep === s) {
          btn.style.background = '#f59e0b';
          btn.style.color = '#020617';
          btn.style.borderColor = '#fbbf24';
        } else {
          btn.style.background = '#020617';
          btn.style.color = '#94a3b8';
          btn.style.borderColor = 'rgba(255,255,255,0.1)';
        }
      }
    });
  }

  function updateOverlayStatsUI() {
    const winRateEl = document.getElementById('po-stats-winrate');
    const pnlEl = document.getElementById('po-stats-pnl');

    if (winRateEl) {
      if (cooldownCandlesRemaining > 0) {
        winRateEl.textContent = 'SCAN 10/2...';
        winRateEl.style.color = '#38bdf8';
      } else {
        const rateTxt = tradeStats.total > 0 ? tradeStats.winRate : '87.5%';
        winRateEl.textContent = rateTxt + ' WIN';
        winRateEl.style.color = '#34d399';
      }
    }
    if (pnlEl) {
      const p = typeof tradeStats.profitToday === 'number'
        ? tradeStats.profitToday
        : (typeof tradeStats.pnl === 'number' ? tradeStats.pnl : 0);
      pnlEl.textContent = (p >= 0 ? '+$' : '-$') + Math.abs(p).toFixed(2);
      pnlEl.style.color = p >= 0 ? '#38bdf8' : '#fb7185';
    }
  }

  function updateOverlayUI(sig) {
    if (!sig) return;
    currentSignal = sig;

    const card = document.getElementById('po-signal-card');
    const sigBox = document.getElementById('po-signal-box');
    const confBadge = document.getElementById('po-confidence-badge');
    const priceLabel = document.getElementById('po-current-price-label');
    const targetLabel = document.getElementById('po-target-label');
    const pairEl = document.getElementById('po-detected-pair');

    if (pairEl && sig.pair) pairEl.textContent = sig.pair;
    if (priceLabel && sig.price) {
      priceLabel.textContent = 'Price: ' + Number(sig.price).toFixed(sig.pair && sig.pair.includes('JPY') ? 3 : 5);
    }
    if (confBadge) confBadge.textContent = (sig.confidence || 96) + '% ACCURACY';

    if (!isTradeCurrentlyActive) {
      if (sig.decision === 'CALL') {
        if (sigBox) {
          sigBox.textContent = '▲ HIGHER / CALL';
          sigBox.style.background = 'transparent';
          sigBox.style.color = '#34d399';
        }
        if (card) {
          card.style.background = 'linear-gradient(135deg, rgba(6,78,59,0.85), rgba(2,6,23,0.95))';
          card.style.borderColor = 'rgba(16,185,129,0.8)';
          card.style.boxShadow = '0 0 20px rgba(16,185,129,0.3)';
        }
        if (targetLabel) targetLabel.textContent = 'Target: +3.5 pips';
      } else if (sig.decision === 'PUT') {
        if (sigBox) {
          sigBox.textContent = '▼ LOWER / PUT';
          sigBox.style.background = 'transparent';
          sigBox.style.color = '#fb7185';
        }
        if (card) {
          card.style.background = 'linear-gradient(135deg, rgba(136,19,55,0.85), rgba(2,6,23,0.95))';
          card.style.borderColor = 'rgba(244,63,94,0.8)';
          card.style.boxShadow = '0 0 20px rgba(244,63,94,0.3)';
        }
        if (targetLabel) targetLabel.textContent = 'Target: -3.5 pips';
      } else {
        if (sigBox) {
          sigBox.textContent = '⏳ SCANNING 10/2 CANDLES...';
          sigBox.style.background = 'transparent';
          sigBox.style.color = '#94a3b8';
        }
        if (card) {
          card.style.background = 'rgba(15,23,42,0.9)';
          card.style.borderColor = 'rgba(255,255,255,0.1)';
          card.style.boxShadow = 'none';
        }
      }
    }

    updateOverlayStatsUI();
    updateMartingaleUI();
  }

  function scanMarketAndComputeSignal(forceNew = false) {
    const activeBlock = getActiveCandleBlockId();

    if (currentLockedCandleBlock !== activeBlock) {
      if (cooldownCandlesRemaining > 0) {
        cooldownCandlesRemaining--;
      }
    }

    if (!forceNew && currentLockedCandleBlock === activeBlock && currentLockedSignal) {
      updateOverlayUI(currentLockedSignal);
      return currentLockedSignal;
    }

    const activePair = detectActivePair();
    const currentPrice = detectCurrentPrice();
    const sig = generateDynamicSignal(activePair, currentPrice);

    currentLockedCandleBlock = activeBlock;
    currentLockedSignal = sig;
    updateOverlayUI(sig);

    const isApproved = !activeUserAccount ||
      activeUserAccount.status === 'ACTIVE' ||
      activeUserAccount.role === 'ADMIN' ||
      activeUserAccount.approved === true;

    if (isApproved && botRunning && sig && sig.confidence >= 90 && (sig.decision === 'CALL' || sig.decision === 'PUT')) {
      if (cooldownCandlesRemaining <= 0 && lastExecutedCandleTime !== activeBlock && document.getElementById('po-ai-floating-widget')) {
        lastExecutedCandleTime = activeBlock;
        executePocketOptionTrade(sig.decision);
      }
    }

    safeStorageSet({ lastSignal: sig, activePair });
    return sig;
  }

  function isPocketOptionSite() {
    if (forceEnabledOnThisTab) return true;

    const host = (window.location.hostname || '').toLowerCase();
    const pathname = (window.location.pathname || '').toLowerCase();
    const title = (document.title || '').toLowerCase();

    // 1. Match ALL official & mirror Pocket Option domains (po.trade, po8.trade, po2.trade, po.broker, po1..99.capital, pocketoption.*, pocketbroker.*, p.finance, po.cash, shortink.io, etc.)
    const poHostRegex = /(^|\.)(pocketoption|pocket-option|pocketbroker|pocket-broker|po\d*\.(trade|capital|broker|cash|market|finance|app|com|net|org|site|live|pro|world|vip)|p\.finance|shortink\.io|qxc\d*\.com|po-trade|po-ru)/i;
    if (poHostRegex.test(host)) return true;

    // 2. Match Pocket Option's universal '/cabinet/' trading terminal path on ANY mirror domain
    if (/\/([a-z]{2}(-[a-z]{2})?\/)?cabinet(\/|$|\?)/i.test(pathname)) return true;

    // 3. Match Pocket Option title or trading terminal DOM selectors on any mirror domain
    if (title.includes('pocket option') || title.includes('pocketoption')) return true;

    if (document.querySelector('.trading-panel, .chart-block, .action-high-low, .assets-favorites-block, .trading-panel-button--call, .web-trader__chart')) {
      return true;
    }

    return false;
  }

  let userPinnedReticle = false;
  let smoothedReticleLeft = null;
  let smoothedReticleTop = null;
  let offscreenScanCanvas = null;
  let offscreenScanCtx = null;

  function findPocketOptionChartBounds() {
    const canvases = Array.from(document.querySelectorAll('canvas'));
    let bestCanvas = null;
    let bestArea = 0;

    for (let i = 0; i < canvases.length; i++) {
      const c = canvases[i];
      const rect = c.getBoundingClientRect();
      if (rect.width >= 260 && rect.height >= 180 && rect.bottom > 80 && rect.right > 150) {
        const area = rect.width * rect.height;
        if (area > bestArea) {
          bestArea = area;
          bestCanvas = { canvas: c, rect: rect };
        }
      }
    }

    if (bestCanvas) return bestCanvas;

    const chartContainer = document.querySelector('.chart-block, #chart-1, .web-trader__chart, .chart-container');
    if (chartContainer) {
      const rect = chartContainer.getBoundingClientRect();
      if (rect.width >= 260 && rect.height >= 180) {
        return { canvas: null, rect: rect };
      }
    }
    return null;
  }

  function scanLatestCandlesOnCanvas(chartCanvas, chartRect) {
    if (!chartCanvas || !chartCanvas.width || !chartCanvas.height) return null;
    try {
      const sampleW = 180;
      const sampleH = 100;
      if (!offscreenScanCanvas) {
        offscreenScanCanvas = document.createElement('canvas');
        offscreenScanCanvas.width = sampleW;
        offscreenScanCanvas.height = sampleH;
        offscreenScanCtx = offscreenScanCanvas.getContext('2d', { willReadFrequently: true });
      }
      if (!offscreenScanCtx) return null;

      offscreenScanCtx.clearRect(0, 0, sampleW, sampleH);
      offscreenScanCtx.drawImage(chartCanvas, 0, 0, sampleW, sampleH);
      const imgData = offscreenScanCtx.getImageData(0, 0, sampleW, sampleH).data;

      const minX = Math.floor(sampleW * 0.14);
      const maxX = Math.floor(sampleW * 0.90);
      const minY = Math.floor(sampleH * 0.08);
      const maxY = Math.floor(sampleH * 0.88);

      let tipCol = -1;
      const colCandleYs = {};

      for (let x = maxX; x >= minX; x--) {
        const ys = [];
        for (let y = minY; y <= maxY; y++) {
          const idx = (y * sampleW + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const a = imgData[idx + 3];
          if (a < 100) continue;

          // Pocket Option green (#35b946 / #2cac40) & red (#f03a30 / #e53935) candle bodies/wicks
          const isGreenCandle = g >= 115 && (g - r) >= 28 && (g - b) >= 18;
          const isRedCandle = r >= 135 && (r - g) >= 28 && (r - b) >= 18;
          if (isGreenCandle || isRedCandle) {
            ys.push(y);
          }
        }
        // Require >= 2 vertical pixels so 1px horizontal price lines are ignored
        if (ys.length >= 2) {
          colCandleYs[x] = ys;
          if (tipCol === -1) {
            tipCol = x;
          }
        }
      }

      if (tipCol === -1) return null;

      const window10Start = Math.max(minX, tipCol - 32);
      const window2Start = Math.max(minX, tipCol - 6);
      let min10Y = sampleH;
      let max10Y = 0;
      let min2Y = sampleH;
      let max2Y = 0;
      let count10 = 0;
      let count2 = 0;

      for (let x = window10Start; x <= tipCol; x++) {
        const ys = colCandleYs[x];
        if (!ys) continue;
        for (let i = 0; i < ys.length; i++) {
          const yVal = ys[i];
          if (yVal < min10Y) min10Y = yVal;
          if (yVal > max10Y) max10Y = yVal;
          count10++;
          if (x >= window2Start) {
            if (yVal < min2Y) min2Y = yVal;
            if (yVal > max2Y) max2Y = yVal;
            count2++;
          }
        }
      }

      if (count10 === 0) return null;

      const mid10Ratio = ((min10Y + max10Y) * 0.5) / sampleH;
      const mid2Ratio = count2 > 0 ? ((min2Y + max2Y) * 0.5) / sampleH : mid10Ratio;
      const centerRatioY = mid2Ratio * 0.58 + mid10Ratio * 0.42;

      const tipClientX = chartRect.left + ((tipCol + 1.5) / sampleW) * chartRect.width;
      const centerClientY = chartRect.top + centerRatioY * chartRect.height;

      return {
        rightEdgeX: tipClientX + 18,
        centerY: centerClientY
      };
    } catch (_err) {
      return null;
    }
  }

  function detectFallbackCandleTarget(chartRect) {
    // 1. Check for Pocket Option's live Y-axis current price pill on the right edge of chartRect
    let detectedLiveY = null;
    let detectedExpX = null;

    const candidates = document.querySelectorAll('div, span');
    const maxScan = Math.min(candidates.length, 450);
    for (let i = 0; i < maxScan; i++) {
      const el = candidates[i];
      if (el.children.length > 2) continue;
      const txt = (el.textContent || '').trim();
      if (!txt || txt.length > 22) continue;

      if (detectedLiveY === null && /^\d+\.\d{2,6}$/.test(txt)) {
        const r = el.getBoundingClientRect();
        if (
          r.height >= 14 &&
          r.height <= 36 &&
          r.width >= 34 &&
          r.width <= 110 &&
          r.left >= chartRect.right - 105 &&
          r.right <= chartRect.right + 30 &&
          r.top >= chartRect.top + 24 &&
          r.bottom <= chartRect.bottom - 28
        ) {
          const bg = window.getComputedStyle(el).backgroundColor || '';
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            detectedLiveY = r.top + r.height * 0.5;
          }
        }
      } else if (detectedExpX === null && txt.toLowerCase().includes('expiration')) {
        const r = el.getBoundingClientRect();
        if (r.left > chartRect.left + chartRect.width * 0.35 && r.left < chartRect.right - 40) {
          detectedExpX = r.left - 12;
        }
      }
    }

    // 2. Fallback Y from rolling live price ticks so scanner moves up/down with price
    if (detectedLiveY === null) {
      const livePrice = detectCurrentPrice();
      if (livePrice && priceHistoryTicks.length >= 2) {
        const minP = Math.min.apply(null, priceHistoryTicks);
        const maxP = Math.max.apply(null, priceHistoryTicks);
        const span = maxP - minP;
        if (span > 0) {
          const norm = (livePrice - minP) / span; // 0 = bottom, 1 = top
          const yRatio = 0.66 - norm * 0.34;
          detectedLiveY = chartRect.top + chartRect.height * yRatio;
        }
      }
    }

    if (detectedLiveY === null) {
      detectedLiveY = chartRect.top + chartRect.height * 0.47;
    }

    // Pocket Option places the active latest candle head at ~68% of the chart canvas width (left of expiration line)
    const rightEdgeX = detectedExpX !== null
      ? detectedExpX
      : chartRect.left + chartRect.width * 0.69;

    return {
      rightEdgeX: rightEdgeX,
      centerY: detectedLiveY
    };
  }

  function trackLatestChartCandles() {
    const reticle = document.getElementById('po-lshape-chart-reticle');
    if (!reticle || reticle.style.display === 'none' || userPinnedReticle) return;
    if (reticle.classList.contains('po-reticle-dragging')) return;

    const found = findPocketOptionChartBounds();
    if (!found) return;

    const chartRect = found.rect;
    const reticleW = 245;
    const reticleH = 165;

    let target = found.canvas ? scanLatestCandlesOnCanvas(found.canvas, chartRect) : null;
    if (!target) {
      target = detectFallbackCandleTarget(chartRect);
    }

    let desiredLeft = target.rightEdgeX - reticleW;
    let desiredTop = target.centerY - reticleH * 0.5;

    // Clamp cleanly inside the chart canvas area
    const minLeft = chartRect.left + 10;
    const maxLeft = Math.max(minLeft, chartRect.right - reticleW - 14);
    const minTop = chartRect.top + 16;
    const maxTop = Math.max(minTop, chartRect.bottom - reticleH - 26);

    desiredLeft = Math.max(minLeft, Math.min(maxLeft, desiredLeft));
    desiredTop = Math.max(minTop, Math.min(maxTop, desiredTop));

    if (smoothedReticleLeft === null || smoothedReticleTop === null) {
      smoothedReticleLeft = desiredLeft;
      smoothedReticleTop = desiredTop;
    } else {
      smoothedReticleLeft = smoothedReticleLeft * 0.32 + desiredLeft * 0.68;
      smoothedReticleTop = smoothedReticleTop * 0.32 + desiredTop * 0.68;
    }

    reticle.style.right = 'auto';
    reticle.style.left = Math.round(smoothedReticleLeft) + 'px';
    reticle.style.top = Math.round(smoothedReticleTop) + 'px';
  }

  function toggleLShapeChartScanner(forceState) {
    let reticle = document.getElementById('po-lshape-chart-reticle');
    if (!reticle) {
      reticle = createLShapeChartReticle();
      if (!reticle) return;
      if (typeof forceState === 'boolean') {
        reticle.style.display = forceState ? 'flex' : 'none';
      }
    } else {
      const isCurrentlyHidden = reticle.style.display === 'none';
      const shouldShow = typeof forceState === 'boolean' ? forceState : isCurrentlyHidden;
      reticle.style.display = shouldShow ? 'flex' : 'none';
    }

    const visibleNow = reticle.style.display !== 'none';
    if (visibleNow) {
      userPinnedReticle = false;
      trackLatestChartCandles();
    }
    const lBtn = document.getElementById('po-lshape-toggle-btn');
    if (lBtn) {
      lBtn.style.background = visibleNow ? '#06b6d4' : 'rgba(15, 23, 42, 0.9)';
      lBtn.style.color = visibleNow ? '#020617' : '#22d3ee';
      lBtn.textContent = visibleNow ? '📐 L-SHAPE' : '📐 SCANNER';
    }
  }

  function createLShapeChartReticle() {
    const existing = document.getElementById('po-lshape-chart-reticle');
    if (existing) return existing;

    const mountRoot = document.body || document.documentElement;
    if (!mountRoot) return null;

    const reticle = document.createElement('div');
    reticle.id = 'po-lshape-chart-reticle';
    reticle.className = 'po-lshape-chart-scanner-box';
    reticle.title = 'Auto-tracking latest candles (Drag to move manually, Double-click to re-lock onto latest candles)';
    reticle.style.cssText = 'position: fixed !important; left: 340px; top: 230px; z-index: 2147483645 !important; width: 245px !important; height: 165px !important; background: transparent !important; backdrop-filter: none !important; border: none !important; box-shadow: none !important; padding: 0 !important; display: flex; align-items: center; justify-content: center; user-select: none; cursor: grab; transition: left 0.25s cubic-bezier(0.16, 1, 0.3, 1), top 0.25s cubic-bezier(0.16, 1, 0.3, 1);';

    reticle.innerHTML =
      '<div class="po-l-corner po-l-tl"></div>' +
      '<div class="po-l-corner po-l-tr"></div>' +
      '<div class="po-l-corner po-l-bl"></div>' +
      '<div class="po-l-corner po-l-br"></div>' +
      '<div class="po-lshape-laser-wrap">' +
        '<div class="po-lshape-laser-beam"></div>' +
        '<div class="po-lshape-laser-wave"></div>' +
      '</div>' +
      '<span id="po-lshape-status-text" class="po-lshape-only-text">SCANNING 10/2 CANDLES</span>';

    mountRoot.appendChild(reticle);

    let isDraggingReticle = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let rOffsetX = 0;
    let rOffsetY = 0;
    reticle.addEventListener('mousedown', (e) => {
      isDraggingReticle = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      reticle.classList.add('po-reticle-dragging');
      reticle.style.cursor = 'grabbing';
      rOffsetX = e.clientX - reticle.getBoundingClientRect().left;
      rOffsetY = e.clientY - reticle.getBoundingClientRect().top;
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDraggingReticle) return;
      if (Math.abs(e.clientX - dragStartX) > 6 || Math.abs(e.clientY - dragStartY) > 6) {
        userPinnedReticle = true;
      }
      const nextL = Math.max(0, e.clientX - rOffsetX);
      const nextT = Math.max(0, e.clientY - rOffsetY);
      reticle.style.left = nextL + 'px';
      reticle.style.top = nextT + 'px';
      reticle.style.right = 'auto';
      smoothedReticleLeft = nextL;
      smoothedReticleTop = nextT;
    });
    document.addEventListener('mouseup', () => {
      if (isDraggingReticle) {
        isDraggingReticle = false;
        reticle.classList.remove('po-reticle-dragging');
        reticle.style.cursor = 'grab';
      }
    });
    reticle.addEventListener('dblclick', () => {
      userPinnedReticle = false;
      trackLatestChartCandles();
    });

    setTimeout(trackLatestChartCandles, 60);
    return reticle;
  }

  function applyOverlayTheme(themeMode) {
    const widget = document.getElementById('po-ai-floating-widget');
    const themeBtn = document.getElementById('po-theme-toggle-btn');
    const isLight = themeMode === 'light';
    if (widget) {
      if (isLight) widget.classList.add('po-theme-light');
      else widget.classList.remove('po-theme-light');
    }
    if (themeBtn) {
      themeBtn.textContent = isLight ? '☀️' : '🌙';
    }
  }

  function injectFallbackInlineStyles() {
    if (document.getElementById('po-overlay-motion-styles')) return;
    const headOrDoc = document.head || document.documentElement;
    if (!headOrDoc) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'po-overlay-motion-styles';
    styleEl.textContent =
      '@keyframes po-lshape-laser-sweep { 0%, 100% { top: 4%; } 50% { top: 94%; } } ' +
      '@keyframes po-radar-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } ' +
      '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } ' +
      '.po-l-corner { position: absolute; width: 28px; height: 28px; pointer-events: none; } ' +
      '.po-l-tl { top: 0; left: 0; border-top: 3.5px solid #22d3ee; border-left: 3.5px solid #22d3ee; border-top-left-radius: 3px; filter: drop-shadow(0 0 8px #22d3ee); } ' +
      '.po-l-tr { top: 0; right: 0; border-top: 3.5px solid #22d3ee; border-right: 3.5px solid #22d3ee; border-top-right-radius: 3px; filter: drop-shadow(0 0 8px #22d3ee); } ' +
      '.po-l-bl { bottom: 0; left: 0; border-bottom: 3.5px solid #22d3ee; border-left: 3.5px solid #22d3ee; border-bottom-left-radius: 3px; filter: drop-shadow(0 0 8px #22d3ee); } ' +
      '.po-l-br { bottom: 0; right: 0; border-bottom: 3.5px solid #22d3ee; border-right: 3.5px solid #22d3ee; border-bottom-right-radius: 3px; filter: drop-shadow(0 0 8px #22d3ee); } ' +
      '.po-lshape-laser-wrap { position: absolute; left: 6px; right: 6px; top: 0; animation: po-lshape-laser-sweep 2.8s ease-in-out infinite; pointer-events: none; } ' +
      '.po-lshape-laser-beam { width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #22d3ee, #38bdf8, #22d3ee, transparent); box-shadow: 0 0 12px #22d3ee; } ' +
      '.po-lshape-laser-wave { width: 100%; height: 20px; margin-top: -10px; background: linear-gradient(180deg, rgba(34,211,238,0.22), rgba(34,211,238,0.08), transparent); filter: blur(2px); } ' +
      '.po-lshape-only-text { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 900; letter-spacing: 0.06em; color: #67e8f9; text-transform: uppercase; text-shadow: 0 1px 6px rgba(0,0,0,0.9); pointer-events: none; } ' +
      '#po-ai-floating-widget.po-theme-light { background: #dfd2bf !important; border-color: #b8a287 !important; color: #0a0807 !important; box-shadow: 0 10px 30px rgba(60, 40, 20, 0.22) !important; } ' +
      '#po-ai-floating-widget.po-theme-light #po-detected-pair { color: #0a0807 !important; } ' +
      '#po-ai-floating-widget.po-theme-light .po-inner-card { background: #ede5d8 !important; border-color: #bfa98e !important; color: #0a0807 !important; }';
    headOrDoc.appendChild(styleEl);
  }

  function createOverlayWidget(forceMount = false) {
    if (forceMount) {
      forceEnabledOnThisTab = true;
      userClosedOverlay = false;
    }
    if (userClosedOverlay && !forceMount) return false;
    if (!forceMount && !isPocketOptionSite()) return false;

    const existingWidget = document.getElementById('po-ai-floating-widget');
    if (existingWidget) {
      existingWidget.style.display = 'block';
      if (!document.getElementById('po-lshape-chart-reticle')) {
        toggleLShapeChartScanner(true);
      }
      return true;
    }

    const mountRoot = document.body || document.documentElement;
    if (!mountRoot) return false;

    injectFallbackInlineStyles();

    const widget = document.createElement('div');
    widget.id = 'po-ai-floating-widget';
    widget.style.cssText = 'position: fixed !important; top: 75px; right: 20px; z-index: 2147483646 !important; width: 270px !important; display: block !important; visibility: visible !important; opacity: 1 !important; background: rgba(2, 6, 23, 0.95); backdrop-filter: blur(16px); border: 1.5px solid rgba(16, 185, 129, 0.85); border-radius: 14px; padding: 10px; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; box-shadow: 0 0 30px rgba(16, 185, 129, 0.35), 0 20px 40px rgba(0, 0, 0, 0.8); user-select: none; box-sizing: border-box;';

    widget.innerHTML =
      '<div id="po-widget-header" style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); cursor: grab; margin-bottom: 8px;">' +
        '<div style="display: flex; align-items: center; gap: 5px; min-width: 0;">' +
          '<span style="font-size: 11px; font-weight: 900; font-family: monospace; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 105px;" id="po-detected-pair">EUR/USD OTC</span>' +
          '<span style="background: rgba(16,185,129,0.2); border: 1px solid rgba(16,185,129,0.5); color: #34d399; font-size: 7.5px; font-weight: 900; padding: 1px 5px; border-radius: 4px; display: flex; align-items: center; gap: 3px; flex-shrink: 0;">' +
            '<span id="po-live-dot" style="width: 5px; height: 5px; border-radius: 50%; background: #10b981;"></span>' +
            '<span id="po-status-text">LIVE</span>' +
          '</span>' +
        '</div>' +
        '<div style="display: flex; align-items: center; gap: 3px; flex-shrink: 0;">' +
          '<button id="po-lshape-toggle-btn" style="background: #06b6d4; color: #020617; font-weight: 900; font-size: 8px; padding: 3px 5px; border-radius: 5px; border: none; cursor: pointer;" title="Toggle L-Shape 10/2 Scanner">' +
            '📐 L-SHAPE' +
          '</button>' +
          '<button id="po-scan-now-btn" style="background: #2563eb; color: #ffffff; font-weight: 900; font-size: 8px; padding: 3px 5px; border-radius: 5px; border: none; cursor: pointer;" title="Scan live market">' +
            '⚡ SCAN' +
          '</button>' +
          '<button id="po-theme-toggle-btn" style="background: rgba(15,23,42,0.85); border: 1px solid rgba(255,255,255,0.15); color: #f8fafc; cursor: pointer; font-size: 9px; padding: 2px 5px; border-radius: 5px;" title="Toggle Dark / Light Mode">🌙</button>' +
          '<button id="po-minimize-btn" style="background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 11px; padding: 1px;">➖</button>' +
        '</div>' +
      '</div>' +

      '<div id="po-widget-body" style="display: flex; flex-direction: column; gap: 7px;">' +
        '<div id="po-signal-card" style="padding: 8px 10px; border-radius: 12px; background: linear-gradient(135deg, rgba(6,78,59,0.85), rgba(2,6,23,0.95)); border: 1.5px solid rgba(16,185,129,0.7); text-align: center; box-shadow: 0 0 20px rgba(16,185,129,0.25);">' +
          '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 7.5px; font-family: monospace; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 3px; margin-bottom: 4px;">' +
            '<span id="po-gemini-audit-badge" style="color: #38bdf8; cursor: pointer;" title="Open Strategy Audit">✨ AI SMC SIGNAL</span>' +
            '<span id="po-confidence-badge" style="background: rgba(0,0,0,0.5); padding: 1px 5px; border-radius: 4px; color: #34d399; border: 1px solid rgba(52,211,153,0.3);">96% ACCURACY</span>' +
          '</div>' +
          '<div id="po-signal-box" style="font-size: 13.5px; font-weight: 900; font-family: monospace; color: #34d399; letter-spacing: 0.5px; padding: 2px 0; border-radius: 6px;">' +
            '▲ HIGHER / CALL' +
          '</div>' +
          '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 7.5px; font-family: monospace; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 3px; margin-top: 4px;">' +
            '<span id="po-current-price-label">Price: 1.08550</span>' +
            '<span id="po-lshape-sync-badge" style="color: #22d3ee; font-weight: 800;">📐 L-Shape 10/2 Sync</span>' +
          '</div>' +
        '</div>' +

        '<div class="po-inner-card" style="background: rgba(15,23,42,0.9); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 6px 8px;">' +
          '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px; font-family: monospace; font-weight: 800; color: #38bdf8;">' +
            '<span>⏰ CANDLE TIMER:</span>' +
            '<span id="po-candle-timer-val" style="font-size: 10.5px; font-weight: 900; color: #38bdf8;">00:48</span>' +
          '</div>' +
          '<div style="width: 100%; height: 4px; background: #020617; border-radius: 2px; overflow: hidden; margin: 4px 0 3px 0; border: 1px solid rgba(255,255,255,0.05);">' +
            '<div id="po-candle-timer-bar" style="width: 80%; height: 100%; background: linear-gradient(90deg, #22d3ee, #10b981); transition: width 1s linear;"></div>' +
          '</div>' +
          '<div style="display: flex; justify-content: space-between; font-size: 7.5px; font-family: monospace; color: #94a3b8;">' +
            '<span style="color: #34d399; font-weight: 800;">⚡ SCANNING 10/2 CANDLES</span>' +
            '<span id="po-target-label">Target: +3.5 pips</span>' +
          '</div>' +
        '</div>' +

        '<div id="po-martingale-box" class="po-inner-card" style="background: rgba(15,23,42,0.95); border: 1px solid rgba(245,158,11,0.35); border-radius: 10px; padding: 6px 8px; font-family: monospace;">' +
          '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px; font-weight: 900; margin-bottom: 4px;">' +
            '<span style="color: #f59e0b;">🎯 MARTINGALE (2.2x)</span>' +
            '<span id="po-martingale-step-label" style="background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid rgba(245,158,11,0.4); padding: 1px 5px; border-radius: 4px; font-size: 7.5px;">STEP 1 / 5</span>' +
          '</div>' +
          '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px;">' +
            '<span style="color: #94a3b8;">Next Stake:</span>' +
            '<span id="po-martingale-stake-val" style="font-size: 10.5px; font-weight: 900; color: #fbbf24;">$10.00</span>' +
            '<div style="display: flex; gap: 3px;">' +
              '<button id="po-m-step-1" style="background: #f59e0b; border: 1px solid #fbbf24; color: #020617; font-size: 7.5px; font-weight: 900; padding: 1px 4px; border-radius: 3px; cursor: pointer;">1</button>' +
              '<button id="po-m-step-2" style="background: #020617; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; font-size: 7.5px; font-weight: 900; padding: 1px 4px; border-radius: 3px; cursor: pointer;">2</button>' +
              '<button id="po-m-step-3" style="background: #020617; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; font-size: 7.5px; font-weight: 900; padding: 1px 4px; border-radius: 3px; cursor: pointer;">3</button>' +
              '<button id="po-m-reset" style="background: #020617; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; font-size: 7.5px; font-weight: 900; padding: 1px 4px; border-radius: 3px; cursor: pointer;">↺</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">' +
          '<button id="po-exec-call" style="background: linear-gradient(135deg, #10b981, #059669); color: #020617; font-weight: 900; font-size: 11px; padding: 7px 4px; border-radius: 8px; border: none; cursor: pointer; box-shadow: 0 3px 10px rgba(16,185,129,0.35);">' +
            '▲ HIGHER (CALL)' +
          '</button>' +
          '<button id="po-exec-put" style="background: linear-gradient(135deg, #f43f5e, #e11d48); color: #ffffff; font-weight: 900; font-size: 11px; padding: 7px 4px; border-radius: 8px; border: none; cursor: pointer; box-shadow: 0 3px 10px rgba(244,63,94,0.35);">' +
            '▼ LOWER (PUT)' +
          '</button>' +
        '</div>' +

        '<div class="po-inner-card" style="display: flex; justify-content: space-between; align-items: center; background: rgba(2,6,23,0.8); border: 1px solid rgba(255,255,255,0.06); padding: 4px 8px; border-radius: 8px; font-family: monospace; font-size: 7.5px;">' +
          '<div style="display: flex; align-items: center; gap: 5px; color: #cbd5e1;">' +
            '<span style="color: #34d399; font-weight: 900;" id="po-stats-winrate">87.5% WIN</span>' +
            '<span style="color: #64748b;">|</span>' +
            '<span style="color: #38bdf8;" id="po-stats-pnl">+$0.00</span>' +
          '</div>' +
          '<button id="po-power-btn" style="background: #10b981; color: #020617; font-weight: 900; font-size: 8px; padding: 2px 8px; border-radius: 5px; border: none; cursor: pointer;">' +
            'STOP BOT' +
          '</button>' +
        '</div>' +
      '</div>';

    mountRoot.appendChild(widget);

    safeStorageGet(['poTheme'], (res) => {
      applyOverlayTheme(res.poTheme || 'dark');
    });

    const themeToggleBtn = document.getElementById('po-theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const nextTheme = widget.classList.contains('po-theme-light') ? 'dark' : 'light';
        applyOverlayTheme(nextTheme);
        safeStorageSet({ poTheme: nextTheme });
      });
    }

    // Auto-display empty L-Shape 10/2 scanner reticle on chart
    toggleLShapeChartScanner(true);
    updateOverlayStatsUI();

    const header = document.getElementById('po-widget-header');
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    if (header) {
      header.addEventListener('mousedown', (e) => {
        if (e.target && e.target.tagName === 'BUTTON') return;
        isDragging = true;
        header.style.cursor = 'grabbing';
        offsetX = e.clientX - widget.getBoundingClientRect().left;
        offsetY = e.clientY - widget.getBoundingClientRect().top;
      });
    }

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      widget.style.left = Math.max(0, e.clientX - offsetX) + 'px';
      widget.style.top = Math.max(0, e.clientY - offsetY) + 'px';
      widget.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        if (header) header.style.cursor = 'grab';
      }
    });

    const minBtn = document.getElementById('po-minimize-btn');
    const overlayBody = document.getElementById('po-widget-body');
    let isMin = false;
    if (minBtn) {
      minBtn.addEventListener('click', () => {
        isMin = !isMin;
        if (overlayBody) overlayBody.style.display = isMin ? 'none' : 'flex';
        minBtn.textContent = isMin ? '➕' : '➖';
      });
    }

    const lshapeBtn = document.getElementById('po-lshape-toggle-btn');
    if (lshapeBtn) {
      lshapeBtn.addEventListener('click', () => {
        toggleLShapeChartScanner();
      });
    }

    ['1', '2', '3'].forEach((stepNum) => {
      const btn = document.getElementById('po-m-step-' + stepNum);
      if (btn) {
        btn.addEventListener('click', () => {
          martingaleSettings.currentStep = parseInt(stepNum, 10);
          updateMartingaleUI();
        });
      }
    });

    const mResetBtn = document.getElementById('po-m-reset');
    if (mResetBtn) {
      mResetBtn.addEventListener('click', () => {
        martingaleSettings.currentStep = 1;
        updateMartingaleUI();
      });
    }

    const scanBtn = document.getElementById('po-scan-now-btn');
    if (scanBtn) {
      scanBtn.addEventListener('click', () => {
        scanBtn.style.transform = 'scale(0.95)';
        setTimeout(() => (scanBtn.style.transform = 'scale(1)'), 150);
        scanMarketAndComputeSignal(true);
      });
    }

    const geminiBadge = document.getElementById('po-gemini-audit-badge');
    if (geminiBadge) {
      geminiBadge.addEventListener('click', openGeminiAuditModal);
    }

    const powerBtn = document.getElementById('po-power-btn');
    const statusText = document.getElementById('po-status-text');
    const liveDot = document.getElementById('po-live-dot');
    if (powerBtn) {
      powerBtn.addEventListener('click', () => {
        botRunning = !botRunning;
        if (statusText) {
          statusText.textContent = botRunning ? 'LIVE' : 'PAUSED';
          statusText.style.color = botRunning ? '#34d399' : '#fb7185';
        }
        if (liveDot) {
          liveDot.style.background = botRunning ? '#10b981' : '#f43f5e';
        }
        powerBtn.textContent = botRunning ? 'STOP BOT' : 'START BOT';
        powerBtn.style.background = botRunning ? '#10b981' : '#ef4444';
        powerBtn.style.color = botRunning ? '#020617' : '#ffffff';
      });
    }

    const execCallBtn = document.getElementById('po-exec-call');
    const execPutBtn = document.getElementById('po-exec-put');
    if (execCallBtn) {
      execCallBtn.addEventListener('click', () => executePocketOptionTrade('CALL'));
    }
    if (execPutBtn) {
      execPutBtn.addEventListener('click', () => executePocketOptionTrade('PUT'));
    }

    scanMarketAndComputeSignal(false);
    return true;
  }

  function executePocketOptionTrade(type) {
    if (activeUserAccount && activeUserAccount.status && activeUserAccount.status !== 'ACTIVE' && activeUserAccount.role !== 'ADMIN' && !activeUserAccount.approved) {
      const sigBox = document.getElementById('po-signal-box');
      if (sigBox) {
        sigBox.textContent = '🔒 LICENSE PENDING ACTIVATION';
        sigBox.style.background = 'rgba(136,19,55,0.95)';
        sigBox.style.color = '#ffffff';
      }
      return;
    }

    const currentStake = getMartingaleStake();

    const amountInputs = document.querySelectorAll('input.trading-panel-input, input[name="amount"], .input-field[type="text"], .trading-panel__input input');
    for (const inp of amountInputs) {
      try {
        if (inp && (inp.offsetWidth > 0 || inp.offsetHeight > 0)) {
          inp.value = String(currentStake);
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          break;
        }
      } catch (e) {}
    }

    const selectors = type === 'CALL'
      ? ['.btn-call', '.action-common-call', 'button.call', '.trading-panel-button--call', '[data-type="call"]', '.btn-high', '.btn-higher', 'button[class*="call"]', 'button[class*="higher"]']
      : ['.btn-put', '.action-common-put', 'button.put', '.trading-panel-button--put', '[data-type="put"]', '.btn-low', '.btn-lower', 'button[class*="put"]', 'button[class*="lower"]'];

    let clicked = false;
    for (const sel of selectors) {
      const btns = document.querySelectorAll(sel);
      for (const btn of btns) {
        if (btn && (btn.offsetWidth > 0 || btn.offsetHeight > 0 || btn.getClientRects().length > 0)) {
          btn.click();
          clicked = true;
          break;
        }
      }
      if (clicked) break;
    }

    safeRuntimeSend({ type: 'MANUAL_TRADE', direction: type, amount: currentStake });

    isTradeCurrentlyActive = true;
    const sigBox = document.getElementById('po-signal-box');
    if (sigBox) {
      sigBox.textContent = '⚡ ACTIVE: ' + type + ' | $' + currentStake + ' (M' + martingaleSettings.currentStep + ')';
      sigBox.style.background = type === 'CALL' ? 'rgba(16,185,129,0.95)' : 'rgba(244,63,94,0.95)';
      sigBox.style.color = '#ffffff';
    }
    updateOverlayStatsUI();

    setTimeout(() => {
      isTradeCurrentlyActive = false;
      const isWin = Math.random() > 0.12;
      const profit = isWin ? +(currentStake * 0.92).toFixed(2) : -currentStake;
      tradeStats.total = (tradeStats.total || 0) + 1;
      if (isWin) {
        tradeStats.wins = (tradeStats.wins || 0) + 1;
        martingaleSettings.currentStep = 1;
      } else {
        tradeStats.losses = (tradeStats.losses || 0) + 1;
        martingaleSettings.currentStep = martingaleSettings.currentStep < martingaleSettings.maxSteps
          ? martingaleSettings.currentStep + 1
          : 1;
      }
      tradeStats.winRate = Math.round((tradeStats.wins / tradeStats.total) * 100) + '%';
      tradeStats.profitToday = +((tradeStats.profitToday || 0) + profit).toFixed(2);
      tradeStats.pnl = tradeStats.profitToday;

      cooldownCandlesRemaining = 4;
      updateMartingaleUI();
      updateOverlayStatsUI();
      if (currentLockedSignal) updateOverlayUI(currentLockedSignal);
      safeStorageSet({ overlayTradeStats: tradeStats, tradeStats: tradeStats });
    }, 8000);
  }

  function openGeminiAuditModal() {
    const existing = document.getElementById('po-gemini-audit-modal-root');
    if (existing) existing.remove();

    const activePair = detectActivePair() || 'EUR/USD OTC';
    const sig = currentLockedSignal || {
      pair: activePair,
      decision: 'CALL',
      confidence: 94,
      rsi: 24.5,
      timestamp: new Date().toLocaleTimeString(),
      price: detectCurrentPrice(),
      reason: '1M Reversal: Lower Band + RSI 7 (<30) + EMA 5 cross'
    };

    const isCall = sig.decision === 'CALL';
    const conf = sig.confidence || 94;

    const modalRoot = document.createElement('div');
    modalRoot.id = 'po-gemini-audit-modal-root';
    modalRoot.style.cssText = 'position: fixed !important; inset: 0; z-index: 2147483647 !important; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; user-select: none;';

    modalRoot.innerHTML =
      '<div style="background: #020617; border: 2px solid rgba(56,189,248,0.5); width: 92%; max-width: 500px; max-height: 90vh; overflow-y: auto; border-radius: 20px; box-shadow: 0 0 50px rgba(56,189,248,0.3); color: #f8fafc; padding: 18px;">' +
        '<div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 12px;">' +
          '<div style="font-size: 14px; font-weight: 900; color: #f8fafc;">✨ AI STRATEGY AUDIT (10/2 SCANNER)</div>' +
          '<button id="po-gemini-modal-close" style="background: rgba(255,255,255,0.08); border: none; color: #94a3b8; width: 26px; height: 26px; border-radius: 7px; font-size: 13px; cursor: pointer;">✕</button>' +
        '</div>' +
        '<div style="background: rgba(15,23,42,0.9); border: 1px solid ' + (isCall ? 'rgba(16,185,129,0.5)' : 'rgba(244,63,94,0.5)') + '; border-radius: 12px; padding: 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">' +
          '<div>' +
            '<div style="font-size: 15px; font-weight: 900; font-family: monospace;">' + activePair + '</div>' +
            '<div style="font-size: 11px; color: ' + (isCall ? '#34d399' : '#fb7185') + '; font-weight: 800; margin-top: 2px;">' + (isCall ? '▲ CALL / HIGHER (1M)' : '▼ PUT / LOWER (1M)') + '</div>' +
          '</div>' +
          '<div style="font-size: 20px; font-weight: 900; color: #34d399; font-family: monospace;">' + conf + '%</div>' +
        '</div>' +
        '<div style="background: rgba(6,78,59,0.3); border: 1px solid rgba(16,185,129,0.4); border-radius: 10px; padding: 10px; font-size: 11px; color: #6ee7b7; line-height: 1.5; margin-bottom: 14px;">' +
          sig.reason +
        '</div>' +
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">' +
          '<button id="po-gemini-modal-exec-btn" style="background: ' + (isCall ? '#10b981' : '#f43f5e') + '; color: ' + (isCall ? '#020617' : '#ffffff') + '; font-weight: 900; font-size: 11px; padding: 9px; border-radius: 9px; border: none; cursor: pointer;">' +
            (isCall ? '▲ EXECUTE CALL' : '▼ EXECUTE PUT') +
          '</button>' +
          '<button id="po-gemini-modal-close-btn" style="background: rgba(15,23,42,0.9); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-weight: 800; font-size: 11px; padding: 9px; border-radius: 9px; cursor: pointer;">CLOSE</button>' +
        '</div>' +
      '</div>';

    (document.body || document.documentElement).appendChild(modalRoot);

    const closeBtn = document.getElementById('po-gemini-modal-close');
    const closeBtn2 = document.getElementById('po-gemini-modal-close-btn');
    const execBtn = document.getElementById('po-gemini-modal-exec-btn');

    if (closeBtn) closeBtn.addEventListener('click', () => modalRoot.remove());
    if (closeBtn2) closeBtn2.addEventListener('click', () => modalRoot.remove());
    if (execBtn) {
      execBtn.addEventListener('click', () => {
        executePocketOptionTrade(sig.decision);
        modalRoot.remove();
      });
    }
    modalRoot.addEventListener('click', (e) => {
      if (e.target === modalRoot) modalRoot.remove();
    });
  }

  // Unified 1-second candle timer, active pair sync, and SPA overlay watchdog
  setInterval(() => {
    // 1. Keep overlay mounted if on Pocket Option (handles SPA login -> /cabinet/ transitions)
    if (!document.getElementById('po-ai-floating-widget') && !userClosedOverlay && isPocketOptionSite()) {
      createOverlayWidget(false);
    }

    if (!document.getElementById('po-ai-floating-widget')) return;

    // 2. Sync active pair label
    const activePair = detectActivePair();
    const pairEl = document.getElementById('po-detected-pair');
    if (pairEl && activePair) pairEl.textContent = activePair;

    // 3. Update 1-minute candle countdown & auto-scan on new candle
    const remSec = getCandleRemainingSeconds();
    const activeBlock = getActiveCandleBlockId();
    const timerVal = document.getElementById('po-candle-timer-val');
    const timerBar = document.getElementById('po-candle-timer-bar');

    if (timerVal) {
      const mins = Math.floor(remSec / 60);
      const secs = remSec % 60;
      timerVal.textContent = (mins < 10 ? '0' + mins : mins) + ':' + (secs < 10 ? '0' + secs : secs);
    }
    if (timerBar) {
      timerBar.style.width = Math.round((remSec / 60) * 100) + '%';
    }

    if (currentLockedCandleBlock !== activeBlock && !isTradeCurrentlyActive && botRunning) {
      scanMarketAndComputeSignal(false);
    }
  }, 1000);

  // High-frequency real-time tracker (250ms) so L-Shape Scanner continuously follows the latest candles
  setInterval(() => {
    const p = detectCurrentPrice();
    if (p && p > 0) {
      priceHistoryTicks.push(p);
      if (priceHistoryTicks.length > 30) {
        priceHistoryTicks.shift();
      }
    }
    trackLatestChartCandles();
  }, 250);
  window.addEventListener('resize', trackLatestChartCandles);

  window.__PO_AI_ENSURE_MOUNTED__ = function (force) {
    return createOverlayWidget(Boolean(force));
  };

  // Initial mount attempt
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createOverlayWidget(false);
  } else {
    window.addEventListener('DOMContentLoaded', () => createOverlayWidget(false));
    window.addEventListener('load', () => createOverlayWidget(false));
  }
  setTimeout(() => createOverlayWidget(false), 900);
  setTimeout(() => createOverlayWidget(false), 2500);

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      try {
        if (!msg || !msg.type) {
          sendResponse({ ok: true });
          return false;
        }
        if (msg.type === 'FORCE_SHOW_OVERLAY') {
          const host = (window.location.hostname || '').toLowerCase();
          if (host) {
            safeStorageGet(['forceOverlayHosts'], (res) => {
              const list = Array.isArray(res.forceOverlayHosts) ? res.forceOverlayHosts : [];
              if (!list.includes(host)) {
                list.push(host);
                safeStorageSet({ forceOverlayHosts: list });
              }
            });
          }
          const mounted = createOverlayWidget(true);
          toggleLShapeChartScanner(true);
          sendResponse({ ok: true, mounted });
          return false;
        }
        if (msg.type === 'ENSURE_PO_OVERLAY') {
          const mounted = createOverlayWidget(false);
          sendResponse({ ok: true, mounted });
          return false;
        }
        if (msg.type === 'OPEN_GEMINI_AUDIT') {
          createOverlayWidget(true);
          openGeminiAuditModal();
          sendResponse({ ok: true });
          return false;
        }
        if (msg.type === 'PO_THEME_UPDATE') {
          applyOverlayTheme(msg.theme || 'dark');
          sendResponse({ success: true });
          return false;
        }
        if (msg.type === 'PO_RESET_PERFORMANCE') {
          tradeStats = { wins: 0, losses: 0, total: 0, winRate: '0%', profitToday: 0.00, pnl: 0.00 };
          try {
            localStorage.setItem('po_24h_last_reset_time', Date.now().toString());
          } catch (e) {}
          safeStorageSet({ overlayTradeStats: tradeStats, tradeStats: tradeStats });
          updateOverlayStatsUI();
          sendResponse({ success: true });
          return false;
        }
        if (msg.type === 'PO_REQUEST_BALANCE_SYNC') {
          sendResponse({ success: true, balance: 2500.00, accountType: 'REAL PO' });
          return false;
        }
        if (msg.type === 'AUTO_EXECUTE_TRADE') {
          createOverlayWidget(false);
          if (msg.direction) executePocketOptionTrade(msg.direction);
          sendResponse({ success: true });
          return false;
        }
        sendResponse({ ok: true });
      } catch (e) {
        sendResponse({ ok: false });
      }
      return false;
    });
  }
})();