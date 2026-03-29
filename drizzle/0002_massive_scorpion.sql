CREATE TABLE "poll_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"poll_id" integer NOT NULL,
	"votes_yes" integer DEFAULT 0,
	"votes_no" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "votes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "votes" CASCADE;--> statement-breakpoint
DROP INDEX "rate_limit_idx";--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "is_active" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "polls" ADD COLUMN "scheduled_for" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "rate_limits" ADD COLUMN "poll_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "poll_results" ADD CONSTRAINT "poll_results_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "rate_limit_idx" ON "rate_limits" USING btree ("identifier","poll_id");--> statement-breakpoint
ALTER TABLE "polls" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "polls" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "polls" DROP COLUMN "ends_at";