# Trade Log System

## Purpose

The trade log system records every trade made by users, enabling:

- Detailed trade history and journaling
- Analytics and performance tracking
- Charting account and portfolio progress over time

<!-- {
  "accountId": "abc123",
  "plannedEntryPrice": 1.2345,
  "plannedStopLoss": 1.2000,
  "plannedTakeProfit": 1.3000,
  "size": 1000,
  "setupType": "Breakout",
  "timeframe": "H1",
  "notes": "My plan for this trade",
  "tags": ["trend", "breakout"],
  "targets": [
    {
      "label": "TP1",
      "executedPrice": 1.2500,
      "riskReward": 2,
      "exitSize": 500,
      "moveStopTo": 1.2200
    }
  ],
  "executionStyle": "BUY_LIMIT"
} -->
<!-- {
  "accountId": "abc123",
  "plannedEntryPrice": 1.2345, not nullible
  "plannedStopLoss": 1.2000, not nullible
  "plannedTakeProfit": 1.3000, not nullible
  "size": 1000, not nullible
  "setupType": "Breakout",
  "timeframe": "H1",
  "notes": "My plan for this trade",
  "tags": ["trend", "breakout"],
  "targets": [
    {
      "label": "TP1",
      "executedPrice": 1.2500,
      "riskReward": 2,
      "exitSize": 500,
      "moveStopTo": 1.2200
    }
  ],
  "executionStyle": "BUY_LIMIT"
} -->

<!-- {
  "accountId": "abc123",
  "plannedEntryPrice": 1.2345, not nullible
  "plannedStopLoss": 1.2000, not nullible
  "plannedTakeProfit": 1.3000, not nullible
  "size": 1000, not nullible
  "setupType": "Breakout",
  "timeframe": "H1",
  "notes": "My plan for this trade",
  "tags": ["trend", "breakout"],
  "executionStyle": "BUY_LIMIT"
} -->

## Database Table Design

A typical `trades` table includes:

| Column            | Type     | Description                      |
| ----------------- | -------- | -------------------------------- |
| id                | PK/UUID  | Unique trade identifier          |
| userId            | FK/Text  | User who made the trade          |
| accountId         | FK/Text  | Trading account for the trade    |
| timestamp         | DateTime | When the trade was executed      |
| symbol            | String   | Instrument traded (e.g., EURUSD) |
| side              | String   | 'buy' or 'sell'                  |
| size              | Float    | Position size                    |
| entryPrice        | Float    | Entry price                      |
| exitPrice         | Float    | Exit price                       |
| pnl               | Float    | Profit or loss for the trade     |
| balanceAfterTrade | Float    | Account balance after this trade |
| notes             | String   | (Optional) Trade notes           |

## GraphQL API

### Types

```graphql
type Trade {
  id: ID!
  userId: ID!
  accountId: ID!
  timestamp: String!
  symbol: String!
  side: String!
  size: Float!
  entryPrice: Float!
  exitPrice: Float!
  pnl: Float!
  balanceAfterTrade: Float
  notes: String
}
```

### Example Queries/Mutations

```graphql
# Log a new trade
mutation {
  createTrade(
    accountId: "acct123"
    timestamp: "2024-06-01T10:00:00Z"
    symbol: "EURUSD"
    side: "buy"
    size: 1.0
    entryPrice: 1.0850
    exitPrice: 1.0900
    pnl: 500
    balanceAfterTrade: 10500
    notes: "Breakout trade"
  ) {
    success
    message
    trade {
      id
    }
  }
}

# Get all trades for an account
query {
  getTradesByAccount(accountId: "acct123") {
    id
    timestamp
    symbol
    side
    size
    entryPrice
    exitPrice
    pnl
    balanceAfterTrade
    notes
  }
}
```

## Integration Notes

- Use trade logs to generate chart data (e.g., running balance over time).
- All analytics and performance metrics should be derived from trade logs for accuracy.
- Consider indexing `accountId` and `timestamp` for fast queries.

## Next Steps

- Implement the Drizzle schema for the `trades` table.
- Add GraphQL typeDefs and resolvers for trade CRUD operations.
- Integrate trade logging and analytics into the frontend.
