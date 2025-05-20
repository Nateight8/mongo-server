// trade.utils.ts

/**
 * Calculate pip size for a given instrument
 */
export const getPipSize = (instrument: string): number => {
  // JPY pairs have pip size of 0.01, others have 0.0001
  return instrument.toLowerCase().includes("jpy") ? 0.01 : 0.0001;
};

/**
 * Calculate risk in pips
 */
export const calculateRiskInPips = (trade: {
  plannedEntryPrice: number;
  plannedStopLoss: number;
  side: string;
}): number => {
  const { plannedEntryPrice, plannedStopLoss, side } = trade;
  return side.toLowerCase() === "buy"
    ? Math.abs(plannedEntryPrice - plannedStopLoss)
    : Math.abs(plannedStopLoss - plannedEntryPrice);
};

/**
 * Calculate risk in account currency
 */
export const calculateRiskAmount = (trade: {
  instrument: string;
  size: number;
  plannedEntryPrice: number;
  plannedStopLoss: number;
  side: string;
}): number => {
  const { instrument, size } = trade;
  const pipSize = getPipSize(instrument);
  const riskInPips = calculateRiskInPips(trade) / pipSize;

  // Standard lot size is 100,000 units
  const standardLotSize = 100000;
  const positionSizeInUnits = size * standardLotSize;

  // Calculate pip value
  const pipValue = positionSizeInUnits * pipSize;

  // Total risk amount
  return riskInPips * pipValue;
};

/**
 * Calculate projected R:R ratio
 */
export const calculateProjectedRR = (trade: {
  plannedEntryPrice: number;
  plannedStopLoss: number;
  plannedTakeProfit: number;
  side: string;
}): number => {
  const { plannedEntryPrice, plannedStopLoss, plannedTakeProfit, side } = trade;

  // Calculate risk and reward in pips
  const risk =
    side.toLowerCase() === "buy"
      ? plannedEntryPrice - plannedStopLoss
      : plannedStopLoss - plannedEntryPrice;

  const reward =
    side.toLowerCase() === "buy"
      ? plannedTakeProfit - plannedEntryPrice
      : plannedEntryPrice - plannedTakeProfit;

  // Return R:R ratio
  return Math.abs(reward / risk);
};

/**
 * Calculate actual R:R ratio
 */
export const calculateActualRR = (trade: {
  plannedEntryPrice: number;
  plannedStopLoss: number;
  executedEntryPrice?: number;
  executedExitPrice?: number;
  side: string;
}): number | null => {
  const {
    plannedEntryPrice,
    plannedStopLoss,
    executedEntryPrice,
    executedExitPrice,
    side,
  } = trade;

  // If the trade hasn't been executed or closed yet, return null
  if (!executedEntryPrice || !executedExitPrice) return null;

  // Calculate risk based on planned values (1R)
  const risk =
    side.toLowerCase() === "buy"
      ? plannedEntryPrice - plannedStopLoss
      : plannedStopLoss - plannedEntryPrice;

  // Calculate actual result
  const result =
    side.toLowerCase() === "buy"
      ? executedExitPrice - executedEntryPrice
      : executedEntryPrice - executedExitPrice;

  // Return actual R:R ratio
  return result / Math.abs(risk);
};

/**
 * Generate chart data for visualization
 */
export const generateTradeChartData = (trade: {
  plannedEntryPrice: number;
  plannedStopLoss: number;
  plannedTakeProfit: number;
  executedEntryPrice?: number;
  executedExitPrice?: number;
  side: string;
  instrument: string;
  size: number;
}): any => {
  const {
    plannedEntryPrice,
    plannedStopLoss,
    plannedTakeProfit,
    executedEntryPrice,
    executedExitPrice,
    side,
    instrument,
    size,
  } = trade;

  // If trade hasn't been executed and closed, return null
  if (!executedEntryPrice || !executedExitPrice) return null;

  const riskAmount = calculateRiskAmount(trade);
  const pipSize = getPipSize(instrument);

  // Function to convert price to PnL
  const priceToPnL = (currentPrice: number, entryPrice: number): number => {
    const pipDiff = Math.abs(currentPrice - entryPrice) / pipSize;
    const standardLotSize = 100000;
    const pipValue = size * standardLotSize * pipSize;

    return side.toLowerCase() === "buy"
      ? (currentPrice > entryPrice ? 1 : -1) * pipDiff * pipValue
      : (currentPrice < entryPrice ? 1 : -1) * pipDiff * pipValue;
  };

  // Calculate projected profit/loss
  const projectedPnL = priceToPnL(plannedTakeProfit, plannedEntryPrice);

  // Calculate actual profit/loss
  const actualPnL = priceToPnL(executedExitPrice, executedEntryPrice);

  // Chart data for visualization
  const chartData = [
    // Entry point - both actual and projected start here
    {
      label: "Entry",
      plannedPrice: plannedEntryPrice,
      actualPrice: executedEntryPrice,
      plannedPnL: 0,
      actualPnL: 0,
      plannedR: 0,
      actualR: 0,
    },
    // Stop Loss - only for projected path
    {
      label: "Stop Loss",
      plannedPrice: plannedStopLoss,
      actualPrice: null,
      plannedPnL: -riskAmount,
      actualPnL: null,
      plannedR: -1,
      actualR: null,
    },
    // Take Profit - only for projected path
    {
      label: "Take Profit",
      plannedPrice: plannedTakeProfit,
      actualPrice: null,
      plannedPnL: projectedPnL,
      actualPnL: null,
      plannedR: projectedPnL / riskAmount,
      actualR: null,
    },
    // Exit point - only for actual path
    {
      label: "Exit",
      plannedPrice: null,
      actualPrice: executedExitPrice,
      plannedPnL: null,
      actualPnL: actualPnL,
      plannedR: null,
      actualR: actualPnL / riskAmount,
    },
  ];

  return {
    chartData,
    summary: {
      riskAmount: riskAmount.toFixed(2),
      projectedPnL: projectedPnL.toFixed(2),
      actualPnL: actualPnL.toFixed(2),
      projectedRR: (projectedPnL / riskAmount).toFixed(2),
      actualRR: (actualPnL / riskAmount).toFixed(2),
      difference: (projectedPnL - actualPnL).toFixed(2),
    },
  };
};

/**
 * Determine trade outcome (WIN, LOSS, BE)
 */
export const determineTradeOutcome = (trade: {
  executedEntryPrice?: number;
  executedExitPrice?: number;
  side: string;
}): "WIN" | "LOSS" | "BE" | "PENDING" => {
  const { executedEntryPrice, executedExitPrice, side } = trade;

  if (!executedEntryPrice || !executedExitPrice) return "PENDING";

  if (side.toLowerCase() === "buy") {
    if (executedExitPrice > executedEntryPrice) return "WIN";
    if (executedExitPrice < executedEntryPrice) return "LOSS";
    return "BE"; // Breakeven
  } else {
    // sell
    if (executedExitPrice < executedEntryPrice) return "WIN";
    if (executedExitPrice > executedEntryPrice) return "LOSS";
    return "BE"; // Breakeven
  }
};
