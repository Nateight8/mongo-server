CREATE TYPE "public"."account_currency" AS ENUM('USD', 'EUR', 'GBP');--> statement-breakpoint
CREATE TYPE "public"."biggest_challenge" AS ENUM('riskManagement', 'consistency', 'psychology', 'patience');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."goal" AS ENUM('prop', 'improve', 'discipline', 'analytics');--> statement-breakpoint
CREATE TABLE "trading_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"user_id" text NOT NULL,
	"goal" "goal" NOT NULL,
	"is_prop" boolean DEFAULT false NOT NULL,
	"funded" boolean DEFAULT false NOT NULL,
	"funded_at" timestamp,
	"prop_firm" text,
	"broker" text,
	"account_size" integer NOT NULL,
	"account_currency" "account_currency" NOT NULL,
	"account_name" text NOT NULL,
	"experience_level" "experience_level",
	"biggest_challenge" "biggest_challenge"[],
	"safety_net_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trading_accounts_account_id_unique" UNIQUE("account_id")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_userId_credentialID_pk" PRIMARY KEY("userId","credentialID"),
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"display_name" text,
	"bio" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"location" text,
	"address" text,
	"phoneVerified" boolean,
	"onboarding_completed" boolean,
	"banner" text,
	"username" text,
	"avatar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"participant_id" varchar(64),
	"provider_account_id" text,
	"goals" text,
	"experience_level" text,
	"biggest_challenge" text[],
	"onboarding_step" text DEFAULT 'account_setup' NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_provider_account_id_unique" UNIQUE("provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "verificationNumberSessions" (
	"verificationNumber" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "verificationNumberSessions_userId_createdAt_pk" PRIMARY KEY("userId","createdAt")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "safety_nets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"max_daily_risk" integer NOT NULL,
	"max_daily_drawdown" integer NOT NULL,
	"max_total_drawdown" integer NOT NULL,
	"risk_per_trade" integer NOT NULL,
	"max_open_trades" integer NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD CONSTRAINT "trading_accounts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_accounts" ADD CONSTRAINT "trading_accounts_safety_net_id_safety_nets_id_fk" FOREIGN KEY ("safety_net_id") REFERENCES "public"."safety_nets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verificationNumberSessions" ADD CONSTRAINT "verificationNumberSessions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_nets" ADD CONSTRAINT "safety_nets_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;