CREATE TABLE `identities` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text(256),
	`password` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `identities_email_unique` ON `identities` (`email`);