import { randomUUID } from "node:crypto";
import { Deal } from "$lib/server/database/models/Deal";
import {
	deletePayment,
	getPaymentsByDeal,
	recordPayment,
} from "$lib/server/database/payment";
import { serialize, wrap } from "@mikro-orm/core";
import { fail } from "@sveltejs/kit";
import { getPayments } from "$lib/server/database/deal";
import type { Payment } from "@prisma/client";
export const load = async ({ params }) => {
	const payments = await getPayments(params.deal);
	return {
		payments,
	};
};

export const actions = {
	record: async ({ request }) => {
		const data = await request.formData();

		const payment: Payment = {
			amount: data.get("pmt") as string,
			date: data.get("date") as string,
			id: randomUUID(),
			dealId: data.get("deal") as string,
		};

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
