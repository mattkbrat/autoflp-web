import { db } from "$lib/server/database/index.js";
import { getPaymentsByDeal } from "$lib/server/database/payment.js";

export const load = ({ params }) => {
	return {
		payments: getPaymentsByDeal(params.deal),
	};
};
