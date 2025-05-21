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
ALTER TABLE "user" DROP CONSTRAINT "user_username_unique";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "phoneVerified" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "participant_id" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboardingCompleted" boolean;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "goals" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "experience_level" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "biggest_challenge" text[];--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "onboarding_step" text DEFAULT 'account_setup' NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verificationNumberSessions" ADD CONSTRAINT "verificationNumberSessions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_accounts" DROP COLUMN "max_daily_drawdown";--> statement-breakpoint
ALTER TABLE "trading_accounts" DROP COLUMN "max_total_drawdown";--> statement-breakpoint
ALTER TABLE "trading_accounts" DROP COLUMN "current_balance";--> statement-breakpoint
ALTER TABLE "trading_accounts" DROP COLUMN "pnl";--> statement-breakpoint
ALTER TABLE "trading_accounts" DROP COLUMN "roi";--> statement-breakpoint
ALTER TABLE "trading_accounts" DROP COLUMN "winrate";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "onboarding_completed";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_provider_account_id_unique" UNIQUE("provider_account_id");