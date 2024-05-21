import { orm } from ".";
import { Account } from "./models/Account";
import { Deal } from "./models/Deal";

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
			],
			orderBy: {
				state: "desc",
				date: "desc",
			},
		},
	);

	console.log(deals);

	return deals;
};
