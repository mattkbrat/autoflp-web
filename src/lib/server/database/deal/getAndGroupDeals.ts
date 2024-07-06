import { getDeals } from "$lib/server/database/deal";
import type { Deals } from "$lib/server/database/deal";

export const getAndGroupDeals = async () => {
	return getDeals().then((deals) => {
		return deals.reduce(
			(acc, curr) => {
				const key = `${curr.account.contact.lastName} ${curr.account.contact.firstName}`;

				if (key in acc) {
					return acc;
				}

				const { account, ...thisDeal } = curr;
				if (!acc[key]) {
					acc[key] = [thisDeal];
				} else {
					acc[key].push(thisDeal);
				}

				return acc;
			},
			{} as { [key: string]: Omit<Deals[number], "account">[] },
		);
	});
};
