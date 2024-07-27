import { randomUUID } from "node:crypto";
import { deletePayment, recordPayment } from "$lib/server/database/payment";
import { fail } from "@sveltejs/kit";
import { getPayments } from "$lib/server/database/deal/getPayments";
import type { Payment } from "@prisma/client";
import { amoritization, dealAmortization } from "$lib/finance/amortization";
import {
	getDeal,
	updateDeal,
	updatePartialDeal,
} from "$lib/server/database/deal";
import { updateAccount } from "$lib/server/database/account";
export const load = async ({ params }) => {
	const payments = await getPayments(params.deal);
	const deal = await getDeal({ id: params.deal });
	const schedule = deal?.finance && dealAmortization(deal, payments);
	// console.log({ deal }, schedule);
	return {
		payments,
		schedule,
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
