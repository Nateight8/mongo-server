import { gql } from "graphql-tag";

export const userAccounts = gql`
  enum Goal {
    PROP
    IMPROVE
    DISCIPLINE
    ANALYTICS
  }

  enum AccountCurrency {
    USD
    EUR
    GBP
  }

  enum ExperienceLevel {
    BEGINNER
    INTERMEDIATE
    ADVANCED
  }

  enum BiggestChallenge {
    RISK_MANAGEMENT
    DISCIPLINE
    STRATEGY
    CONSISTENCY
  }

  enum OnboardingStep {
    ACCOUNT_SETUP
    STEP_TWO
    COMPLETED
  }

  type TradingAccount {
    id: ID! # UUID
    accountId: String! # Snowflake ID
    userId: String!
    goal: Goal!
    propFirm: String
    broker: String
    accountSize: Float! # Changed from BigInt to Float to match the type in user.ts
    accountCurrency: AccountCurrency!
    accountName: String!
    experienceLevel: ExperienceLevel
    biggestChallenge: [BiggestChallenge!]
    createdAt: String!
    updatedAt: String!
    isProp: Boolean! # ← added this field
  }

  type User {
    id: ID!
    email: String!
    onboardingStep: OnboardingStep
    tradingAccount: TradingAccount
  }

  input AccountSetupInput {
    goal: Goal!
    propFirm: String
    broker: String!
    accountSize: Float! # Changed from BigInt to Float to match the type in user.ts
    accountCurrency: AccountCurrency!
    accountName: String!
    experienceLevel: ExperienceLevel
    biggestChallenge: [BiggestChallenge!]
  }

  type Mutation {
    setupAccount(input: AccountSetupInput!): TradingAccount!
  }
`;
