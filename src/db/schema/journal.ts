import {
  pgTable,
  uuid,
  varchar,
  numeric,
  jsonb,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { tradingAccounts } from "./account.js";

export const journals = pgTable("journals", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Reference to specific trading account
  accountId: uuid("account_id")
    .notNull()
    .references(() => tradingAccounts.id, { onDelete: "cascade" }),

  // Trade setup
  executionStyle: varchar("execution_style", { length: 50 }).notNull(),
  instrument: varchar("instrument", { length: 20 }).notNull(),
  side: varchar("side", { length: 10 }).notNull(),
  size: numeric("size", { precision: 10, scale: 2 }).notNull(),

  // Planned levels
  plannedEntryPrice: numeric("planned_entry_price", {
    precision: 10,
    scale: 5,
  }).notNull(),
  plannedStopLoss: numeric("planned_stop_loss", {
    precision: 10,
    scale: 5,
  }).notNull(),
  plannedTakeProfit: numeric("planned_take_profit", {
    precision: 10,
    scale: 5,
  }).notNull(),

  // Optional journal note (rich text using TipTap)
  note: jsonb("note"),

  // Optional: updated after execution
  executedEntryPrice: numeric("executed_entry_price", {
    precision: 10,
    scale: 5,
  }),
  executedStopLoss: numeric("executed_stop_loss", {
    precision: 10,
    scale: 5,
  }),
  executionNotes: jsonb("execution_notes"),

  // Optional: updated after closing
  exitPrice: numeric("exit_price", { precision: 10, scale: 5 }),

  // Optional: whether this trade hit the user's overall target
  targetHit: boolean("target_hit"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
