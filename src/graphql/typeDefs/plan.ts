import { gql } from "graphql-tag";

export const planTypeDefs = gql`
  type TradingPlan {
    id: ID!
    tradingStyle: String!
    tradingSessions: [String!]!
    timeZone: String!
    riskRewardRatio: Int!
    note: String
    createdAt: String!
    updatedAt: String!
  }

  input TradingPlanInput {
    tradingStyle: String!
    tradingSessions: [String!]!
    timeZone: String!
    riskRewardRatio: Int!
    note: String
  }

  type TradingPlanResponse {
    success: Boolean!
    message: String!
  }

  type Mutation {
    createTradingPlan(input: TradingPlanInput!): TradingPlanResponse!
  }
`;

export interface CreateTradingPlanInput {
  tradingStyle: string; // e.g., "swingTrading"
  tradingSessions: string[]; // e.g., ["asian"]
  timeZone: string; // e.g., "America/New_York"
  riskRewardRatio: number; // e.g., 2
  note: string;
  createdAt: Date;
  updatedAt: Date;
}
