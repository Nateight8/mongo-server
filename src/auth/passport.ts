import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
  VerifyCallback,
} from "passport-google-oauth20";
import "dotenv/config";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { Snowflake } from "@theinternetfolks/snowflake";
import { users } from "../db/schema/auth.js";

export function setupPassport() {
  // Debug log to check environment variables
  console.log("Google OAuth Config:", {
    clientID: process.env.AUTH_GOOGLE_ID ? "Set" : "Not Set",
    clientSecret: process.env.AUTH_GOOGLE_SECRET ? "Set" : "Not Set",
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.AUTH_GOOGLE_ID || "",
        clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:4000/api/auth/google/callback",
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: GoogleProfile,
        done: VerifyCallback
      ) => {
        try {
          console.log("[Google Strategy] Processing user:", profile.id);

          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;

          if (!email) {
            console.error("[Google Strategy] No email found in profile");
            return done(new Error("No email found in Google profile"));
          }

          // Check if a user with this email already exists
          const existingUserByEmail = await db.query.users.findFirst({
            where: (users) => eq(users.email, email),
          });

          if (existingUserByEmail) {
            console.log(
              "[Google Strategy] Found existing user by email:",
              existingUserByEmail.id
            );

            // Update the user's Google ID if it's different (account linking)
            if (existingUserByEmail.id !== googleId) {
              await db
                .update(users)
                .set({ id: googleId })
                .where(eq(users.email, email));

              // Fetch updated user
              const updatedUser = await db.query.users.findFirst({
                where: (users) => eq(users.id, googleId),
              });

              if (updatedUser) {
                const sanitizedUser = Object.fromEntries(
                  Object.entries(updatedUser).map(([k, v]) => [
                    k,
                    v === null ? undefined : v,
                  ])
                );
                console.log(
                  "[Google Strategy] Updated user ID, returning:",
                  sanitizedUser.id
                );
                return done(null, sanitizedUser as any);
              }
            }

            // Map all null fields to undefined for compatibility
            const sanitizedUser = Object.fromEntries(
              Object.entries(existingUserByEmail).map(([k, v]) => [
                k,
                v === null ? undefined : v,
              ])
            );
            console.log(
              "[Google Strategy] Returning existing user:",
              sanitizedUser.id
            );
            return done(null, sanitizedUser as any);
          }

          // Create new user
          console.log("[Google Strategy] Creating new user");
          const newUser = {
            id: googleId,
            name: profile.displayName || undefined,
            email,
            image: profile.photos?.[0]?.value || undefined,
            participantId: Snowflake.generate(),
            onboardingStep: "account_setup" as const,
            onboardingCompleted: false,
          };

          await db.insert(users).values(newUser);
          console.log("[Google Strategy] User created successfully");

          // Fetch and return the created user
          const createdUser = await db.query.users.findFirst({
            where: (users) => eq(users.id, googleId),
          });

          if (!createdUser) {
            console.error("[Google Strategy] Failed to fetch created user");
            return done(new Error("Failed to create user"));
          }

          // Map all null fields to undefined for compatibility
          const sanitizedCreatedUser = Object.fromEntries(
            Object.entries(createdUser).map(([k, v]) => [
              k,
              v === null ? undefined : v,
            ])
          );

          console.log(
            "[Google Strategy] Returning new user:",
            sanitizedCreatedUser.id
          );
          return done(null, sanitizedCreatedUser as any);
        } catch (err) {
          console.error("[Google Strategy] Error:", err);
          return done(err as Error);
        }
      }
    )
  );

  // Enhanced serialize user with better error handling
  passport.serializeUser(async (user: any, done) => {
    try {
      console.log("[Passport] Serializing user ID:", user?.id);

      if (!user || !user.id) {
        console.error("[Passport] No user ID found during serialization");
        return done(new Error("No user ID found"));
      }

      // Store only the user ID in the session for security
      done(null, user.id);
    } catch (error) {
      console.error("[Passport] Error in serializeUser:", error);
      done(error);
    }
  });

  // Enhanced deserialize user with better error handling and caching
  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log("[Passport] Deserializing user with ID:", id);

      if (!id) {
        console.log("[Passport] No ID provided for deserialization");
        return done(null, false);
      }

      // Fetch user from database
      const user = await db.query.users.findFirst({
        where: (users) => eq(users.id, id),
      });

      if (!user) {
        console.log("[Passport] User not found in database for ID:", id);
        return done(null, false);
      }

      // Create a clean user object with only necessary fields
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        displayName: user.displayName || undefined,
        image: user.image || undefined,
        emailVerified: user.emailVerified,
        bio: user.bio || undefined,
        location: user.location || undefined,
        onboardingStep: user.onboardingStep,
        onboardingCompleted: user.onboardingCompleted,
        participantId: user.participantId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // Add any other fields you need in your application
      };

      console.log("[Passport] Successfully deserialized user:", {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      });

      done(null, userData as any);
    } catch (error) {
      console.error("[Passport] Error in deserializeUser:", error);
      done(error);
    }
  });

  console.log("[Passport] Configuration complete");
  return passport;
}
