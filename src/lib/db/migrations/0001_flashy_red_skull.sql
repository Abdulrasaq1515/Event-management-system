CREATE TABLE `user_profiles` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`email` varchar(255) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`display_name` varchar(200) NOT NULL,
	`profile_picture` varchar(500),
	`role` enum('organizer','admin','user') DEFAULT 'organizer',
	`bio` text,
	`organization` varchar(200),
	`website` varchar(500),
	`social_links` json,
	`preferences` json NOT NULL DEFAULT (JSON_OBJECT('emailNotifications', true, 'theme', 'system', 'timezone', 'UTC', 'language', 'en')),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`last_login_at` timestamp,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `idx_email` ON `user_profiles` (`email`);--> statement-breakpoint
CREATE INDEX `idx_role` ON `user_profiles` (`role`);--> statement-breakpoint
CREATE INDEX `idx_display_name` ON `user_profiles` (`display_name`);