import { gql } from "graphql-tag";

export const dashboardTypeDefs = gql`
  type Query {
    dashboard: Dashboard
  }

  type Dashboard {
    portfolioOverview: PortfolioOverview!
    winLossTradeStats: WinLossTradeStats!
    recentTrades: [RecentTrade!]!
    tradingPlan: TradingPlan
    journalTemplate: JournalingNoteTemplate
  }

  type PortfolioOverview {
    totalValue: Float!
    pnl: PnL!
    overviewStats: OverviewStats!
  }

  type PnL {
    value: String!
    percentage: String!
  }

  type OverviewStats {
    winRate: StatField!
    profitFactor: StatField!
    avgReturn: StatField!
    maxDrawdown: StatField!
    tradeStats: TradeStats!
  }

  type StatField {
    value: String!
    percentage: String!
  }

  type TradeStats {
    open: Float!
    total: Float!
  }

  type WinLossTradeStats {
    totalTrades: Int!
    wins: Int!
    losses: Int!
    totalRisk: Float!
    totalReward: Float!
  }

  type RecentTrade {
    id: ID!
    symbol: String!
    date: String!
    account: String!
    direction: Direction!
    status: TradeStatus!
    projectedEntry: Float!
    actualEntry: Float!
    projectedSL: Float!
    actualExit: Float!
    actualPL: Float!
    maxPossiblePL: Float!
    balance: Float!
  }

  enum TradeStatus {
    CLOSED
    RUNNING
  }

  enum Direction {
    Long
    Short
  }
`;
