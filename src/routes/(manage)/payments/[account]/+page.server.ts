import { getDeals } from "$lib/server/database/deal/getDeals";
import { getPayments } from "$lib/server/database/deal/getPayments";
export const load = async ({ params }) => {
	const deals = (params.account && (await getDeals(params.account))) || [];
	console.log(params.account, params, deals);

	return {
		deals,
	};
};
