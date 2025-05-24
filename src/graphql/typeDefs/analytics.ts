import { gql } from "graphql-tag";

export const analyticsTypeDefs = gql`
  type TradePerformance {
    time: String! # e.g. date string or timestamp
    pnl: Float! # profit/loss value at that time
  }

  type SymbolAnalytics {
    symbol: String!
    category: String!
    performance: [TradePerformance!]!
  }
  type EquityPoint {
    time: String!
    equity: Float!
  }

  type TradersAnalytics {
    symbolAnalytics(category: String = "all"): [SymbolAnalytics!]!
    equityCurve: [EquityPoint!]!
    # You can add more analytics fields here in the future, e.g.:
    # volumeAnalytics: [VolumeAnalytics!]!
    # riskAnalytics: [RiskAnalytics!]!
  }

  type Query {
    tradersAnalytics: TradersAnalytics!
  }
`;
