// Performance Analytics Tracker
export function computeDashboardMetrics(trades = []) {
  const total = trades.length;
  if (total === 0) {
    return { winRate: 0, totalProfit: 0, totalWins: 0, totalLosses: 0 };
  }

  const wins = trades.filter(t => t.outcome === 'WIN').length;
  const losses = trades.filter(t => t.outcome === 'LOSS').length;
  const winRate = Math.round((wins / total) * 100);
  const totalProfit = trades.reduce((acc, t) => acc + (t.profit || 0), 0);

  return {
    winRate,
    totalProfit: Number(totalProfit.toFixed(2)),
    totalWins: wins,
    totalLosses: losses
  };
}