import { randomUUID } from "node:crypto";
import { deletePayment, recordPayment } from "$lib/server/database/payment";
import { fail, type Actions } from "@sveltejs/kit";
import { getPayments } from "$lib/server/database/deal/getPayments";
import type { Payment } from "@prisma/client";
import {
	dealAmortization,
	defaultSchedule,
	type AmortizedDeal,
} from "$lib/finance/amortization";
import { getDetailedDeal, updatePartialDeal } from "$lib/server/database/deal";
import type { PageServerLoad } from "./$types";
export const load: PageServerLoad = async ({ params }) => {
	const payments = await getPayments(params.deal);
	const deal = await getDetailedDeal({ id: params.deal });
	const schedule: AmortizedDeal = deal?.finance
		? dealAmortization(deal, payments)
		: defaultSchedule;
	return {
		payments,
		schedule,
		deal,
	};
};

export const actions = {
	record: async ({ request }) => {
		const data = await request.formData();

		const balance = data.get("balance");
		const payment: Payment = {
			amount: data.get("pmt") as string,
			date: data.get("date") as string,
			id: randomUUID(),
			dealId: data.get("deal") as string,
		};

		await recordPayment(payment);

		if (Number(balance) - Number(payment.amount) <= 10) {
			await updatePartialDeal(payment.dealId, { state: 0 });
		}
		const { dealId: _, ...inserted } = payment;

		return { inserted };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const paymentId = data.get("id") as string;
		const dealId = data.get("deal") as string;
		if (!paymentId) return fail(400, { id: paymentId, incorrect: true });

		await updatePartialDeal(dealId, { state: 1 });
		await deletePayment(paymentId);

		return {};
	},

	toggleState: async ({ request }) => {
		const data = await request.formData();
		const dealId = data.get("id") as string;
		if (!dealId) return fail(400, { id: dealId, incorrect: true });
		const state = Number(data.get("state") as string);
		if (state !== 0 && state !== 1)
			return fail(400, { state, message: "state must be 1 or 0" });
		return updatePartialDeal(dealId, { state: state === 0 ? 1 : 0 }).then(
			(deal) => deal.state,
		);
	},
} satisfies Actions;
