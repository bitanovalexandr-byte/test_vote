CREATE TABLE `voters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fingerprint` text NOT NULL,
	`choice` text NOT NULL,
	`voted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `voters_fingerprint_unique` ON `voters` (`fingerprint`);--> statement-breakpoint
CREATE TABLE `votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`choice` text NOT NULL,
	`created_at` integer
);
