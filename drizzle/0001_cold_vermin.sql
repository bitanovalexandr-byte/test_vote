ALTER TABLE "voters" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "voters" CASCADE;--> statement-breakpoint
DROP INDEX "rate_limit_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "rate_limit_idx" ON "rate_limits" USING btree ("identifier");--> statement-breakpoint
ALTER TABLE "rate_limits" DROP COLUMN "poll_id";