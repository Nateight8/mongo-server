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

// Define a type for the where clause
// type WhereClause = (users: UserTable) => ReturnType<typeof eq>;

export function setupPassport() {
  // Get the base URL from environment or use localhost for development
  const isProduction = process.env.NODE_ENV === 'production';
  const protocol = isProduction ? 'https' : 'http';
  const host = process.env.HOST || 'localhost:4000';
  const defaultCallbackURL = `${protocol}://${host}/api/auth/google/callback`;
  
  // Use AUTH_GOOGLE_CALLBACK_URL from .env or fall back to default
  const callbackURL = process.env.AUTH_GOOGLE_CALLBACK_URL || defaultCallbackURL;

  // Debug log to check environment variables
  console.log("Google OAuth Config:", {
    clientID: process.env.AUTH_GOOGLE_ID ? "Set" : "Not Set",
    clientSecret: process.env.AUTH_GOOGLE_SECRET ? "Set" : "Not Set",
    callbackURL,
    isProduction,
    host,
    NODE_ENV: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('GOOGLE') || key.includes('AUTH_'))
  });

  if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
    console.error('Missing required Google OAuth credentials');
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.AUTH_GOOGLE_ID || "",
        clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
        callbackURL,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: GoogleProfile,
        done: VerifyCallback
      ) => {
        try {
          // Find user by Google profile id
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;
          if (!email)
            return done(new Error("No email found in Google profile"));

          // Check if a user with this email already exists
          const existingUserByEmail = await db.query.users.findFirst({
            where: (users) => eq(users.email, email),
          });
          if (existingUserByEmail) {
            // Map all null fields to undefined for compatibility
            const sanitizedUser = Object.fromEntries(
              Object.entries(existingUserByEmail).map(([k, v]) => [
                k,
                v === null ? undefined : v,
              ])
            );
            return done(null, sanitizedUser as any);
          }

          // Otherwise, create new user
          const newUser = {
            id: googleId,
            name: profile.displayName || undefined,
            email,
            image: profile.photos?.[0]?.value || undefined,
            participantId: Snowflake.generate(),
            onboardingStep: "account_setup" as const,
            onboardingCompleted: false,
            // Optional fields are left undefined
          };

          await db.insert(users).values(newUser);

          // Fetch and return the created user
          const createdUser = await db.query.users.findFirst({
            where: (users) => eq(users.id, googleId),
          });

          // Map all null fields to undefined for compatibility
          const sanitizedCreatedUser = createdUser
            ? Object.fromEntries(
                Object.entries(createdUser).map(([k, v]) => [
                  k,
                  v === null ? undefined : v,
                ])
              )
            : undefined;

          return done(null, sanitizedCreatedUser as any);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );

  passport.serializeUser(async (user: any, done) => {
    try {
      console.log("Serializing user:", user);
      // Only store the user ID in the session
      done(null, user.id);
    } catch (error) {
      console.error("Error in serializeUser:", error);
      done(error);
    }
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      console.log("Deserializing user with ID:", id);
      if (!id) {
        return done(null, false);
      }

      const user = await db.query.users.findFirst({
        where: (users) => eq(users.id, id),
      });

      if (!user) {
        return done(null, false);
      }

      // Create a sanitized user object
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        displayName: user.displayName || undefined,
        image: user.image || undefined,
        // Add other fields you want to expose to the client
        emailVerified: user.emailVerified,
        bio: user.bio || undefined,
        location: user.location || undefined,
        onboardingStep: user.onboardingStep,
        onboardingCompleted: user.onboardingCompleted,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      console.log("Deserialized user:", userData);

      // Use type assertion to satisfy the type system
      done(null, userData as any);
    } catch (error) {
      console.error("Error in deserializeUser:", error);
      done(error);
    }
  });

  return passport;
}
