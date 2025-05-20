# Flexible Trade Tracking System

## User Stories

### 1. Market Execution Trader

As a trader who enters at market price, I want to plan my entry, stop loss, and take profit in advance, but record my actual entry price when I execute, so I can compare my plan to my real execution and analyze my discipline.

### 2. Limit/Stop Order Trader

As a trader who uses limit or stop orders, I want to specify my intended entry price and execution style, so the system can track whether my order was filled as planned or if I had to adjust my entry.

### 3. Risk-First Trader

As a trader focused on risk management, I want to specify my planned stop loss and take profit, and have the system calculate my risk amount and risk percentage automatically, so I can ensure my trades fit my risk rules without manual calculation.

### 4. Multi-Target/Scale-Out Trader

As a trader who scales out at multiple targets, I want to define several take profit levels and partial exit sizes, so I can track my trade management and see how different exit strategies affect my results.

### 5. Scenario Planner

As a trader who likes to plan for different outcomes, I want the system to generate possible scenarios based on my targets and stops, so I can visualize best/worst/expected cases before I enter a trade.

### 6. Performance Analyst

As a trader who reviews my performance, I want to see analytics comparing my planned entries and exits to my actual results, so I can identify areas for improvement in my execution and planning.

## System Overview

The Flexible Trade Tracking System is designed to accommodate diverse trading styles and strategies through a two-phase model:

1. **Trade Entry Phase**: Captures the initial trade setup and plan
2. **Trade Outcome Phase**: Records how the trade actually played out

The system incorporates dynamic scenario modeling to project possible outcomes based on the trader's strategy, enabling accurate performance analytics regardless of trading approach.

## Core Components

### 1. Trade Entry

#### Data Structure

```typescript
interface TradeEntry {
  // Basic trade identification
  id: string; // Generated UUID
  userId: string; // User who created the trade
  accountId: string; // Trading account
  symbol: string; // Trading instrument

  // Entry details
  side: "buy" | "sell"; // Direction of the trade
  executionStyle: "market" | "limit" | "stop"; // How the trade is intended to be executed
  initialEntry: number; // Planned entry price (user's plan)
  entryPrice?: number; // Actual entry price (set when trade is executed)
  size: number; // Initial position size

  // Risk management
  initialStopLoss: number; // Planned stop loss price (required)
  initialTakeProfit: number; // Planned take profit price (required)
  // initialRiskAmount is calculated from initialEntry and initialStopLoss
  initialRiskAmount?: number; // Calculated, not required in input
  initialRiskPercentage?: number; // Calculated, not required in input
  // rPerPip is also calculated
  rPerPip?: number;

  // Target management
  targets: [
    // Array of planned targets
    {
      id: string; // Target identifier
      label: string; // User-defined label (e.g., "Minimum Target")
      price: number; // Target price
      riskReward: number; // Risk:Reward ratio at this target
      exitSize: number; // Size to exit at this target (0-100%)
      moveStopTo?: number; // Optional price to move stop to when target hit
    }
  ];

  // Strategy context
  setupType?: string; // Category of trade setup
  timeframe?: string; // Analysis timeframe
  notes?: string; // Trade rationale/plan
  tags?: string[]; // Custom categorization

  // State tracking
  status: "planned" | "active" | "partially_closed" | "closed" | "canceled";
  remainingSize: number; // Size still open (starts equal to size)
  currentStopLoss: number; // Current stop loss (may change during trade)
}
```

#### Rationale for Input Changes

- **entryTimestamp**: Not required at trade creation; can be set when the trade is actually executed.
- **initialRiskAmount, initialRiskPercentage, rPerPip**: These are calculated fields based on initialEntry, initialStopLoss, and size. They should not be required in the input.
- **initialStopLoss**: Required in the input and must be present in both the schema and database.
- **initialTakeProfit**: Required in the input and must be present in both the schema and database.
- **initialEntry**: Required to capture the user's planned entry price, which may differ from the actual entryPrice if the execution style is market.
- **executionStyle**: Required to specify how the user intends to enter the trade (market, limit, stop, etc.).

This approach allows for:

- More accurate tracking of the user's plan versus actual execution
- Flexibility for different trading styles (market, limit, stop orders)
- Automatic calculation of risk metrics

### 2. Trade Outcome Tracking

#### Data Structure

```typescript
interface TradeOutcome {
  id: string; // Generated UUID
  tradeId: string; // Reference to parent trade

  // Exit details
  outcomeType: "target_hit" | "stop_hit" | "manual_exit" | "timeout";
  exitPrice: number; // Actual exit price
  exitSize: number; // Size exited at this price
  exitTimestamp: Date; // When this exit occurred

  // Performance metrics
  pnl: number; // Profit/Loss for this exit
  rr: number; // R:R ratio achieved for this exit

  // Context
  targetId: string; // Optional reference to which target was hit
  notes: string; // Exit rationale/observations
}
```

