import { getDeals, groupDeals } from "$lib/server/database/deal/getDeals";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ url }) => {
	const deals = await getDeals();
	return {
		deals,
		grouped: groupDeals(deals),
	};
};
