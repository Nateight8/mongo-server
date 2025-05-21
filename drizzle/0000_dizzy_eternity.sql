CREATE TYPE "public"."account_currency" AS ENUM('USD', 'EUR', 'GBP');--> statement-breakpoint
CREATE TYPE "public"."biggest_challenge" AS ENUM('riskManagement', 'consistency', 'psychology', 'patience');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."goal" AS ENUM('prop', 'improve', 'discipline', 'analytics');--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "trading_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" bigint NOT NULL,
	"user_id" text NOT NULL,
	"goal" "goal" NOT NULL,
	"is_prop" boolean DEFAULT false NOT NULL,
	"prop_firm" text,
	"broker" text,
	"account_size" integer NOT NULL,
	"account_currency" "account_currency" NOT NULL,
	"account_name" text NOT NULL,
	"experience_level" "experience_level",
	"biggest_challenge" "biggest_challenge"[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trading_accounts_account_id_unique" UNIQUE("account_id")
);
--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD CONSTRAINT "trading_accounts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;