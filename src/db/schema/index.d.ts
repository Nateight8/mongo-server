// Type definitions for schema exports
import type { PgTableWithColumns } from "drizzle-orm/pg-core";
import type { InferModel } from "drizzle-orm";

declare module "./auth.js" {
  import { PgTableWithColumns } from "drizzle-orm/pg-core";
  import { InferModel } from "drizzle-orm";
  import { sql } from 'drizzle-orm';

  export const users: PgTableWithColumns<{
    id: { name: 'id'; dataType: 'string'; notNull: true };
    name: { name: 'name'; dataType: 'string'; notNull: false };
    displayName: { name: 'display_name'; dataType: 'string'; notNull: false };
    bio: { name: 'bio'; dataType: 'string'; notNull: false };
    email: { name: 'email'; dataType: 'string'; notNull: true };
    emailVerified: { name: 'emailVerified'; dataType: 'Date'; notNull: false };
    image: { name: 'image'; dataType: 'string'; notNull: false };
    location: { name: 'location'; dataType: 'string'; notNull: false };
    address: { name: 'address'; dataType: 'string'; notNull: false };
    phoneVerified: { name: 'phoneVerified'; dataType: 'boolean'; notNull: false };
    onboardingCompleted: { name: 'onboarding_completed'; dataType: 'boolean'; notNull: false };
    banner: { name: 'banner'; dataType: 'string'; notNull: false };
    username: { name: 'username'; dataType: 'string'; notNull: false };
    avatar: { name: 'avatar'; dataType: 'string'; notNull: false };
    createdAt: { name: 'created_at'; dataType: 'Date'; notNull: true };
    updatedAt: { name: 'updated_at'; dataType: 'Date'; notNull: true };
    participantId: { name: 'participant_id'; dataType: 'string'; notNull: false };
    providerAccountId: { name: 'provider_account_id'; dataType: 'string'; notNull: false };
    goals: { name: 'goals'; dataType: 'string'; notNull: false };
    experienceLevel: { name: 'experience_level'; dataType: 'string'; notNull: false };
    biggestChallenge: { name: 'biggest_challenge'; dataType: 'string[]'; notNull: false };
    onboardingStep: { name: 'onboarding_step'; dataType: 'string'; notNull: true };
  }>;

  export type User = InferModel<typeof users>;
  export type NewUser = InferModel<typeof users, 'insert'>;
}

declare module "./account.js" {
  // Export any account-related types if needed
  export const accounts: any;
  export type Account = any;
  export type NewAccount = any;
}
