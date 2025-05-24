CREATE TABLE "journals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"execution_style" varchar(50) NOT NULL,
	"instrument" varchar(20) NOT NULL,
	"side" varchar(10) NOT NULL,
	"size" numeric(10, 2) NOT NULL,
	"planned_entry_price" numeric(10, 5) NOT NULL,
	"planned_stop_loss" numeric(10, 5) NOT NULL,
	"planned_take_profit" numeric(10, 5) NOT NULL,
	"note" jsonb,
	"executed_entry_price" numeric(10, 5),
	"executed_stop_loss" numeric(10, 5),
	"execution_notes" jsonb,
	"exit_price" numeric(10, 5),
	"target_hit" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "journals" ADD CONSTRAINT "journals_account_id_trading_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."trading_accounts"("id") ON DELETE cascade ON UPDATE no action;