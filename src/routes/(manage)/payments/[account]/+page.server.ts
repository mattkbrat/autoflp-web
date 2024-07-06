import { getDeals, getPayments } from "$lib/server/database/deal";
export const load = async ({ params }) => {
	const deals = (params.account && (await getDeals(params.account))) || [];
	console.log(params.account, params, deals);

	return {
		deals,
	};
};
