import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./auth.js";

export const tradingPlans = pgTable("trading_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tradingStyle: text("trading_style").notNull(),
  tradingSessions: text("trading_sessions").array().notNull(),
  timeZone: text("time_zone").notNull(),
  riskRewardRatio: integer("risk_reward_ratio").notNull(),
  isOwner: boolean("is_owner").default(false).notNull(),
  note: jsonb("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enum for visibility
export const planVisibilityEnum = ["PUBLIC", "PRIVATE"] as const;
export type PlanVisibility = (typeof planVisibilityEnum)[number];

export const sharedTradingPlans = pgTable("shared_trading_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  originalPlanId: uuid("original_plan_id")
    .notNull()
    .references(() => tradingPlans.id, { onDelete: "cascade" }),
  sharedByUserId: text("shared_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // "PUBLIC" allows anyone with link; "PRIVATE" is viewable by only 1 person
  visibility: text("visibility", { enum: planVisibilityEnum }).notNull(),
  // Whether a PRIVATE plan has already been viewed
  viewed: boolean("viewed").default(false).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
