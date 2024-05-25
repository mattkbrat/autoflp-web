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

export const getDetailedAccount = async (id: string) => {
	return orm.em.find(
		Account,
		{ id },
		{
			populate: ["contact"],
		},
	);
};

export const serializeDetailedAccount = (
	account: AsyncReturnType<typeof getDetailedAccount>[number],
) => {
	const { contact, dateOfBirth, licenseExpiration, ...acc } = account || {};

	return {
		...acc,
		...contact,
		account: acc?.id,
		contact: account?.contact?.id,
		licenseExpiration: new Date(licenseExpiration || new Date()),
		dateOfBirth: new Date(dateOfBirth || new Date()),
	};
};

export type AccountField = Extract<
	keyof ReturnType<typeof serializeDetailedAccount>,
	string
>;
