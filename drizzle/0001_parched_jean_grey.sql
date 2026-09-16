CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int,
	`action` varchar(120) NOT NULL,
	`resourceType` varchar(80) NOT NULL,
	`resourceId` varchar(120),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balance` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `credit_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `credit_accounts_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `credit_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`entryType` varchar(50) NOT NULL,
	`amount` int NOT NULL,
	`idempotencyKey` varchar(190) NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `credit_ledger_id` PRIMARY KEY(`id`),
	CONSTRAINT `credit_ledger_idempotencyKey_unique` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `file_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fileId` int NOT NULL,
	`version` int NOT NULL,
	`objectId` int NOT NULL,
	`changeSummary` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `file_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`parentPath` varchar(1024) NOT NULL DEFAULT '/',
	`name` varchar(255) NOT NULL,
	`objectId` int NOT NULL,
	`currentVersion` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`operationType` varchar(80) NOT NULL,
	`status` enum('queued','running','waiting','completed','failed','cancelled','expired') NOT NULL DEFAULT 'queued',
	`progress` int NOT NULL DEFAULT 0,
	`creditCost` int,
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `models` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`modelType` varchar(80) NOT NULL,
	`capabilities` json NOT NULL,
	`contextWindow` int,
	`inputPrice` decimal(12,6),
	`outputPrice` decimal(12,6),
	`enabled` boolean NOT NULL DEFAULT false,
	`priority` int NOT NULL DEFAULT 100,
	`publicAccess` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `models_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(180) NOT NULL,
	`description` text,
	`instructions` text,
	`status` enum('active','archived','deleted') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `providers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`kind` varchar(80) NOT NULL,
	`enabled` boolean NOT NULL DEFAULT false,
	`configuration` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `providers_id` PRIMARY KEY(`id`),
	CONSTRAINT `providers_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `storage_objects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentHash` varchar(128) NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`sizeBytes` int NOT NULL,
	`mimeType` varchar(160) NOT NULL,
	`ownerId` int NOT NULL,
	`projectId` int NOT NULL,
	`retentionState` enum('active','pending_delete','deleted') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `storage_objects_id` PRIMARY KEY(`id`),
	CONSTRAINT `storage_objects_contentHash_unique` UNIQUE(`contentHash`)
);
--> statement-breakpoint
CREATE TABLE `usage_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobId` int,
	`provider` varchar(120) NOT NULL,
	`model` varchar(160) NOT NULL,
	`inputTokens` int NOT NULL DEFAULT 0,
	`outputTokens` int NOT NULL DEFAULT 0,
	`providerCost` decimal(12,6),
	`platformCredits` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usage_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','worker','developer','admin') NOT NULL DEFAULT 'user';