import type { AsyncReturnType } from "$lib/types";
import { orm } from ".";
import { Account } from "./models/Account";
import { Deal } from "./models/Deal";

export type DealShortDetails = {
	lastName: string;
	firstName: string;
	deal: string;
	account: string;
	pmt: string;
};

export const getDealIds = async () => {
	return orm.em.findAll(Deal, {
		fields: ["id"],
	});
};

export const getAccountsWithDeals = async () => {
	return orm.em.find(
		Deal,
		{
			state: 1,
		},
		{
			populate: ["account", "account.contact"],
			fields: ["id", "account.contact.lastName", "account.contact.firstName"],
			orderBy: {
				account: {
					contact: {
						lastName: "desc",
					},
				},
			},
		},
	);
};

export type AccountsWithDeals = AsyncReturnType<typeof getAccountsWithDeals>;

export const getAccountDeals = async (account: string) => {
	const deals = orm.em.find(
		Deal,
		{
			account: {
				id: account,
			},
		},
		{
			populate: ["inventory.vin"],
			fields: [
				"date",
				"id",
				"inventory.make",
				"inventory.model",
				"inventory.year",
				"pmt",
			],
			orderBy: {
				state: "desc",
				date: "desc",
			},
		},
	);

	return deals;
};

export const getAndGroupDeals = async () => {
	return getAccountsWithDeals().then((deals) => {
		return deals.reduce(
			(acc, curr) => {
				const key = `${curr.account.contact.lastName} ${curr.account.contact.firstName}`;

				if (key in acc) {
					return acc;
				}

				const theseValues = {
					...curr.account.contact,
					account: curr.account.id,
					deal: curr.id,
				};

				if (!acc[key]) {
					acc[key] = theseValues;
				} else {
					console.warn("duplicate found", curr);
				}

				return acc;
			},
			{} as { [key: string]: DealShortDetails },
		);
	});
};

export const getAndGroupSelected = async (selected: string) => {
	return getAccountDeals(selected).then((deals) =>
		deals.map((deal, n) => {
			const { inventory, date, id, pmt } = deal;
			return {
				...inventory,
				date,
				id,
				pmt,
			};
		}),
	);
};

export type GroupedDeals = AsyncReturnType<typeof getAndGroupDeals>;
export type GroupedAccountDeals = AsyncReturnType<typeof getAndGroupSelected>;
