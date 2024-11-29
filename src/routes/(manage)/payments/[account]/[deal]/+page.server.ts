import { randomUUID } from "node:crypto";
import { deletePayment, recordPayment } from "$lib/server/database/payment";
import { fail, type Actions } from "@sveltejs/kit";
import { getPayments } from "$lib/server/database/deal/getPayments";
import type { Payment } from "@prisma/client";
import { getDetailedDeal, updatePartialDeal } from "$lib/server/database/deal";
import type { PageServerLoad } from "./$types";
import { getPaymentSchedule } from "$lib/finance/payment-history";
import { addMonths } from "date-fns";
export const load: PageServerLoad = async ({ params }) => {
	const payments = await getPayments(params.deal);
	const deal = await getDetailedDeal({ id: params.deal });
	const schedule = deal?.finance
		? getPaymentSchedule(
				{
					pmt: Number(deal.pmt),
					term: Number(deal.term),
					balance: Number(deal.lien),
					startDate: addMonths(new Date(deal.date), 1),
					finance: Number(deal.finance),
					apr: Number(deal.apr),
				},
				payments,
			)
		: null;
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
		const amount = data.get("pmt") as string;
		const date = data.get("date") as string;
		const payoff = Number(data.get("payoff"));
		if (!amount || !date) {
			return fail(400, { message: "must provide amount and date" });
		}
		const isPayoff =
			payoff <= Number(amount) || Number(balance) - Number(amount) <= 1;

		const payment: Payment = {
			amount,
			date,
			id: randomUUID(),
			dealId: data.get("deal") as string,
		};

		await recordPayment(payment);

		if (isPayoff) {
			await updatePartialDeal(payment.dealId, { state: 0 }).then(
				(deal) => deal.state,
			);
		}
		const { dealId: _, ...inserted } = payment;

		return { inserted };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const payments = data.getAll("pmt-id");

		if (!payments.length)
			return fail(400, {
				payments,
				incorrect: true,
				message: "must provide at least one payment to delete",
			});

		await deletePayment(payments as string[]);

		return {};
	},

	toggleState: async ({ request }) => {
		const data = await request.formData();
		const dealId = data.get("deal") as string;
		if (!dealId) return fail(400, { id: dealId, incorrect: true });
		const state = Number(data.get("state") as string);
		if (state !== 0 && state !== 1)
			return fail(400, { state, message: "state must be 1 or 0" });
		return updatePartialDeal(dealId, { state: state === 0 ? 1 : 0 }).then(
			(deal) => deal?.state,
		);
	},
} satisfies Actions;
