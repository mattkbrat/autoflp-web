import { getDeals } from "$lib/server/database/deal/getDeals";
import { getPayments } from "$lib/server/database/deal/getPayments";
export const load = async ({ params }) => {
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
