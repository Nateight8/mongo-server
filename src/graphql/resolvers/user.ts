import { users } from "../../db/schema/auth.js";
import { GraphqlContext } from "@/types/types.utils.js";

import { eq } from "drizzle-orm";
import { GraphQLError } from "graphql";

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
        const userRecord = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id));

        const userData = userRecord[0];

        if (!userData) {
          throw new GraphQLError("User not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        return userData;
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
