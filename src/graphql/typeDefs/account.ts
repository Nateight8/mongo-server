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
    CONSISTENCY
    PSYCHOLOGY
    PATIENCE
  }

  type TradingAccount {
    id: ID! # UUID
    accountId: String! # Snowflake ID
    userId: String!
    goal: Goal!
    propFirm: String
    broker: String
    accountSize: Float!
    accountCurrency: AccountCurrency!
    accountName: String!
    experienceLevel: ExperienceLevel
    biggestChallenge: [BiggestChallenge!]
    createdAt: String!
    updatedAt: String!
    isProp: Boolean!
    funded: Boolean! # ✅ NEW FIELD
    fundedAt: String # ✅ NEW FIELD (nullable)
  }

  input AccountSetupInput {
    goal: Goal!
    propFirm: String
    broker: String!
    accountSize: Float!
    accountCurrency: AccountCurrency!
    accountName: String!
    experienceLevel: ExperienceLevel
    biggestChallenge: [BiggestChallenge!]
  }

  type Mutation {
    setupAccount(input: AccountSetupInput!): TradingAccount!
  }

  type Query {
    tradingAccounts: [TradingAccount!]!

    tradingAccount(id: ID!): TradingAccount
  }
`;

enum Goal {
  PROP = "PROP",
  IMPROVE = "IMPROVE",
  DISCIPLINE = "DISCIPLINE",
  ANALYTICS = "ANALYTICS",
}

enum AccountCurrency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
}

enum ExperienceLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

enum BiggestChallenge {
  RISK_MANAGEMENT = "RISK_MANAGEMENT",
  DISCIPLINE = "DISCIPLINE",
  STRATEGY = "STRATEGY",
  CONSISTENCY = "CONSISTENCY",
}

export interface AccountSetupInput {
  goal: Goal;
  propFirm?: string | null;
  broker: string;
  accountSize: number;
  accountCurrency: AccountCurrency;
  accountName: string;
  experienceLevel?: ExperienceLevel | null;
  biggestChallenge?: BiggestChallenge[] | null;
}

export type TradingAccount = {
  id: string;
  accountId: string;
  userId: string;
  goal: "prop" | "improve" | "discipline" | "analytics";
  isProp: boolean;
  funded: boolean;
  fundedAt?: string | null;
  propFirm?: string | null;
  broker?: string | null;
  accountSize: number;
  accountCurrency: "USD" | "EUR" | "GBP";
  accountName: string;
  experienceLevel?: "beginner" | "intermediate" | "advanced" | null;
  biggestChallenge?:
    | ("riskManagement" | "consistency" | "psychology" | "patience")[]
    | null;
  createdAt: string;
  updatedAt: string;
};
