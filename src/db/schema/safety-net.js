import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./auth.js";

export const safetyNets = pgTable("safety_nets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  maxDailyRisk: integer("max_daily_risk").notNull(),
  maxDailyDrawdown: integer("max_daily_drawdown").notNull(),
  maxTotalDrawdown: integer("max_total_drawdown").notNull(),
  riskPerTrade: integer("risk_per_trade").notNull(),
  maxOpenTrades: integer("max_open_trades").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
