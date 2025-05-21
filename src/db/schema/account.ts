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
// @ts-ignore
// const { users } = require("./auth.js");
import { users } from "./auth.js";

// Enums if you haven’t already
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

export const tradingAccounts = pgTable("trading_accounts", {
  id: uuid("id").defaultRandom().primaryKey(), // UUID
  accountId: bigint("account_id", { mode: "bigint" }).notNull().unique(), // Snowflake ID
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  goal: goalEnum("goal").notNull(),
  isProp: boolean("is_prop").notNull().default(false), // ✅ Added
  propFirm: text("prop_firm"),
  broker: text("broker"),
  accountSize: integer("account_size").notNull(),
  accountCurrency: accountCurrencyEnum("account_currency").notNull(),
  accountName: text("account_name").notNull(),
  experienceLevel: experienceLevelEnum("experience_level"),
  biggestChallenge: biggestChallengeEnum("biggest_challenge").array(), // nullable by default
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
