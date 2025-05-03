import { sql } from "drizzle-orm";
import {
	AnySQLiteColumn,
	foreignKey,
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const charge = sqliteTable("charge", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	amount: text().notNull(),
	dateEffective: text("date_effective").notNull(),
});

export const key = sqliteTable("key", {
	id: text().primaryKey().notNull(),
	k: text().notNull(),
	v: text().notNull(),
	business: text().notNull(),
});

export const deal = sqliteTable("deal", {
	id: text().primaryKey().notNull(),
	state: integer().default(1).notNull(),
	date: text().notNull(),
	account: text()
		.notNull()
		.references(() => account.id, { onDelete: "cascade", onUpdate: "cascade" }),
	inventory: text()
		.notNull()
		.references(() => inventory.vin, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	creditor: text().references(() => creditor.id, {
		onDelete: "cascade",
		onUpdate: "set null",
	}),
	cash: text().notNull(),
	down: text().default("0").notNull(),
	downOwed: text("down_owed").default("0").notNull(),
	apr: text().notNull(),
	finance: text(),
	lien: text(),
	pmt: text(),
	term: text().notNull(),
	taxCity: text("tax_city"),
	taxState: text("tax_state"),
	taxCounty: text("tax_county"),
	taxRtd: text("tax_rtd"),
	cosigner: text(),
});

export const dealCharge = sqliteTable("deal_charge", {
	deal: text()
		.notNull()
		.references(() => deal.id, { onDelete: "cascade", onUpdate: "cascade" }),
	charge: text()
		.notNull()
		.references(() => charge.id, { onDelete: "cascade", onUpdate: "cascade" }),
	date: text(),
	note: text(),
	id: text().primaryKey().notNull(),
});

export const dealTrade = sqliteTable("deal_trade", {
	id: text().primaryKey().notNull(),
	deal: text()
		.notNull()
		.references(() => deal.id, { onDelete: "cascade", onUpdate: "cascade" }),
	vin: text()
		.notNull()
		.references(() => inventory.vin, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	value: text().notNull(),
});

export const defaultCharge = sqliteTable("default_charge", {
	id: text().primaryKey().notNull(),
	creditor: text()
		.notNull()
		.references(() => creditor.businessName, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	charge: text()
		.notNull()
		.references(() => charge.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const salesman = sqliteTable("salesman", {
	id: text().primaryKey().notNull(),
	person: text()
		.notNull()
		.references(() => person.id),
	state: integer().default(1).notNull(),
});

export const inventorySalesman = sqliteTable("inventory_salesman", {
	id: text().primaryKey().notNull(),
	vin: text()
		.notNull()
		.references(() => inventory.vin, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	salesman: text()
		.notNull()
		.references(() => salesman.person, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
});

export const inventory = sqliteTable("inventory", {
	id: text().primaryKey().notNull(),
	vin: text().notNull(),
	year: text().notNull(),
	make: text().notNull(),
	model: text(),
	body: text(),
	color: text(),
	fuel: text(),
	cwt: text(),
	mileage: text(),
	dateAdded: text("date_added").default("sql`(CURRENT_TIMESTAMP)`"),
	dateModified: text("date_modified").default("sql`(CURRENT_TIMESTAMP)`"),
	datePurchased: text("date_purchased").default("sql`(CURRENT_TIMESTAMP)`"),
	picture: text(),
	cash: text(),
	credit: text(),
	down: text(),
	purchasePrice: text("purchase_price"),
	state: integer().default(1).notNull(),
});

export const person = sqliteTable("person", {
	id: text().primaryKey().notNull(),
	namePrefix: text("name_prefix"),
	firstName: text("first_name").notNull(),
	middleInitial: text("middle_initial"),
	lastName: text("last_name").notNull(),
	nameSuffix: text("name_suffix"),
	address1: text("address_1").notNull(),
	address2: text("address_2"),
	address3: text("address_3"),
	city: text().default("Fort Morgan").notNull(),
	stateProvince: text("state_province").default("CO").notNull(),
	zipPostal: text("zip_postal").default("80701").notNull(),
	zip4: text("zip_4"),
	country: text().default("US").notNull(),
	phonePrimary: text("phone_primary").notNull(),
	phoneSecondary: text("phone_secondary"),
	phoneTertiary: text("phone_tertiary"),
	emailPrimary: text("email_primary"),
	emailSecondary: text("email_secondary"),
});

export const account = sqliteTable("account", {
	id: text().primaryKey().notNull(),
	contact: text()
		.notNull()
		.references(() => person.id, { onDelete: "cascade", onUpdate: "cascade" }),
	dateOfBirth: text("date_of_birth"),
	licenseNumber: text("license_number").notNull(),
	licenseExpiration: text("license_expiration"),
	dateAdded: text("date_added").default("sql`(CURRENT_TIMESTAMP)`"),
	dateModified: text("date_modified").default("sql`(CURRENT_TIMESTAMP)`"),
	currentStanding: text("current_standing"),
	notes: text(),
});

export const creditor = sqliteTable(
	"creditor",
	{
		id: text().primaryKey().notNull(),
		businessName: text("business_name").notNull(),
		contact: text()
			.notNull()
			.references(() => person.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		filingFees: text("filing_fees").notNull(),
		dateAdded: text("date_added").default("sql`(CURRENT_TIMESTAMP)`"),
		dateModified: text("date_modified").default("sql`(CURRENT_TIMESTAMP)`"),
		apr: text().default("10").notNull(),
	},
	(table) => [
		uniqueIndex("unique_business_contact").on(
			table.businessName,
			table.contact,
		),
	],
);

export const authSession = sqliteTable(
	"_auth_session",
	{
		sessionToken: text("session_token", { length: 255 }).primaryKey().notNull(),
		userId: text("user_id", { length: 255 })
			.notNull()
			.references(() => authUser.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		expires: integer().notNull(),
	},
	(table) => [index("session_user_id_idx").on(table.userId)],
);

export const authUser = sqliteTable("_auth_user", {
	id: text({ length: 255 }).primaryKey().notNull(),
	name: text({ length: 255 }),
	email: text({ length: 255 }).notNull(),
	emailVerified: integer("email_verified").default(sql`(unixepoch())`),
	image: text({ length: 255 }),
});

export const authVerificationToken = sqliteTable(
	"_auth_verification_token",
	{
		identifier: text({ length: 255 }).notNull(),
		token: text({ length: 255 }).notNull(),
		expires: integer().notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.identifier, table.token],
			name: "_auth_verification_token_identifier_token_pk",
		}),
	],
);

export const authAccount = sqliteTable(
	"_auth_account",
	{
		userId: text("user_id", { length: 255 })
			.notNull()
			.references(() => authUser.id),
		type: text({ length: 255 }).notNull(),
		provider: text({ length: 255 }).notNull(),
		providerAccountId: text("provider_account_id", { length: 255 }).notNull(),
		refreshToken: text("refresh_token"),
		accessToken: text("access_token"),
		expiresAt: integer("expires_at"),
		tokenType: text("token_type", { length: 255 }),
		scope: text({ length: 255 }),
		idToken: text("id_token"),
		sessionState: text("session_state", { length: 255 }),
	},
	(table) => [
		index("account_user_id_idx").on(table.userId),
		primaryKey({
			columns: [table.provider, table.providerAccountId],
			name: "_auth_account_provider_provider_account_id_pk",
		}),
	],
);

export const payment = sqliteTable("payment", {
	id: text().primaryKey().notNull(),
	deal: text()
		.notNull()
		.references(() => deal.id, { onDelete: "cascade", onUpdate: "cascade" }),
	date: text().default("sql(CURRENT_TIMESTAMP)").notNull(),
	amount: text().notNull(),
});
