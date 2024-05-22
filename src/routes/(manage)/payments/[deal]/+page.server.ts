import { randomUUID } from "node:crypto";
import { Deal } from "$lib/server/database/models/Deal";
import { Payment } from "$lib/server/database/models/Payment";
import {
	deletePayment,
	getPaymentsByDeal,
	recordPayment,
} from "$lib/server/database/payment";
import { serialize, wrap } from "@mikro-orm/core";
import { fail } from "@sveltejs/kit";
export const load = async ({ params }) => {
	const payments = await getPaymentsByDeal(params.deal);

	return {
		payments: serialize(payments),
	};
};

export const actions = {
	record: async ({ request }) => {
		const data = await request.formData();

		const deal = new Deal();
		const payment = new Payment();

		deal.id = data.get("deal") as string;

		payment.amount = data.get("pmt") as string;
		payment.date = data.get("date") as string;
		payment.id = randomUUID();
		payment.deal = deal;

		await recordPayment(payment);

		const { deal: _, ...inserted } = payment;

		return { inserted };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const paymentId = data.get("id") as string;
		if (!paymentId) return fail(400, { id: paymentId, incorrect: true });

		await deletePayment(paymentId);

		return {};
	},
};
