# Analytics Dashboard Filters

This document outlines the available filters for querying trade analytics data.

## Available Filters

### 1. Category Filter
Filter trades by asset category.
- **Type**: Enum
- **Values**:
  - `forex` - Foreign exchange currency pairs
  - `stock` - Stock market instruments
  - `crypto` - Cryptocurrency pairs
  - `commodity` - Commodity instruments
  - `all` - Include all categories (default)

### 2. Symbol Filter
Filter trades by specific trading instrument symbols.
- **Type**: String | String[]
- **Examples**: 
  - `"EURUSD"` - Single symbol
  - `["EURUSD", "GBPUSD"]` - Multiple symbols
  - `"*"` - All symbols (default)

### 3. Date Range Filter
Filter trades within a specific date range.
- **Type**: Object
- **Properties**:
  - `from`: ISO 8601 date string (e.g., "2024-01-01T00:00:00Z")
  - `to`: ISO 8601 date string (e.g., "2024-12-31T23:59:59Z")
- **Example**:
  ```json
  {
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-05-23T23:59:59Z"
  }
  ```

### 4. P&L Range Filter
Filter trades based on profit/loss range.
- **Type**: Object
- **Properties**:
  - `minPL`: Minimum profit/loss value (inclusive)
  - `maxPL`: Maximum profit/loss value (inclusive)
- **Example**:
  ```json
  {
    "minPL": -100,
    "maxPL": 1000
  }
  ```
  This would include trades with P&L between -100 and 1000 (inclusive).

## Combination Example

All filters can be combined for more specific queries. For example, to find all forex trades for EURUSD with a profit between 50 and 500 in Q1 2024:

```json
{
  "category": "forex",
  "symbol": "EURUSD",
  "dateRange": {
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-03-31T23:59:59Z"
  },
  "plRange": {
    "minPL": 50,
    "maxPL": 500
  }
}
```

## Default Behavior
- If no filters are provided, the system will return all available trades
- All filters are combined with AND logic
- String matching is case-insensitive
- Date range is inclusive of both start and end dates
