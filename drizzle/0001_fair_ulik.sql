CREATE TABLE "trading_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"trading_style" text NOT NULL,
	"trading_sessions" text[] NOT NULL,
	"time_zone" text NOT NULL,
	"risk_reward_ratio" integer NOT NULL,
	"note" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trading_plans" ADD CONSTRAINT "trading_plans_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;