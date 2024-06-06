import { randomUUID } from "node:crypto";
import type { DealFields } from "$lib/finance";
import { calcFinance } from "$lib/finance/calc";
import { createDeal } from "$lib/server/database/deal";
import { upsertDeal } from "$lib/server/deal";
import { fail } from "@sveltejs/kit";

export const load = async ({ params }) => {
	return {};
};

export const actions = {
	submit: async ({ request }) => {
		const data = await request.formData();

		const id = data.get("id") as string;

		const deal = Object.fromEntries(data) as unknown as DealFields;
		deal.salesmen = (deal.salesmen as unknown as string).split(",");
		deal.id = deal.id || randomUUID();
		deal.date = new Date(deal.date);
		console.log("submitting new", deal);
		const finance = calcFinance(deal);

		const handled = await upsertDeal(deal, finance);

		console.log(handled);

		const { id: newDealId } = handled || {};

		return {
			data: {
				id: newDealId,
			},
			method: id ? "update" : "insert",
		};
	},
};