### 3. Dynamic Scenario Modeling

#### Data Structure

```typescript
interface TradeScenario {
  id: string; // Generated UUID
  tradeId: string; // Reference to parent trade

  // Scenario metadata
  name: string; // Scenario name (e.g., "Maximum Target Hit")
  description: string; // Detailed description of this scenario
  //   probability: number; // Optional user-assigned probability

  // Scenario sequence
  exitSequence: [
    // Series of exits that define this scenario
    {
      targetId: string; // Reference to which target
      price: number; // Exit price
      size: number; // Size exited
      remainingSize: number; // Size remaining after this exit
      newStopLoss: number; // Updated stop loss after this exit
    }
  ];

  // Projected outcome
  finalOutcome: {
    pnl: number; // Total profit/loss across all exits
    rr: number; // Overall R:R ratio achieved
    accountBalance: number; // Projected account balance after scenario
  };
}
```

## System Workflow

### Phase 1: Trade Entry

1. **User creates trade entry**

   - Specifies entry details, initial stop, and targets
   - Defines risk management strategy (partial exits, stop adjustments)

2. **System generates scenarios**

   - Creates possible outcome scenarios based on targets and stop rules
   - Calculates projected outcomes for each scenario
   - Stores scenarios with the trade

3. **Trade becomes active**
   - System updates status to "active" when entry confirmed
   - Begins tracking price movements against planned targets/stops

### Phase 2: Trade Outcome Tracking

1. **User logs exits as they occur**

   - Records each partial or full exit with actual prices
   - System updates remaining position size

2. **System processes each exit**

   - Calculates PnL and R:R for each exit
   - Updates trade status based on remaining size
   - Adjusts stop loss if specified in the exit strategy

3. **Trade completion**
   - Trade status changes to "closed" when remaining size reaches zero
   - Final performance metrics calculated and stored

## Database Schema

### `trades` Table

