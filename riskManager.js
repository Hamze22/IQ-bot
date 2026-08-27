// Risk Management Module
export function checkRiskLimits(accountStats = {}, settings = {}) {
  const { profitToday = 0, consecutiveLosses = 0, tradesTodayCount = 0 } = accountStats;
  const { maxDailyLoss = 100, maxDailyProfit = 300, maxConsecutiveLosses = 3, maxTradesPerDay = 50 } = settings;

  if (profitToday <= -Math.abs(maxDailyLoss)) {
    return {
      allowed: false,
      reason: `Daily Stop Loss hit (-$${Math.abs(profitToday)} / -$${maxDailyLoss})`
    };
  }

  if (profitToday >= maxDailyProfit) {
    return {
      allowed: false,
      reason: `Daily Take Profit target reached (+$ ${profitToday} / +$${maxDailyProfit})`
    };
  }

  if (consecutiveLosses >= maxConsecutiveLosses) {
    return {
      allowed: false,
      reason: `Maximum consecutive loss safeguard triggered (${consecutiveLosses}/${maxConsecutiveLosses})`
    };
  }

  if (tradesTodayCount >= maxTradesPerDay) {
    return {
      allowed: false,
      reason: `Maximum daily trades reached (${tradesTodayCount}/${maxTradesPerDay})`
    };
  }

  return { allowed: true };
}