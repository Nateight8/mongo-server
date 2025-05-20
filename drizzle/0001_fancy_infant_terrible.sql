CREATE TABLE IF NOT EXISTS "trading_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"daily_risk_percentage" numeric(5, 2) NOT NULL,
	"max_drawdown_percentage" numeric(5, 2) NOT NULL,
	"risk_per_trade_percentage" numeric(5, 2) NOT NULL,
	"risk_reward_ratio" numeric(5, 2) NOT NULL,
	"trading_sessions" jsonb NOT NULL,
	"timezone" varchar(50) NOT NULL,
	"intent" jsonb NOT NULL,
	"biggest_challenge" jsonb NOT NULL,
	"account_name" varchar(100) NOT NULL,
	"broker" varchar(100) NOT NULL,
	"prop_firm" varchar(100),
	"account_size" numeric(12, 2) NOT NULL,
	"currency" varchar(10) NOT NULL,
	"experience_level" varchar(20) NOT NULL,
	"trading_style" varchar(20) NOT NULL,
	"trading_plan" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trading_configurations" ADD CONSTRAINT "trading_configurations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
