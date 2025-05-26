import {
  pgTable,
  uuid,
  text,
  boolean,
  bigint,
  timestamp,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { users } from "./auth.js";
import { safetyNets } from "./safety-net.js";

// Enums
export const goalEnum = pgEnum("goal", [
  "prop",
  "improve",
  "discipline",
  "analytics",
]);
export const accountCurrencyEnum = pgEnum("account_currency", [
  "USD",
  "EUR",
  "GBP",
]);
export const experienceLevelEnum = pgEnum("experience_level", [
  "beginner",
  "intermediate",
  "advanced",
]);
export const biggestChallengeEnum = pgEnum("biggest_challenge", [
  "riskManagement",
  "consistency",
  "psychology",
  "patience",
]);

// Trading Accounts table
export const tradingAccounts = pgTable("trading_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: text("account_id").notNull().unique(), // snowflake ID
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  goal: goalEnum("goal").notNull(),
  isProp: boolean("is_prop").notNull().default(false),
  funded: boolean("funded").notNull().default(false), // ✅ NEW FIELD
  fundedAt: timestamp("funded_at", { mode: "date" }), // ✅ Optional
  propFirm: text("prop_firm"),
  broker: text("broker"),
  accountSize: integer("account_size").notNull(),
  accountCurrency: accountCurrencyEnum("account_currency").notNull(),
  accountName: text("account_name").notNull(),
  experienceLevel: experienceLevelEnum("experience_level"),
  biggestChallenge: biggestChallengeEnum("biggest_challenge").array(),
  safetyNetId: uuid("safety_net_id").references(() => safetyNets.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
