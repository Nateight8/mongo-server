export interface LogTradeInput {
  accountId: string;
  instrument: string;
  side: string;
  plannedEntryPrice: number;
  plannedStopLoss: number;
  plannedTakeProfit: number;
  size: number;
  setupType?: string;
  timeframe?: string;
  notes?: string;
  tags?: string[];
  executionStyle?: string;
}

export interface LogTradeResponse {
  success: boolean;
  message?: string;
}

export interface TradePerformance {
  time: string;
  pnl: number;
}

export interface TradeAnalytics {
  symbol: string;
  category: string;
  performance: TradePerformance[];
}

export interface EquityPoint {
  time: string;
  equity: number;
}
