ALTER TABLE "user" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phoneVerified" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banner" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "avatar" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "participant_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "provider_account_id" text;--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD COLUMN "max_daily_drawdown" integer;--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD COLUMN "max_total_drawdown" integer;--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD COLUMN "current_balance" integer;--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD COLUMN "pnl" integer;--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD COLUMN "roi" integer;--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD COLUMN "winrate" integer;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");