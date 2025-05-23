import { GraphQLError } from "graphql";
import { CreateTradingPlanInput } from "../typeDefs/plan.js";
import { GraphqlContext } from "../../types/types.utils.js";
import { tradingPlans } from "../../db/schema/plan.js";
import { users } from "../../db/schema/auth.js";
import { eq } from "drizzle-orm";

export const planResolvers = {
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
        await db.insert(tradingPlans).values({
          userId: user.id,
          tradingStyle: input.tradingStyle,
          tradingSessions: input.tradingSessions,
          timeZone: input.timeZone,
          riskRewardRatio: input.riskRewardRatio,
          note: input.note ?? "",
        });

        await db
          .update(users)
          .set({ onboardingStep: "complete" })
          .where(eq(users.id, user.id));

        return {
          success: true,
          message: "Trading plan created successfully",
        };
      } catch (error) {
        console.error("Error creating trading plan:", error);
        throw new GraphQLError("Failed to create trading plan", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
