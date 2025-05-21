ALTER TABLE "trading_accounts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "trading_accounts" CASCADE;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "goals" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_completed" boolean;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "onboardingCompleted";--> statement-breakpoint
DROP TYPE "public"."account_currency";--> statement-breakpoint
DROP TYPE "public"."biggest_challenge";--> statement-breakpoint
DROP TYPE "public"."experience_level";--> statement-breakpoint
DROP TYPE "public"."goal";