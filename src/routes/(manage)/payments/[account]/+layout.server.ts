import { getDeals } from "$lib/server/database/deal/getDeals";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ params }) => {
	if (!params.account) {
		return { accountDeals: [] };
	}
	const deals = await getDeals(params.account);
	if (deals.length === 0) {
		return { accountDeals: [] };
	}

	return {
		accountDeals: deals,
	};
};
