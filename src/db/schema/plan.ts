import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
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
  note: text("note").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
