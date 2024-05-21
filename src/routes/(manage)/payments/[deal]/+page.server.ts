import { getPaymentsByDeal } from "$lib/server/database/payment";
import { serialize } from "@mikro-orm/core";
export const load = async ({ params }) => {
	const payments = await getPaymentsByDeal(params.deal);

	return {
		payments: serialize(payments),
	};
};
