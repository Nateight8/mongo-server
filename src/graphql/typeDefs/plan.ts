// === GraphQL Type Definitions ===
import { gql } from "graphql-tag";

export const planTypeDefs = gql`
  scalar DateTime
  scalar JSON

  enum PlanVisibility {
    PUBLIC
    PRIVATE
  }

  enum NoteFormat {
    MARKDOWN
    HTML
    JSON
  }

  type NoteContent {
    raw: String!
    html: String!
    format: NoteFormat!
  }

  type TradingPlan {
    id: ID!
    userId: ID!
    tradingStyle: String!
    tradingSessions: [String!]!
    timeZone: String!
    riskRewardRatio: Int!
    isOwner: Boolean!
    note: NoteContent
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input TradingPlanInput {
    tradingStyle: String!
    tradingSessions: [String!]!
    timeZone: String!
    riskRewardRatio: Int!
    note: String
    renderAs: NoteFormat = HTML
  }

  type SharedTradingPlan {
    id: ID!
    originalPlanId: ID!
    sharedByUserId: ID!
    visibility: PlanVisibility!
    viewed: Boolean!
    expiresAt: DateTime!
    createdAt: DateTime!
    plan: TradingPlan
  }

  type SharedTradingPlanResponse {
    success: Boolean!
    message: String!
    sharedPlan: SharedTradingPlan
  }

  type TradingPlanResponse {
    success: Boolean!
    message: String!
  }

  type Query {
    getTradingPlan: TradingPlanResponse!
    getSharedTradingPlan(id: ID!): SharedTradingPlanResponse!
  }

  type Mutation {
    createTradingPlan(input: TradingPlanInput!): TradingPlanResponse!
    updateTradingPlan(input: TradingPlanInput!): TradingPlanResponse!
    shareTradingPlan(visibility: PlanVisibility!): SharedTradingPlanResponse!
    updateTradingPlanNote(note: JSON!): TradingPlanResponse!
  }
`;

// === TypeScript Interfaces ===
export type NoteFormat = "MARKDOWN" | "HTML" | "JSON";

export interface NoteContent {
  raw: string;
  html: string;
  format: NoteFormat;
}

export interface CreateTradingPlanInput {
  tradingStyle: string;
  tradingSessions: string[];
  timeZone: string;
  riskRewardRatio: number;
  note?: string;
  renderAs?: NoteFormat;
}
