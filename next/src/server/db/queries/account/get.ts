import { type SQL, asc, eq, getTableColumns, sql } from "drizzle-orm";
import type { AsyncReturnType } from "~/types/utility";
import { db } from "../..";
import { account, person } from "../../schema";

import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export function lower(col: AnySQLiteColumn): SQL {
	return sql`lower(${col})`;
}

export function strftime(col: AnySQLiteColumn, fmt = "%Y-%m-%d"): SQL {
	return sql`strftime(${fmt}, ${col})`;
}
export const accountSelect = createSelectSchema(account);
export type Account = z.infer<typeof accountSelect>;

// @TODO: We should be able to use query here, but the ordeer by does does not exist in properties for person join.
export const getAllAccounts = async () =>
	db
		.select({
			id: account.id,
			licenceNumber: account.licenseNumber,
			person: {
				lastName: person.lastName,
				firstName: person.firstName,
			},
		})
		.from(account)
		.leftJoin(person, eq(person.id, account.contact))
		.orderBy(asc(lower(person.lastName)), asc(lower(person.firstName)));

export const getAccountWithPerson = async (accountId: string) =>
	db
		.select({
			...getTableColumns(account),
			expirationDate: strftime(account.licenseExpiration).as("expirationDate"),
			birthDate: strftime(account.dateOfBirth).as("birthDate"),
			person: person,
		})
		.from(account)
		.leftJoin(person, eq(person.id, account.contact))
		.where(eq(account.id, accountId))
		.limit(1)
		.then(([r]) => r);
export type Accounts = AsyncReturnType<typeof getAllAccounts>;
export type AccountWithPerson = AsyncReturnType<typeof getAccountWithPerson>;
