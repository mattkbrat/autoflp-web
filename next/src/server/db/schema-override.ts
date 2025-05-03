import { sql } from "drizzle-orm";
import { index, integer, primaryKey, text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import type { AdapterAccount } from "next-auth/adapters";

export const authUser = sqliteTable("_auth_user", {
	id: text({ length: 255 }).primaryKey().notNull(),
	name: text({ length: 255 }),
	email: text({ length: 255 }).notNull(),
	emailVerified: integer("email_verified", { mode: "timestamp" }).default(
		sql`(unixepoch())`,
	),
	image: text({ length: 255 }),
});

export const authAccount = sqliteTable(
	"_auth_account",
	(d) => ({
		userId: text("user_id", { length: 255 })
			.notNull()
			.references(() => authUser.id),
		type: d.text({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
		provider: d.text({ length: 255 }).notNull(),
		providerAccountId: text("provider_account_id", { length: 255 }).notNull(),
		refresh_token: d.text(),
		access_token: d.text(),
		expires_at: d.integer(),
		token_type: d.text({ length: 255 }),
		scope: d.text({ length: 255 }),
		id_token: d.text(),
		session_state: d.text({ length: 255 }),
	}),
	(t) => [
		primaryKey({
			columns: [t.provider, t.providerAccountId],
		}),
		index("_auth_account_provider_provider_account_id_pk").on(t.userId),
	],
);

export const authSession = sqliteTable(
	"_auth_session",
	(d) => ({
		sessionToken: text("session_token", { length: 255 }).primaryKey().notNull(),

		userId: text("user_id", { length: 255 })
			.notNull()
			.references(() => authUser.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),

		expires: d.integer({ mode: "timestamp" }).notNull(),
	}),
	(t) => [index("session_userId_idx").on(t.userId)],
);

export const authVerificationToken = sqliteTable(
	"_auth_verification_token",
	{
		identifier: text({ length: 255 }).notNull(),
		token: text({ length: 255 }).notNull(),
		expires: integer({ mode: "timestamp" }).notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.identifier, table.token],
			name: "_auth_verification_token_identifier_token_pk",
		}),
	],
);
