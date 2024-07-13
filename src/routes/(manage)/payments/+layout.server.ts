import { getAndGroupDeals } from "$lib/server/database/deal";
import { getDeals } from "$lib/server/database/deal/getDeals";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ url }) => {
	const deals = await getAndGroupDeals();
	console.log(Object.entries(deals)[0]);
	return {
		deals,
	};
};
