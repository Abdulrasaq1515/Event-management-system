CREATE TABLE `categories` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`color` varchar(7),
	`icon` varchar(50),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`slug` varchar(200) NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`excerpt` varchar(300),
	`start_datetime` timestamp NOT NULL,
	`end_datetime` timestamp NOT NULL,
	`timezone` varchar(50) NOT NULL,
	`location` json NOT NULL,
	`capacity` int,
	`current_attendees` int DEFAULT 0,
	`status` enum('draft','published','cancelled','completed','archived') DEFAULT 'draft',
	`visibility` enum('public','private','unlisted') DEFAULT 'public',
	`organizer_id` varchar(36) NOT NULL,
	`category_id` varchar(36),
	`price` json,
	`images` json NOT NULL,
	`metadata` json DEFAULT (JSON_OBJECT()),
	`version` int DEFAULT 1,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`published_at` timestamp,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `idx_category_slug` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_category_name` ON `categories` (`name`);--> statement-breakpoint
CREATE INDEX `idx_slug` ON `events` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_status_start` ON `events` (`status`,`start_datetime`);--> statement-breakpoint
CREATE INDEX `idx_organizer_created` ON `events` (`organizer_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_category_status` ON `events` (`category_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_visibility` ON `events` (`visibility`);--> statement-breakpoint
CREATE INDEX `idx_start_datetime` ON `events` (`start_datetime`);--> statement-breakpoint
CREATE INDEX `idx_end_datetime` ON `events` (`end_datetime`);