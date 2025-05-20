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

/**
 * Calculate the risk amount for a trade
 * @param trade The trade to calculate risk for
 * @returns The risk amount in account currency
 */
export function calculateRiskAmount(trade: Trade): number {
  // Calculate the risk per unit (difference between entry and stop loss)
  const riskPerUnit = Math.abs(trade.plannedEntryPrice - trade.plannedStopLoss);

  // Calculate total risk amount based on position size
  // This gives us the actual monetary risk in the account currency
  return riskPerUnit * trade.size;
}

/**
 * Calculate the projected risk-reward ratio for a trade
 * @param trade The trade to calculate projected RR for
 * @returns The risk-reward ratio (e.g., 2.0 means potential reward is 2x the risk)
 */
export function calculateProjectedRR(trade: Trade): number {
  // Calculate risk and reward in price units
  const risk = Math.abs(trade.plannedEntryPrice - trade.plannedStopLoss);
  const reward = Math.abs(trade.plannedEntryPrice - trade.plannedTakeProfit);

  // Return the ratio (reward divided by risk)
  return risk > 0 ? reward / risk : 0;
}

// Utility: Generate chart data for a set of trades
// Why: In v1, each trade is a data point. We use updatedAt as the x-axis value because it reflects the most recent action (e.g., closing the trade), which is more precise for analytics than createdAt.
export function generateChartData(
  trades: Trade[]
): { id: string; x: string; actual: number; projected: number }[] {
  return trades.map((trade: Trade) => {
    // Calculate risk amount using our utility function
    const risk = calculateRiskAmount(trade);

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
      const plannedRR = calculateProjectedRR(trade);
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

/**
 * Generate cumulative chart data for analyzing overall performance over time
 * @param tradePoints The individual trade points generated from generateChartData
 * @returns An array of data points with cumulative actual and projected values
 */
export function generateCumulativeChartData(
  tradePoints: { id: string; x: string; actual: number; projected: number }[]
): { x: string; cumulative: number; projectedCumulative: number }[] {
  // Sort data points by date (x)
  const sortedPoints = [...tradePoints].sort(
    (a, b) => new Date(a.x).getTime() - new Date(b.x).getTime()
  );

  let cumulativeActual = 0;
  let cumulativeProjected = 0;

  return sortedPoints.map((point) => {
    // Add current point values to running totals
    cumulativeActual += point.actual;
    cumulativeProjected += point.projected;

    return {
      x: point.x,
      cumulative: cumulativeActual,
      projectedCumulative: cumulativeProjected,
    };
  });
}

/**
 * Format chart data for time-based visualization
 * Useful for grouping trades by day, week, or month for analysis
 * @param chartData The chart data to format
 * @param timeFrame The timeframe to group by ('day', 'week', 'month')
 */
export function formatChartDataByTimeFrame(
  chartData: { id: string; x: string; actual: number; projected: number }[],
  timeFrame: "day" | "week" | "month"
): {
  period: string;
  totalActual: number;
  totalProjected: number;
  tradeCount: number;
}[] {
  const groupedData: Record<
    string,
    {
      totalActual: number;
      totalProjected: number;
      tradeCount: number;
    }
  > = {};

  chartData.forEach((point) => {
    const date = new Date(point.x);
    let periodKey: string;

    switch (timeFrame) {
      case "day":
        periodKey = format(date, "yyyy-MM-dd");
        break;
      case "week":
        // Get the start of the week (Monday)
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
        startOfWeek.setDate(diff);
        periodKey = format(startOfWeek, "yyyy-MM-dd");
        break;
      case "month":
        periodKey = format(date, "yyyy-MM");
        break;
    }

    if (!groupedData[periodKey]) {
      groupedData[periodKey] = {
        totalActual: 0,
        totalProjected: 0,
        tradeCount: 0,
      };
    }

    groupedData[periodKey].totalActual += point.actual;
    groupedData[periodKey].totalProjected += point.projected;
    groupedData[periodKey].tradeCount += 1;
  });

  // Convert to array and sort by period
  return Object.entries(groupedData)
    .map(([period, data]) => ({
      period,
      ...data,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}
