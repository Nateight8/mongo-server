import { GraphQLError } from "graphql";
import type { GraphqlContext } from "../../types/types.utils.js";
import { db } from "../../db/index.js";
import { and, eq, inArray } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { tradingAccounts } from "../../db/schema/account.js";
import { journalingNoteTemplates } from "../../db/schema/journal.js";
import { journals } from "../../db/schema/journal.js";
import { formatTradingPlanNote } from "./plan.js";

type Journal = InferSelectModel<typeof journals>;

export const journalResolvers = {
  Query: {
    getLoggedJournals: async (_: any, __: any, ctx: GraphqlContext) => {
      const { db, user } = ctx;

      if (!user?.id) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      // Get all trading accounts for the logged-in user
      const userAccounts = await db
        .select({ id: tradingAccounts.id })
        .from(tradingAccounts)
        .where(eq(tradingAccounts.userId, user.id));

      const accountIds = userAccounts.map((acc) => acc.id);

      if (accountIds.length === 0) return [];

      // Get all journals associated with the user's trading accounts
      const userJournals = await db
        .select()
        .from(journals)
        .where(inArray(journals.accountId, accountIds));

      return userJournals;
    },
    getJournal: async (
      _: unknown,
      args: { id: string },
      ctx: GraphqlContext
    ) => {
      const { db, user } = ctx;

      if (!user?.id) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      if (!args.id) {
        throw new GraphQLError("Journal ID is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      try {
        // Get the journal with account verification to ensure ownership
        const result = await db
          .select()
          .from(journals)
          .innerJoin(
            tradingAccounts,
            eq(journals.accountId, tradingAccounts.id)
          )
          .where(
            and(eq(journals.id, args.id), eq(tradingAccounts.userId, user.id))
          )
          .limit(1);

        const journal = result[0]?.journals;

        if (!journal) {
          throw new GraphQLError("Journal not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        return journal;
      } catch (error) {
        // Re-throw GraphQLErrors as-is
        if (error instanceof GraphQLError) {
          throw error;
        }

        console.error("Error fetching journal:", error);
        throw new GraphQLError("Failed to fetch journal", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },

  Mutation: {
    createJournal: async (_: any, args: any, ctx: GraphqlContext) => {
      const { db, user } = ctx;

      if (!user?.id) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      const userId = user.id;

      // Verify the account belongs to the user
      const account = await db.query.tradingAccounts.findFirst({
        where: (accounts, { and, eq }) =>
          and(
            eq(accounts.id, args.input.accountId),
            eq(accounts.userId, userId)
          ),
      });

      if (!account) {
        throw new GraphQLError("Invalid account or unauthorized", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      try {
        await db
          .insert(journals)
          .values({
            accountId: args.input.accountId,
            executionStyle: args.input.executionStyle,
            instrument: args.input.instrument,
            side: args.input.side,
            size: args.input.size,
            plannedEntryPrice: args.input.plannedEntryPrice,
            plannedStopLoss: args.input.plannedStopLoss,
            plannedTakeProfit: args.input.plannedTakeProfit,
            note: args.input.note,
          })
          .returning();
      } catch (error) {
        console.error("Error creating journal:", error);
        throw new GraphQLError("Failed to create journal", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }

      return {
        success: true,
        message: "Journal created successfully",
      };
    },

    updateJournal: async (_: any, args: any, ctx: GraphqlContext) => {
      const { db, user } = ctx;

      if (!user?.id) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      const userId = user.id;
      const { id, ...updateData } = args.input;

      if (!id) {
        throw new GraphQLError("Journal ID is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      try {
        // First, verify the journal exists and belongs to the user
        const journalResult = await db
          .select({
            id: journals.id,
            account: {
              id: tradingAccounts.id,
              userId: tradingAccounts.userId,
            },
            // Include all journal fields
            ...Object.keys(journals).reduce<Record<string, any>>(
              (acc: Record<string, any>, key) => {
                if (key !== "id") {
                  acc[key] = journals[key as keyof typeof journals];
                }
                return acc;
              },
              {}
            ),
          })
          .from(journals)
          .innerJoin(
            tradingAccounts,
            eq(journals.accountId, tradingAccounts.id)
          )
          .where(and(eq(journals.id, id), eq(tradingAccounts.userId, userId)))
          .limit(1);

        const journal = journalResult[0] || null;

        if (!journal) {
          throw new GraphQLError("Journal not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        if (journal.account.userId !== userId) {
          throw new GraphQLError("Unauthorized to update this journal", {
            extensions: { code: "UNAUTHORIZED" },
          });
        }

        // Filter out any fields that shouldn't be updatable
        const allowedFields = [
          "executedEntryPrice",
          "executedStopLoss",
          "executionNotes",
          "exitPrice",
          "targetHit",
          "note",
          "plannedEntryPrice",
          "plannedStopLoss",
          "plannedTakeProfit",
          "executionStyle",
          "instrument",
          "side",
          "size",
        ];

        const filteredUpdateData = Object.keys(updateData)
          .filter((key) => allowedFields.includes(key))
          .reduce((obj, key) => {
            obj[key] = updateData[key];
            return obj;
          }, {} as any);

        if (Object.keys(filteredUpdateData).length === 0) {
          throw new GraphQLError("No valid fields provided for update", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        // Add updatedAt timestamp
        filteredUpdateData.updatedAt = new Date();

        // Perform the update
        const updateResult = await db
          .update(journals)
          .set(filteredUpdateData)
          .where(eq(journals.id, id))
          .returning();

        if (updateResult.length === 0) {
          throw new GraphQLError("Failed to update journal", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }

        return {
          success: true,
          message: "Journal updated successfully",
          journal: updateResult[0], // Return the updated journal if needed
        };
      } catch (error) {
        // Re-throw GraphQLErrors as-is
        if (error instanceof GraphQLError) {
          throw error;
        }

        // Log unexpected errors
        console.error("Unexpected error updating journal:", error);
        throw new GraphQLError(
          "An unexpected error occurred while updating the journal",
          {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          }
        );
      }
    },

    updateJournalTemplate: async (
      _: any,
      { note }: { note: any },
      ctx: GraphqlContext
    ) => {
      const { user } = ctx;

      if (!user?.id) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      try {
        // Format the note based on the requested format
        const formattedNote = await formatTradingPlanNote(note, "HTML");

        // Check if the user already has a journal template
        const [existingTemplate] = await db
          .select()
          .from(journalingNoteTemplates)
          .where(eq(journalingNoteTemplates.userId, user.id))
          .limit(1);

        let result;

        if (existingTemplate) {
          // Update existing template
          [result] = await db
            .update(journalingNoteTemplates)
            .set({
              note: formattedNote,
              updatedAt: new Date(),
            })
            .where(eq(journalingNoteTemplates.id, existingTemplate.id))
            .returning();
        } else {
          // Create new template
          [result] = await db
            .insert(journalingNoteTemplates)
            .values({
              userId: user.id,
              note: formattedNote,
            })
            .returning();

          //update journal owner
        }

        return {
          success: true,
          message: "Journal template updated successfully",
        };
      } catch (error) {
        console.error("Error updating journal template:", error);

        if (error instanceof GraphQLError) {
          throw error;
        }

        throw new GraphQLError("Failed to update journal template", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
