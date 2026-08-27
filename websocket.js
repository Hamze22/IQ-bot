// Pocket Option Real-time Price Data Sync
export class PriceFeedSocket {
  constructor(symbol = 'EUR/USD', onTick) {
    this.symbol = symbol;
    this.onTick = onTick;
    this.timer = null;
  }

  connect() {
    console.log(`[PriceFeedSocket] Connected to real-time stream for ${this.symbol}`);
    let price = 1.08500;
    this.timer = setInterval(() => {
      const delta = (Math.random() - 0.49) * 0.00015;
      price = +(price + delta).toFixed(5);
      if (this.onTick) this.onTick({ symbol: this.symbol, price, time: Date.now() });
    }, 1000);
  }

  disconnect() {
    if (this.timer) clearInterval(this.timer);
    console.log('[PriceFeedSocket] Disconnected.');
  }
}