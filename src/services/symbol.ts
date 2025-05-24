// src/services/analytics/getSymbolAnalytics.ts

interface TradePerformance {
  time: string;
  pnl: number;
}

interface TradeEntry {
  symbol: string;
  category: string;
  performance: TradePerformance[];
}

export function getSymbolAnalytics(
  trades: TradeEntry[],
  category: string = "all"
) {
  // Filter by category unless 'all'
  const filteredTrades =
    category.toLowerCase() === "all"
      ? trades
      : trades.filter(
          (t) => t.category.toLowerCase() === category.toLowerCase()
        );

  // Return the filtered and mapped data as SymbolAnalytics[]
  return filteredTrades.map((trade) => ({
    symbol: trade.symbol,
    category: trade.category,
    performance: trade.performance.map(({ time, pnl }) => ({ time, pnl })),
  }));
}
