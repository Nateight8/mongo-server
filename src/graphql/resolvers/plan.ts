// === Enhanced Resolvers ===
import { GraphQLError } from "graphql";
import { GraphqlContext } from "../../types/types.utils.js";

import { and, eq } from "drizzle-orm";
import { addHours } from "date-fns";
import {
  CreateTradingPlanInput,
  NoteFormat,
  NoteContent,
} from "../typeDefs/plan.js";
import { generateTradingPlanTemplate } from "../../lib/templates/trading-plan.js";

import { sharedTradingPlans, tradingPlans } from "../../db/schema/plan.js";
import { users } from "../../db/schema/auth.js";
import { createEmptyNote, formatNote } from "../../lib/templates/util.js";
import { journalingNoteTemplates, journals } from "../../db/schema/journal.js";
import { generateJournalNoteTemplate } from "../../lib/templates/journaling-note.js";

// Enhanced formatTradingPlanNote function
export const formatTradingPlanNote = async (
  note: any,
  renderAs: NoteFormat = "HTML"
): Promise<NoteContent> => {
  if (!note) return Promise.resolve(createEmptyNote());

  // If note is already a properly formatted NoteContent object, return it as a resolved Promise
  if (
    typeof note === "object" &&
    note !== null &&
    "raw" in note &&
    "html" in note &&
    "format" in note
  ) {
    return Promise.resolve(note as NoteContent);
  }

  // If note is a string, format it according to renderAs
  const noteString = typeof note === "string" ? note : JSON.stringify(note);
  return await formatNote(noteString, renderAs);
};

// Helper function to structure plan response with proper note formatting
const formatPlanResponse = async (plan: any): Promise<any> => {
  if (!plan) return null;

  const formattedNote = await formatTradingPlanNote(
    plan.note,
    plan.note?.format || "HTML"
  );

  return {
    ...plan,
    note: formattedNote,
  };
};