```sql
CREATE TABLE trades (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  account_id UUID NOT NULL REFERENCES accounts(id),
  symbol VARCHAR(20) NOT NULL,
  side VARCHAR(10) NOT NULL,
  entry_price DECIMAL(20,8) NOT NULL,
  entry_timestamp TIMESTAMP NOT NULL,
  size DECIMAL(20,8) NOT NULL,
  initial_stop_loss DECIMAL(20,8) NOT NULL,
  initial_risk_amount DECIMAL(20,8) NOT NULL,
  initial_risk_percentage DECIMAL(10,4) NOT NULL,
  r_per_pip DECIMAL(20,8) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'planned',
  remaining_size DECIMAL(20,8) NOT NULL,
  current_stop_loss DECIMAL(20,8) NOT NULL,
  setup_type VARCHAR(50),
  timeframe VARCHAR(10),
  notes TEXT,
  tags JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### `trade_targets` Table

```sql
CREATE TABLE trade_targets (
  id UUID PRIMARY KEY,
  trade_id UUID NOT NULL REFERENCES trades(id),
  label VARCHAR(50) NOT NULL,
  price DECIMAL(20,8) NOT NULL,
  rr DECIMAL(10,4) NOT NULL,
  exit_size DECIMAL(20,8) NOT NULL,
  move_stop_to DECIMAL(20,8),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### `trade_outcomes` Table

```sql
CREATE TABLE trade_outcomes (
  id UUID PRIMARY KEY,
  trade_id UUID NOT NULL REFERENCES trades(id),
  outcome_type VARCHAR(20) NOT NULL,
  exit_price DECIMAL(20,8) NOT NULL,
  exit_size DECIMAL(20,8) NOT NULL,
  exit_timestamp TIMESTAMP NOT NULL,
  pnl DECIMAL(20,8) NOT NULL,
  rr DECIMAL(10,4) NOT NULL,
  target_id UUID REFERENCES trade_targets(id),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### `trade_scenarios` Table

```sql
CREATE TABLE trade_scenarios (
  id UUID PRIMARY KEY,
  trade_id UUID NOT NULL REFERENCES trades(id),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  probability DECIMAL(5,2),
  exit_sequence JSONB NOT NULL,
  final_pnl DECIMAL(20,8) NOT NULL,
  final_rr DECIMAL(10,4) NOT NULL,
  final_account_balance DECIMAL(20,8) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## GraphQL API Definition

### Types

```graphql
type Trade {
  id: ID!
  userId: ID!
  accountId: ID!
  symbol: String!
  side: String!
  entryPrice: Float!
  entryTimestamp: String!
  size: Float!
  initialStopLoss: Float!
  initialRisk: RiskMetrics!
  status: String!
  remainingSize: Float!
  currentStopLoss: Float!
  setupType: String
  timeframe: String
  notes: String
  tags: [String!]
  targets: [TradeTarget!]!
  outcomes: [TradeOutcome!]!
  scenarios: [TradeScenario!]!
  createdAt: String!
  updatedAt: String!
}

type RiskMetrics {
  amount: Float!
  percentage: Float!
  rPerPip: Float!
}

type TradeTarget {
  id: ID!
  tradeId: ID!
  label: String!
  price: Float!
  rr: Float!
  exitSize: Float!
  moveStopTo: Float
}

type TradeOutcome {
  id: ID!
  tradeId: ID!
  outcomeType: String!
  exitPrice: Float!
  exitSize: Float!
  exitTimestamp: String!
  pnl: Float!
  rr: Float!
  targetId: ID
  notes: String
}

type ExitStep {
  targetId: ID
  price: Float!
  size: Float!
  remainingSize: Float!
  newStopLoss: Float
}

type ScenarioOutcome {
  pnl: Float!
  rr: Float!
  accountBalance: Float!
}

type TradeScenario {
  id: ID!
  tradeId: ID!
  name: String!
  description: String!
  probability: Float
  exitSequence: [ExitStep!]!
  finalOutcome: ScenarioOutcome!
}
```

### Mutations

```graphql
# Create a new trade
mutation CreateTrade($input: TradeInput!) {
  createTrade(input: $input) {
    id
    symbol
    entryPrice
    # Additional fields...
    targets {
      id
      label
      price
      rr
    }
    scenarios {
      id
      name
      description
      finalOutcome {
        pnl
        rr
      }
    }
  }
}

# Record a trade outcome (partial or complete exit)
mutation RecordTradeOutcome($input: TradeOutcomeInput!) {
  recordTradeOutcome(input: $input) {
    id
    outcomeType
    exitPrice
    pnl
    rr
    trade {
      id
      status
      remainingSize
      currentStopLoss
    }
  }
}

# Add a new target to an existing trade
mutation AddTradeTarget($tradeId: ID!, $input: TradeTargetInput!) {
  addTradeTarget(tradeId: $tradeId, input: $input) {
    id
    label
    price
    rr
  }
}

# Move stop loss on an active trade
mutation UpdateTradeStopLoss($tradeId: ID!, $newStopLoss: Float!) {
  updateTradeStopLoss(tradeId: $tradeId, newStopLoss: $newStopLoss) {
    id
    currentStopLoss
    scenarios {
      id
      finalOutcome {
        pnl
        rr
      }
    }
  }
}
```

### Queries

```graphql
# Get trade by ID with all related data
query GetTrade($id: ID!) {
  trade(id: $id) {
    id
    symbol
    side
    entryPrice
    size
    status
    initialRisk {
      amount
      percentage
    }
    targets {
      id
      label
      price
      rr
    }
    outcomes {
      id
      outcomeType
      exitPrice
      exitSize
      pnl
      rr
    }
    scenarios {
      id
      name
      description
      finalOutcome {
        pnl
        rr
        accountBalance
      }
    }
  }
}

# Get all trades for a user with filtering options
query GetUserTrades($userId: ID!, $filter: TradeFilterInput) {
  userTrades(userId: $userId, filter: $filter) {
    id
    symbol
    status
    entryPrice
    currentStopLoss
    # Additional fields...
  }
}

# Get trade analytics for an account
query GetAccountAnalytics($accountId: ID!, $timeframe: String!) {
  accountAnalytics(accountId: $accountId, timeframe: $timeframe) {
    winRate
    averageRR
    profitFactor
    totalTrades
    profitableTrades
    losingTrades
    largestWin
    largestLoss
    averageWin
    averageLoss
    equityCurve {
      timestamp
      balance
    }
  }
}
```

## Example Workflow for Different Trading Styles

### Example 1: Set-and-Forget Strategy

**Trade Entry:**

```json
{
  "symbol": "EURUSD",
  "side": "buy",
  "entryPrice": 1.085,
  "entryTimestamp": "2024-05-06T10:30:00Z",
  "size": 1.0,
  "initialStopLoss": 1.08,
  "targets": [
    {
      "label": "Target",
      "price": 1.095,
      "rr": 2.0,
      "exitSize": 1.0,
      "moveStopTo": null
    }
  ]
}
```

**Generated Scenarios:**

1. Stop Loss Hit:
   - Single exit at 1.0800
   - Final RR: -1.0
2. Target Hit:
   - Single exit at 1.0950
   - Final RR: 2.0

### Example 2: Your 1:3 → 1:5 Strategy with Breakeven

**Trade Entry:**

```json
{
  "symbol": "EURUSD",
  "side": "buy",
  "entryPrice": 1.08,
  "entryTimestamp": "2024-05-06T10:30:00Z",
  "size": 1.0,
  "initialStopLoss": 1.075,
  "targets": [
    {
      "label": "Minimum Target (1:3)",
      "price": 1.095,
      "rr": 3.0,
      "exitSize": 0.5,
      "moveStopTo": 1.08
    },
    {
      "label": "Maximum Target (1:5)",
      "price": 1.105,
      "rr": 5.0,
      "exitSize": 0.5,
      "moveStopTo": null
    }
  ]
}
```

**Generated Scenarios:**

1. Stop Loss Hit:
   - Single exit at 1.0750
   - Final RR: -1.0
2. Minimum Target + Breakeven:
   - First exit: 0.5 lots at 1.0950
   - Second exit: 0.5 lots at 1.0800 (breakeven)
   - Final RR: 1.5
3. Minimum Target + Maximum Target:
   - First exit: 0.5 lots at 1.0950
   - Second exit: 0.5 lots at 1.1050
   - Final RR: 4.0

### Example 3: Scale-in/Scale-out Trader

**Trade Entry:**

```json
{
  "symbol": "EURUSD",
  "side": "buy",
  "entryPrice": 1.08,
  "entryTimestamp": "2024-05-06T10:30:00Z",
  "size": 0.5, // Initial position
  "initialStopLoss": 1.075,
  "targets": [
    {
      "label": "First Target",
      "price": 1.085,
      "rr": 1.0,
      "exitSize": 0.2,
      "moveStopTo": 1.0775
    },
    {
      "label": "Second Target",
      "price": 1.09,
      "rr": 2.0,
      "exitSize": 0.2,
      "moveStopTo": 1.08
    },
    {
      "label": "Final Target",
      "price": 1.095,
      "rr": 3.0,
      "exitSize": 0.1,
      "moveStopTo": null
    }
  ]
}
```

**Trade Update (Scale-in):**

```json
{
  "tradeId": "existing-trade-id",
  "additionalSize": 0.5,
  "entryPrice": 1.0825,
  "entryTimestamp": "2024-05-06T11:15:00Z"
}
```

**Generated Scenarios:**
Multiple scenarios based on various combinations of targets hit and stop losses triggered at different stages.

## System Implementation Considerations

1. **Real-time Calculations**

   - Scenario outcomes should be recalculated when:
     - Trade parameters change
     - Partial exits occur
     - Stop losses are moved

2. **Visualization Components**

   - Trade chart with entry, targets, and stop levels
   - Scenario comparison chart
   - Equity curve with scenario projections

3. **Analytics Capabilities**

   - Performance metrics by strategy type
   - Win rate and R:R analysis
   - Risk management effectiveness

4. **Integration with Market Data**

   - Ability to track active trades against current prices
   - Automated detection of targets/stops being hit
   - Price alerts based on proximity to targets/stops

5. **User Experience**
   - Simple mobile-friendly interface for logging outcomes
   - Quick trade templates for common strategies
   - Clear visualization of trade progress against plan

## Next Steps

1. Implement the core database schema
2. Create GraphQL API for trade entry and outcome tracking
3. Develop scenario generation logic
4. Build trade visualization components
5. Implement performance analytics
6. Add user interface for trade management

# Flexible Trade Tracking System

## User Stories

### 1. Market Execution Trader

As a trader who enters at market price, I want to plan my entry, stop loss, and take profit in advance, but record my actual entry price when I execute, so I can compare my plan to my real execution and analyze my discipline.

### 2. Limit/Stop Order Trader

As a trader who uses limit or stop orders, I want to specify my intended entry price and execution style, so the system can track whether my order was filled as planned or if I had to adjust my entry.

### 3. Risk-First Trader

As a trader focused on risk management, I want to specify my planned stop loss and take profit, and have the system calculate my risk amount and risk percentage automatically, so I can ensure my trades fit my risk rules without manual calculation.

### 4. Multi-Target/Scale-Out Trader

As a trader who scales out at multiple targets, I want to define several take profit levels and partial exit sizes, so I can track my trade management and see how different exit strategies affect my results.

### 5. Scenario Planner

As a trader who likes to plan for different outcomes, I want the system to generate possible scenarios based on my targets and stops, so I can visualize best/worst/expected cases before I enter a trade.

### 6. Performance Analyst

As a trader who reviews my performance, I want to see analytics comparing my planned entries and exits to my actual results, so I can identify areas for improvement in my execution and planning.

## System Overview

// ... existing code ...

<!-- const traderData: {
    currentCapital: number;
    roi: number;
    overview: {
        currentBalance: number;
        roi: number;
        name: string;
        chartData: {
            id: string;
            month: string;
            actual: number;
            projected: number;
        }[];
    };
    accounts: {
        id: string;
        ... 5 more ...;
        chartData: {
            ...;
        }[];
    }[];
} -->
