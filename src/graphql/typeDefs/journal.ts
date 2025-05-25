import { gql } from "graphql-tag";

export const journalTypeDefs = gql`
  scalar JSON
  scalar DateTime

  type Journal {
    id: ID!

    # Relation
    accountId: ID!
    account: TradingAccount

    # Setup
    executionStyle: String!
    instrument: String!
    side: String!
    size: Float!
    plannedEntryPrice: Float!
    plannedStopLoss: Float!
    plannedTakeProfit: Float!

    # Rich text
    note: JSON

    # Executed (optional)
    executedEntryPrice: Float
    executedStopLoss: Float
    executionNotes: JSON

    # Closed (optional)
    exitPrice: Float
    targetHit: Boolean

    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type TradingAccount {
    id: ID!
    accountId: String!
  }

  # Input types for mutations
  input CreateJournalInput {
    accountId: [ID!]
    executionStyle: String!
    instrument: String!
    side: String!
    size: Float!
    plannedEntryPrice: Float!
    plannedStopLoss: Float!
    plannedTakeProfit: Float!
    note: JSON
  }

  input UpdateJournalInput {
    id: ID!
    executedEntryPrice: Float
    executedStopLoss: Float
    executionNotes: JSON
    exitPrice: Float
    targetHit: Boolean
    note: JSON
    plannedEntryPrice: Float
    plannedStopLoss: Float
    plannedTakeProfit: Float
    executionStyle: String
    instrument: String
    side: String
    size: Float
  }

  input UpdateJournalExecutionInput {
    id: ID!
    executedEntryPrice: Float
    executedStopLoss: Float
    executionNotes: JSON
  }

  input CloseJournalInput {
    id: ID!
    exitPrice: Float
    targetHit: Boolean
  }

  type JournalResponse {
    success: Boolean!
    message: String!
  }

  type Mutation {
    createJournal(input: CreateJournalInput!): JournalResponse!
    updateJournal(input: UpdateJournalInput!): JournalResponse!
  }

  type Query {
    getJournal(id: ID!): Journal
    getJournalsByAccount(accountId: ID!): [Journal!]!
    getLoggedJournals: [Journal!]!
  }
`;
