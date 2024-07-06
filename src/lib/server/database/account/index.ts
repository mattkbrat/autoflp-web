import type { Prisma } from "@prisma/client";
import {
	getAccount,
	getAccounts,
	getDetailedAccount,
	upsertAccount,
} from "./accounts";
import { getCreditors, getCreditor } from "./creditors";
import { getSalesmen } from "./salesmen";
import { upsertPerson, getPerson, getPeople } from "./person";

export const orderContactsBy: Prisma.CreditorOrderByWithRelationInput[] = [
	{
		contact: {
			lastName: "asc",
		},
	},
	{
		contact: {
			firstName: "asc",
		},
	},
];

export const contactSelect = {
	select: {
		id: true,
		lastName: true,
		firstName: true,
	},
};

export {
	getCreditors,
	getCreditor,
	getSalesmen,
	getAccounts,
	getAccount,
	getDetailedAccount,
	upsertPerson,
	upsertAccount,
	getPeople,
	getPerson,
};

export type Accounts = Prisma.PromiseReturnType<typeof getAccounts>;
export type DetailedAccount = NonNullable<
	Prisma.PromiseReturnType<typeof getDetailedAccount>
>;
export type Salesmen = Prisma.PromiseReturnType<typeof getSalesmen>;
export type Creditors = Prisma.PromiseReturnType<typeof getCreditors>;
export type People = Prisma.PromiseReturnType<typeof getPeople>;
