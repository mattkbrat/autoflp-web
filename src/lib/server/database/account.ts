import type { AsyncReturnType } from "$lib/types";
import { serialize } from "@mikro-orm/core";
import { orm } from ".";
import { Account } from "./models/Account";

export const getAccounts = async () => {
	return orm.em.find(
		Account,
		{},
		{
			limit: 5,
			populate: ["contact"],
			fields: [
				"id",
				"contact.id",
				"contact.lastName",
				"contact.firstName",
				"licenseNumber",
			],
			orderBy: {
				contact: {
					lastName: "desc",
					firstName: "desc",
				},
			},
		},
	);
};

export const serializeAccounts = async () => {
	return getAccounts().then((accounts) => {
		return accounts.map((ac) => {
			return {
				contact: ac.contact.id,
				id: ac.id,
				license: ac.licenseNumber,
				firstName: ac.contact.firstName,
				lastName: ac.contact.lastName,
			};
		});
	});
};

export type Accounts = AsyncReturnType<typeof serializeAccounts>;
