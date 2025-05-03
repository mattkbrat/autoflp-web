-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `charge` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`amount` text NOT NULL,
	`date_effective` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `key` (
	`id` text PRIMARY KEY NOT NULL,
	`k` text NOT NULL,
	`v` text NOT NULL,
	`business` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `deal` (
	`id` text PRIMARY KEY NOT NULL,
	`state` integer DEFAULT 1 NOT NULL,
	`date` text NOT NULL,
	`account` text NOT NULL,
	`inventory` text NOT NULL,
	`creditor` text,
	`cash` text NOT NULL,
	`down` text DEFAULT '0' NOT NULL,
	`down_owed` text DEFAULT '0' NOT NULL,
	`apr` text NOT NULL,
	`finance` text,
	`lien` text,
	`pmt` text,
	`term` text NOT NULL,
	`tax_city` text,
	`tax_state` text,
	`tax_county` text,
	`tax_rtd` text,
	`cosigner` text,
	FOREIGN KEY (`creditor`) REFERENCES `creditor`(`id`) ON UPDATE set null ON DELETE cascade,
	FOREIGN KEY (`inventory`) REFERENCES `inventory`(`vin`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`account`) REFERENCES `account`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `deal_charge` (
	`deal` text NOT NULL,
	`charge` text NOT NULL,
	`date` text,
	`note` text,
	`id` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (`charge`) REFERENCES `charge`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`deal`) REFERENCES `deal`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `deal_trade` (
	`id` text PRIMARY KEY NOT NULL,
	`deal` text NOT NULL,
	`vin` text NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`vin`) REFERENCES `inventory`(`vin`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`deal`) REFERENCES `deal`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `default_charge` (
	`id` text PRIMARY KEY NOT NULL,
	`creditor` text NOT NULL,
	`charge` text NOT NULL,
	FOREIGN KEY (`charge`) REFERENCES `charge`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`creditor`) REFERENCES `creditor`(`business_name`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `payment` (
	`id` text PRIMARY KEY NOT NULL,
	`deal` text NOT NULL,
	`date` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`amount` text NOT NULL,
	FOREIGN KEY (`deal`) REFERENCES `deal`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `salesman` (
	`id` text PRIMARY KEY NOT NULL,
	`person` text NOT NULL,
	`state` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`person`) REFERENCES `person`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `inventory_salesman` (
	`id` text PRIMARY KEY NOT NULL,
	`vin` text NOT NULL,
	`salesman` text NOT NULL,
	FOREIGN KEY (`salesman`) REFERENCES `salesman`(`person`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`vin`) REFERENCES `inventory`(`vin`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`vin` text NOT NULL,
	`year` text NOT NULL,
	`make` text NOT NULL,
	`model` text,
	`body` text,
	`color` text,
	`fuel` text,
	`cwt` text,
	`mileage` text,
	`date_added` text DEFAULT 'sql`(CURRENT_TIMESTAMP)`',
	`date_modified` text DEFAULT 'sql`(CURRENT_TIMESTAMP)`',
	`date_purchased` text DEFAULT 'sql`(CURRENT_TIMESTAMP)`',
	`picture` text,
	`cash` text,
	`credit` text,
	`down` text,
	`purchase_price` text,
	`state` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `person` (
	`id` text PRIMARY KEY NOT NULL,
	`name_prefix` text,
	`first_name` text NOT NULL,
	`middle_initial` text,
	`last_name` text NOT NULL,
	`name_suffix` text,
	`address_1` text NOT NULL,
	`address_2` text,
	`address_3` text,
	`city` text DEFAULT 'Fort Morgan' NOT NULL,
	`state_province` text DEFAULT 'CO' NOT NULL,
	`zip_postal` text DEFAULT '80701' NOT NULL,
	`zip_4` text,
	`country` text DEFAULT 'US' NOT NULL,
	`phone_primary` text NOT NULL,
	`phone_secondary` text,
	`phone_tertiary` text,
	`email_primary` text,
	`email_secondary` text
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`contact` text NOT NULL,
	`date_of_birth` text,
	`license_number` text NOT NULL,
	`license_expiration` text,
	`date_added` text DEFAULT 'sql`(CURRENT_TIMESTAMP)`',
	`date_modified` text DEFAULT 'sql`(CURRENT_TIMESTAMP)`',
	`current_standing` text,
	`notes` text,
	FOREIGN KEY (`contact`) REFERENCES `person`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `creditor` (
	`id` text PRIMARY KEY NOT NULL,
	`business_name` text NOT NULL,
	`contact` text NOT NULL,
	`filing_fees` text NOT NULL,
	`date_added` text DEFAULT 'sql`(CURRENT_TIMESTAMP)`',
	`date_modified` text DEFAULT 'sql`(CURRENT_TIMESTAMP)`',
	`apr` text DEFAULT '10' NOT NULL,
	FOREIGN KEY (`contact`) REFERENCES `person`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_business_contact` ON `creditor` (`business_name`,`contact`);--> statement-breakpoint
CREATE TABLE `_auth_session` (
	`session_token` text(255) PRIMARY KEY NOT NULL,
	`user_id` text(255) NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `_auth_user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `_auth_session` (`user_id`);--> statement-breakpoint
CREATE TABLE `_auth_user` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`name` text(255),
	`email` text(255) NOT NULL,
	`email_verified` integer DEFAULT (unixepoch()),
	`image` text(255)
);
--> statement-breakpoint
CREATE TABLE `_auth_verification_token` (
	`identifier` text(255) NOT NULL,
	`token` text(255) NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);

*/