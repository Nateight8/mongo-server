import {
  pgTable,
  uuid,
  varchar,
  numeric,
  jsonb,
  timestamp,
  boolean,
  text,
} from "drizzle-orm/pg-core";
import { tradingAccounts } from "./account.js";
import { users } from "./auth.js";

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

export const journalingNoteTemplates = pgTable("journaling_note_templates", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Reference to the user who created the template
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Template content (rich text using TipTap JSON)
  note: jsonb("note").notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type JournalingNoteTemplate =
  typeof journalingNoteTemplates.$inferSelect;
export type NewJournalingNoteTemplate =
  typeof journalingNoteTemplates.$inferInsert;
