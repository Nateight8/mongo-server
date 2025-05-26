import { relations } from 'drizzle-orm';
import { journals } from './journal.js';
import { tradingAccounts } from './account.js';

export const journalRelations = relations(journals, ({ one }) => ({
  account: one(tradingAccounts, {
    fields: [journals.accountId],
    references: [tradingAccounts.id],
  }),
}));

export const tradingAccountRelations = relations(tradingAccounts, ({ many }) => ({
  journals: many(journals),
}));
