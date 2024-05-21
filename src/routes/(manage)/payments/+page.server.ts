import {
	getAccountDeals,
	getAccountsWithDeals,
	getDealIds,
} from "$lib/server/database/deal";
import { serialize } from "@mikro-orm/core";
type DealShortDetails = {
	lastName: string;
	firstName: string;
	deal: string;
	account: string;
};

export const load = async ({ locals, url }) => {
	const selected = url.searchParams.get("id");

	if (selected) {
		console.log(selected);
	}

	const deals = await getAccountsWithDeals().then((deals) => {
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

	const accountDeals =
		selected &&
		(await getAccountDeals(selected).then((deals) =>
			deals.map((deal, n) => {
				console.log(deal, n);
				const { inventory, date, id } = deal;
				return {
					...inventory,
					date,
					id,
				};
			}),
		));
	console.log("deals", accountDeals);

	return {
		deals,
		accountDeals: accountDeals || null,
	};
};