export const planResolvers = {
  Query: {
    getTradingPlan: async (_: any, __: any, ctx: GraphqlContext) => {
      const { db, user } = ctx;

      if (!user?.id) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      try {
        const [plan] = await db
          .select()
          .from(tradingPlans)
          .where(eq(tradingPlans.userId, user.id))
          .limit(1);

        if (!plan) {
          return {
            success: false,
            message: "Trading plan not found",
            plan: null,
          };
        }

        const formattedPlan = await formatPlanResponse(plan);
        return {
          success: true,
          message: "Trading plan retrieved successfully",
          plan: formattedPlan,
        };
      } catch (error) {
        console.error("Error fetching trading plan:", error);
        throw new GraphQLError("Failed to fetch trading plan", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    getSharedTradingPlan: async (
      _: any,
      { id }: { id: string },
      ctx: GraphqlContext
    ) => {
      const { db } = ctx;

      try {
        // Find the shared plan and join with the original plan
        const [sharedPlan] = await db
          .select({
            id: sharedTradingPlans.id,
            originalPlanId: sharedTradingPlans.originalPlanId,
            sharedByUserId: sharedTradingPlans.sharedByUserId,
            visibility: sharedTradingPlans.visibility,
            viewed: sharedTradingPlans.viewed,
            expiresAt: sharedTradingPlans.expiresAt,
            createdAt: sharedTradingPlans.createdAt,
            plan: tradingPlans,
          })
          .from(sharedTradingPlans)
          .innerJoin(
            tradingPlans,
            eq(tradingPlans.id, sharedTradingPlans.originalPlanId)
          )
          .where(eq(sharedTradingPlans.id, id))
          .limit(1);

        if (!sharedPlan) {
          return {
            success: false,
            message: "Shared plan not found",
            sharedPlan: null,
          };
        }

        // Check if expired
        if (new Date() > sharedPlan.expiresAt) {
          return {
            success: false,
            message: "Shared plan has expired",
            sharedPlan: null,
          };
        }

        // If it's a PRIVATE plan and already viewed, deny access
        if (sharedPlan.visibility === "PRIVATE" && sharedPlan.viewed) {
          return {
            success: false,
            message: "This private plan has already been viewed",
            sharedPlan: null,
          };
        }

        // Mark as viewed if it's a PRIVATE plan
        if (sharedPlan.visibility === "PRIVATE" && !sharedPlan.viewed) {
          await db
            .update(sharedTradingPlans)
            .set({ viewed: true })
            .where(eq(sharedTradingPlans.id, id));
        }

        const formattedPlan = await formatPlanResponse(sharedPlan.plan);
        return {
          success: true,
          message: "Shared plan retrieved successfully",
          sharedPlan: {
            ...sharedPlan,
            viewed:
              sharedPlan.visibility === "PRIVATE" ? true : sharedPlan.viewed,
            plan: formattedPlan,
          },
        };
      } catch (error) {
        console.error("Error fetching shared trading plan:", error);
        throw new GraphQLError("Failed to fetch shared trading plan", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },

  Mutation: {
    createTradingPlan: async (
      _: any,
      { input }: { input: CreateTradingPlanInput },
      ctx: GraphqlContext
    ) => {
      const { db, user } = ctx;

      if (!user?.id) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      try {
        // Check if user already has a trading plan
        const [existingPlan] = await db
          .select()
          .from(tradingPlans)
          .where(eq(tradingPlans.userId, user.id))
          .limit(1);

        if (existingPlan) {
          throw new GraphQLError(
            "Trading plan already exists. Use updateTradingPlan instead.",
            {
              extensions: { code: "CONFLICT" },
            }
          );
        }

        // Format the trading plan note based on the requested format
        const noteContent =
          input.note === "" ? generateTradingPlanTemplate() : input.note || "";
        const renderAs = input.renderAs || "HTML";
        const formattedNote = await formatTradingPlanNote(
          noteContent,
          renderAs
        );

        const journalNoteTemplate = generateJournalNoteTemplate();
        const formattedJournalNoteTemplate = await formatTradingPlanNote(
          journalNoteTemplate,
          renderAs
        );

        // Format the journal note based on the requested format

        const [newPlan] = await db
          .insert(tradingPlans)
          .values({
            userId: user.id,
            tradingStyle: input.tradingStyle,
            tradingSessions: input.tradingSessions,
            timeZone: input.timeZone,
            riskRewardRatio: input.riskRewardRatio,
            note: formattedNote, // Store the complete NoteContent object
            isOwner: false,
          })
          .returning();

        await db.insert(journalingNoteTemplates).values({
          userId: user.id,
          note: formattedJournalNoteTemplate,
        });

        // Update user onboarding status
        await db
          .update(users)
          .set({
            onboardingStep: "complete",
            onboardingCompleted: true,
          })
          .where(eq(users.id, user.id));

        return {
          success: true,
          message: "Trading plan created successfully",
          plan: formatPlanResponse(newPlan),
        };
      } catch (error) {
        console.error("Error creating trading plan:", error);
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError("Failed to create trading plan", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    updateTradingPlan: async (
      _: any,
      { input }: { input: CreateTradingPlanInput },
      ctx: GraphqlContext
    ) => {
      const { db, user } = ctx;

      if (!user?.id) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      try {
        const [existingPlan] = await db
          .select()
          .from(tradingPlans)
          .where(eq(tradingPlans.userId, user.id))
          .limit(1);

        if (!existingPlan) {
          throw new GraphQLError("Trading plan not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        // Format the note based on the requested format if note is being updated
        let formattedNote = existingPlan.note as NoteContent;
        if (input.note !== undefined) {
          const renderAs = input.renderAs || "HTML";
          formattedNote = await formatTradingPlanNote(
            input.note || "",
            renderAs
          );
        }

        const [updatedPlan] = await db
          .update(tradingPlans)
          .set({
            tradingStyle: input.tradingStyle,
            tradingSessions: input.tradingSessions,
            timeZone: input.timeZone,
            riskRewardRatio: input.riskRewardRatio,
            note: formattedNote, // Store the complete NoteContent object
            updatedAt: new Date(),
            isOwner: true,
          })
          .where(eq(tradingPlans.userId, user.id))
          .returning();

        if (!updatedPlan) {
          throw new GraphQLError("Trading plan not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        return {
          success: true,
          message: "Trading plan updated successfully",
          plan: formatPlanResponse(updatedPlan),
        };
      } catch (error) {
        console.error("Error updating trading plan:", error);
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError("Failed to update trading plan", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    shareTradingPlan: async (
      _: any,
      { visibility }: { visibility: "PUBLIC" | "PRIVATE" },
      ctx: GraphqlContext
    ) => {
      const { db, user } = ctx;

      if (!user?.id) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      try {
        // Fetch the user's trading plan and confirm ownership
        const [plan] = await db
          .select()
          .from(tradingPlans)
          .where(
            and(
              eq(tradingPlans.userId, user.id),
              eq(tradingPlans.isOwner, true)
            )
          )
          .limit(1);

        if (!plan) {
          throw new GraphQLError(
            "You must first create or edit your plan before sharing.",
            {
              extensions: { code: "NOT_FOUND" },
            }
          );
        }

        // Insert shared plan with 24-hour expiration
        const expiresAt = addHours(new Date(), 24);

        const [sharedPlan] = await db
          .insert(sharedTradingPlans)
          .values({
            sharedByUserId: user.id,
            originalPlanId: plan.id,
            visibility,
            expiresAt,
          })
          .returning();

        const formattedPlan = await formatPlanResponse(plan);
        return {
          success: true,
          message: "Trading plan shared successfully",
          sharedPlan: {
            id: sharedPlan.id,
            originalPlanId: sharedPlan.originalPlanId,
            sharedByUserId: sharedPlan.sharedByUserId,
            visibility: sharedPlan.visibility,
            viewed: sharedPlan.viewed,
            expiresAt: sharedPlan.expiresAt,
            createdAt: sharedPlan.createdAt,
            plan: formattedPlan,
          },
        };
      } catch (error) {
        console.error("Error sharing trading plan:", error);
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError("Failed to share trading plan", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    updateTradingPlanNote: async (
      _: any,
      { note }: { note: any },
      ctx: GraphqlContext
    ) => {
      const { db, user } = ctx;

      if (!user?.id) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      try {
        // Format the note based on the requested format
        const formattedNote = await formatTradingPlanNote(note, "HTML");

        // Check if the user already has a trading plan
        const [existingPlan] = await db
          .select()
          .from(tradingPlans)
          .where(eq(tradingPlans.userId, user.id))
          .limit(1);

        if (!existingPlan) {
          throw new GraphQLError("Trading plan not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        // Update the note field and set isOwner to true if it's the first update
        await db
          .update(tradingPlans)
          .set({
            note: formattedNote,
            isOwner: true,  // This will set isOwner to true on first update
            updatedAt: new Date(),
          })
          .where(eq(tradingPlans.id, existingPlan.id));

        return {
          success: true,
          message: "Trading plan note updated successfully",
        };
      } catch (error) {
        console.error("Error updating trading plan note:", error);

        if (error instanceof GraphQLError) {
          throw error;
        }

        throw new GraphQLError("Failed to update trading plan note", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
