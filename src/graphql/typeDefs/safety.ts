import { gql } from "graphql-tag";

export const safetyNetTypeDefs = gql`
  type SafetyNet {
    id: ID!
    userId: String!
    maxDailyRisk: Int!
    maxDailyDrawdown: Int!
    maxTotalDrawdown: Int!
    riskPerTrade: Int!
    maxOpenTrades: Int!
    isDefault: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input CreateSafetyNetInput {
    maxDailyRisk: Int!
    maxDailyDrawdown: Int!
    maxTotalDrawdown: Int!
    riskPerTrade: Int!
    maxOpenTrades: Int!
    isDefault: Boolean
  }

  type SafetyNetResponse {
    success: Boolean!
    message: String!
  }

  type Mutation {
    createSafetyNet(input: CreateSafetyNetInput!): SafetyNetResponse!
  }
`;

export interface CreateSafetyNetInput {
  maxDailyRisk: number;
  maxDailyDrawdown: number;
  maxTotalDrawdown: number;
  riskPerTrade: number;
  maxOpenTrades: number;
  isDefault?: boolean;
}
