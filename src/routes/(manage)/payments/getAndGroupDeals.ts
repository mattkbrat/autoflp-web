import { getAccountsWithDeals } from "$lib/server/database/deal";
import type { DealShortDetails } from "$lib/server/database/deal";

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
