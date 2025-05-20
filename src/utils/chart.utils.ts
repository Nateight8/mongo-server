import { format } from "date-fns";

/**
 * Trade interface for type safety and clarity in chart calculations.
 * This matches the DB schema and ensures all chart utilities work with the correct fields.
 * Using an explicit interface helps prevent bugs, improves autocompletion, and makes the codebase easier to maintain.
 */
export interface Trade {
  id: string;
  userId: string;
  accountId: string;
  plannedEntryPrice: number;
  plannedStopLoss: number;
  plannedTakeProfit: number;
  executedEntryPrice?: number;
  executedStopLoss?: number;
  executionNotes?: string;
  exitPrice?: number;
  closed?: string; // 'true' or 'false' as stored in DB
  size: number;
  setupType?: string;
  timeframe?: string;
  notes?: string;
  tags?: string[];
  executionStyle: string;
  status: string;
  x: string;
  updatedAt: string;
  instrument: string;
  side: string;
  projectedOutcome?: string; // e.g., 'TP' or 'SL' for chart logic
  // Add more fields as needed for analytics
}

// Utility: Generate chart data for a set of trades
// Why: In v1, each trade is a data point. We use updatedAt as the x-axis value because it reflects the most recent action (e.g., closing the trade), which is more precise for analytics than createdAt.
export function generateChartData(
  trades: Trade[]
): { id: string; x: string; actual: number; projected: number }[] {
  return trades.map((trade: Trade) => {
    // NOTE: The following logic assumes you have utility functions for risk and RR calculations
    // and that projectedOutcome is set for closed trades.
    const risk = (trade as any).calculateRiskAmount
      ? (trade as any).calculateRiskAmount(trade)
      : 0; // fallback if not available
    // Actual: what the trader took (if closed)
    let actual = 0;
    if (
      trade.closed === "true" &&
      trade.exitPrice &&
      trade.executedEntryPrice
    ) {
      const result =
        trade.side.toLowerCase() === "buy"
          ? trade.exitPrice - trade.executedEntryPrice
          : trade.executedEntryPrice - trade.exitPrice;
      actual =
        (result / Math.abs(trade.plannedEntryPrice - trade.plannedStopLoss)) *
        risk;
    }
    // Projected: what would have happened if held to TP or SL
    let projected = 0;
    if (trade.closed === "true" && trade.projectedOutcome === "TP") {
      const plannedRR = (trade as any).calculateProjectedRR
        ? (trade as any).calculateProjectedRR(trade)
        : 0;
      projected = plannedRR * risk;
    } else if (trade.closed === "true" && trade.projectedOutcome === "SL") {
      projected = -risk;
    }
    return {
      id: trade.id, // Unique identifier for each trade
      x: trade.updatedAt, // Use updatedAt for x-axis (more precise than createdAt)
      actual,
      projected,
    };
  });
}
