import { GraphQLError } from "graphql";
import { GraphqlContext } from "@/types/types.utils.js";

import { eq } from "drizzle-orm";

import { generateSnowflakeId } from "@/utils/snowflake.js";
import { AccountSetupInput } from "../typeDefs/account.js";
import { tradingAccounts } from "@/db/schema/account.js";
import { users } from "@/db/schema/auth.js";

export const accountResolvers = {
  Mutation: {
    setupAccount: async (
      _: any,
      args: { input: AccountSetupInput },
      context: GraphqlContext
    ) => {
      const { input } = args;
      const { db, user } = context;

      if (!user?.id) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      const {
        goal,
        propFirm,
        broker,
        accountSize,
        accountCurrency,
        accountName,
        experienceLevel,
        biggestChallenge,
      } = input;

      // Sanity validation
      if (accountSize <= 0) {
        throw new GraphQLError("Account size must be a positive number");
      }

      try {
        const snowflakeId = generateSnowflakeId();

        // 1. Check if user already has any accounts
        const existingAccounts = await db
          .select()
          .from(tradingAccounts)
          .where(eq(tradingAccounts.userId, user.id));

        // 2. If it's the user's first account, update onboardingStep
        if (existingAccounts.length === 0) {
          await db
            .update(users)
            .set({ onboardingStep: "safety_net" })
            .where(eq(users.id, user.id));
        }

        const [account] = await db
          .insert(tradingAccounts)
          .values({
            accountId: snowflakeId, // Store as text
            userId: user.id,
            goal: goal.toLowerCase() as any, // Type assertion to handle the enum type
            isProp: goal === "PROP",
            propFirm: propFirm,
            broker: broker,
            accountSize: Math.floor(accountSize),
            accountCurrency: accountCurrency.toUpperCase() as any, // Type assertion for enum
            accountName: accountName,
            experienceLevel: experienceLevel?.toLowerCase() as any, // Type assertion for enum
            biggestChallenge: biggestChallenge?.map((c) =>
              c.toLowerCase()
            ) as any, // Type assertion for enum array
          })
          .returning();

        return {
          ...account,
          goal: account.goal.toUpperCase(),
          accountCurrency: account.accountCurrency.toUpperCase(),
          experienceLevel: account.experienceLevel?.toUpperCase() || null,
          biggestChallenge:
            account.biggestChallenge?.map((c: string) => c.toUpperCase()) || [],
        };
      } catch (error) {
        console.error("Error creating trading account:", error);
        throw new GraphQLError("Failed to create trading account", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
