import { eq } from "drizzle-orm";
import { CreateSafetyNetInput } from "../typeDefs/safety.js";
import { GraphqlContext } from "../../types/types.utils.js";
import { GraphQLError } from "graphql";
import { safetyNets } from "../../db/schema/safety-net.js";
import { users } from "../../db/schema/auth.js";

export const safetyNetResolvers = {
  Mutation: {
    createSafetyNet: async (
      _: unknown,
      args: { input: CreateSafetyNetInput },
      context: GraphqlContext
    ) => {
      const {
        maxDailyRisk,
        maxDailyDrawdown,
        maxTotalDrawdown,
        riskPerTrade,
        maxOpenTrades,
        isDefault = false,
      } = args.input;
      const { db, user } = context;

      if (!user?.id) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      try {
        // Use a transaction to ensure data consistency
        return await db.transaction(async (tx) => {
          // Check if this is the user's first safety net
          const existingSafetyNets = await tx
            .select({ id: safetyNets.id })
            .from(safetyNets)
            .where(eq(safetyNets.userId, user.id));

          const isFirstSafetyNet = existingSafetyNets.length === 0;

          // If this is the first safety net, it should be the default
          const shouldBeDefault = isFirstSafetyNet || isDefault;

          // If this should be the default, update all other safety nets to not be default
          if (shouldBeDefault && !isFirstSafetyNet) {
            await tx
              .update(safetyNets)
              .set({ isDefault: false })
              .where(eq(safetyNets.userId, user.id));
          }

          await tx
            .insert(safetyNets)
            .values({
              userId: user.id,
              maxDailyRisk,
              maxDailyDrawdown,
              maxTotalDrawdown,
              riskPerTrade,
              maxOpenTrades,
              isDefault: shouldBeDefault,
            })
            .returning();

          //update user onboarding step if it's the first safety net
          if (isFirstSafetyNet) {
            await tx
              .update(users)
              .set({ onboardingStep: "trading_style" })
              .where(eq(users.id, user.id));
          }

          return {
            success: true,
            message: "Safety net created successfully",
          };
        });
      } catch (error) {
        console.error("Error creating safety net:", error);
        throw new GraphQLError(
          error instanceof Error
            ? error.message
            : "Failed to create safety net",
          {
            extensions: { code: "INTERNAL_ERROR" },
          }
        );
      }
    },
  },
};
