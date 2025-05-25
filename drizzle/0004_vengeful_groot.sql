ALTER TABLE "trading_plans" ALTER COLUMN "note" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "trading_plans" ALTER COLUMN "note" DROP DEFAULT;