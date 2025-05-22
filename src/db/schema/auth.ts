import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  uniqueIndex,
  boolean,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
// import type { AdapterAccount } from "@auth/core/adapters";

export const onboardingSteps = [
  "account_setup",
  "trading_style",
  "safety_net",
  "complete",
] as const;
export type OnboardingStep = (typeof onboardingSteps)[number];

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  displayName: text("display_name"),
  bio: text("bio"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  location: text("location"),
  address: text("address"),
  phoneVerified: boolean("phoneVerified"),
  onboardingCompleted: boolean("onboarding_completed"),
  banner: text("banner"),
  username: text("username"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  participantId: varchar("participant_id", { length: 64 }),
  providerAccountId: text("provider_account_id").unique(),

  goals: text("goals", {
    enum: ["prop", "improve", "discipline", "analytics"],
  }), // Made optional by removing .notNull()

  experienceLevel: text("experience_level", {
    enum: ["beginner", "intermediate", "advanced"],
  }),

  biggestChallenge: text("biggest_challenge").array(), // still an array for multiple challenges

  onboardingStep: text("onboarding_step", {
    enum: onboardingSteps,
  })
    .default("account_setup")
    .notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationNumberSessions = pgTable(
  "verificationNumberSessions",
  {
    verificationNumber: text("verificationNumber").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.createdAt] }),
    };
  }
);

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compoundKey: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);

// export type User = typeof users.$inferSelect;
