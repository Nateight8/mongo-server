# Chart Computation Documentation

## Overview

This document explains how projected and actual values are computed for trade analytics in the trading journal, including the meaning of each, example scenarios, and how the new fields (`exitPrice`, `closed`) are used.

---

## Key Concepts

### 1. **Risk Amount (R)**

- The amount the trader risks per trade (e.g., $100).

### 2. **Projected**

- What the trader could have made if the trade hit the original Take Profit (TP) or lost if it hit the original Stop Loss (SL).
- **If market hits TP:**
  - Projected = `plannedRR * R` (e.g., 5R × $100 = $500)
- **If market hits SL:**
  - Projected = `-R` (e.g., -$100)

### 3. **Actual**

- What the trader actually made, based on their real exit.
- **Actual = actualRR × R** (e.g., 3R × $100 = $300)

### 4. **closed**

- Boolean indicating if the trade is closed.

### 5. **exitPrice**

- The price at which the user confirmed closing the trade.

---

## Example Scenarios

### Scenario 1: Trader exits at 1:3RR, market later hits TP (1:5RR)

- **Risk:** $100
- **Actual:** $300 (trader exited at 1:3RR)
- **Projected:** $500 (market hit TP, 1:5RR was possible)

### Scenario 2: Trader exits at 1:3RR, market later hits SL

- **Risk:** $100
- **Actual:** $300 (trader exited at 1:3RR)
- **Projected:** -$100 (market hit SL, if held to plan it would have lost)

---

## Calculation Formulas

### **Projected R:R (plannedRR)**

- For **buy**:
  - Risk = `plannedEntryPrice - plannedStopLoss`
  - Reward = `plannedTakeProfit - plannedEntryPrice`
- For **sell**:
  - Risk = `plannedStopLoss - plannedEntryPrice`
  - Reward = `plannedEntryPrice - plannedTakeProfit`
- **Projected R:R** = `|Reward / Risk|`

### **Actual R:R (actualRR)**

- For **buy**:
  - Risk = `plannedEntryPrice - plannedStopLoss`
  - Result = `exitPrice - executedEntryPrice`
- For **sell**:
  - Risk = `plannedStopLoss - plannedEntryPrice`
  - Result = `executedEntryPrice - exitPrice`
- **Actual R:R** = `Result / |Risk|`

### **Projected (in $)**

- If market hits TP: `plannedRR * R`
- If market hits SL: `-R`

### **Actual (in $)**

- `actualRR * R`

---

## Example Data Structure

```
{
  tradeId: "abc123",
  instrument: "eurusd",
  date: "2025-03-01",
  plannedRR: 5,    // 1:5RR (planned)
  actualRR: 3,     // 1:3RR (actual exit)
  projected: 500,  // $500 if market hit TP
  actual: 300,     // $300 actual
  closed: true,
  exitPrice: 1.2345
}
```

---

## Summary Table

| Scenario                                | Actual (what trader took) | Projected (if held to plan)         |
| --------------------------------------- | ------------------------- | ----------------------------------- |
| Exited at 1:3RR, market hit TP          | $300                      | $500                                |
| Exited at 1:3RR, market hit SL          | $300                      | -$100                               |
| Exited at 1:3RR, market never hit TP/SL | $300                      | (could be left blank or last price) |

---

## Implementation Notes

- `actual` is always what the trader took.
- `projected` is what would have happened if the trade was held to the original plan (TP or SL).
- You may need to check historical price data to determine if TP or SL was hit after exit.
- The `closed` boolean and `exitPrice` field are used to track when and where the trade was closed by the user.

---

**This documentation should be updated as the analytics and charting logic evolves.**
