CREATE TABLE "shared_trading_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_plan_id" uuid NOT NULL,
	"shared_by_user_id" text NOT NULL,
	"visibility" text NOT NULL,
	"viewed" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trading_plans" ADD COLUMN "is_owner" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "shared_trading_plans" ADD CONSTRAINT "shared_trading_plans_original_plan_id_trading_plans_id_fk" FOREIGN KEY ("original_plan_id") REFERENCES "public"."trading_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_trading_plans" ADD CONSTRAINT "shared_trading_plans_shared_by_user_id_user_id_fk" FOREIGN KEY ("shared_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;