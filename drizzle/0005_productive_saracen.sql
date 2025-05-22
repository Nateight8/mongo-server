ALTER TABLE "trading_accounts" ALTER COLUMN "account_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD COLUMN "funded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD COLUMN "funded_at" timestamp;