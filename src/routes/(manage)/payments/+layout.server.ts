import { getAndGroupDeals } from "$lib/server/database/deal";
import { getDeals, groupDeals } from "$lib/server/database/deal/getDeals";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ url }) => {
	const deals = await getDeals();
	console.log(Object.entries(deals)[0]);
	return {
		deals,
		grouped: groupDeals(deals),
	};
};
