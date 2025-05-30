import { users } from "../../db/schema/auth.js";
import { GraphqlContext } from "../../types/types.utils.js";

import { eq } from "drizzle-orm";
import { GraphQLError } from "graphql";
import { tradingAccounts } from "../../db/schema/account.js";

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: GraphqlContext) => {
      const { user, db } = context;

      if (!user?.id) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      try {
        // First get the user
        const [userData] = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id));

        if (!userData) {
          throw new GraphQLError("User not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        // Then get the user's accounts with required fields for TradingAccount type
        const userAccounts = await db
          .select({
            id: tradingAccounts.id,
            accountId: tradingAccounts.accountId,
            accountName: tradingAccounts.accountName,
            broker: tradingAccounts.broker,
            accountSize: tradingAccounts.accountSize,
            accountCurrency: tradingAccounts.accountCurrency,
            isProp: tradingAccounts.isProp,
            funded: tradingAccounts.funded,
            fundedAt: tradingAccounts.fundedAt,
            propFirm: tradingAccounts.propFirm,
            goal: tradingAccounts.goal,
            experienceLevel: tradingAccounts.experienceLevel,
            biggestChallenge: tradingAccounts.biggestChallenge,
            createdAt: tradingAccounts.createdAt,
            updatedAt: tradingAccounts.updatedAt,
          })
          .from(tradingAccounts)
          .where(eq(tradingAccounts.userId, user.id));

        // Return user with accounts
        return {
          ...userData,
          accounts: userAccounts,
        };
      } catch (error) {
        console.error("Error fetching user:", error);
        throw new GraphQLError("Failed to fetch user", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
  Mutation: {
    logout: async (
      _parent: unknown,
      _args: unknown,
      context: GraphqlContext
    ) => {
      const { req, res } = context;

      if (!req || !res) {
        throw new GraphQLError("Request/response not available in context");
      }

      return new Promise((resolve, reject) => {
        req.logout((err: Error | null) => {
          if (err) {
            return reject(new GraphQLError("Logout failed"));
          }

          // Also destroy session cookie
          req.session.destroy((destroyErr: any) => {
            if (destroyErr) {
              return reject(new GraphQLError("Session destruction failed"));
            }

            res.clearCookie("connect.sid"); // Make sure this matches your session cookie name

            resolve({
              success: true,
              message: "Logged out successfully",
            });
          });
        });
      });
    },
  },
};
