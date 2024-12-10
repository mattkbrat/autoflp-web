import { BUSINESS_NAME } from "$env/static/private";
import { createKey, getKeys } from "$lib/server/database/keys";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { generateMergedBilling } from "$lib/server/deal";
import {
	getExpectedWithSalesmen,
	getSalesmanPayments,
} from "$lib/server/database/deal";
import { addMonths } from "date-fns";

export const load: PageServerLoad = async ({ url }) => {
	const keys = await getKeys(BUSINESS_NAME);

	const yearFilter = url.searchParams.get("year");

	const startDateFilter = yearFilter
		? new Date(Number(yearFilter) - 1, 12, 1)
		: undefined;

	const payments = await getSalesmanPayments({
		date: {
			gte: (startDateFilter ? startDateFilter : addMonths(new Date(), -36))
				.toISOString()
				.split("T")[0],
			lte: startDateFilter
				? addMonths(startDateFilter, 12).toISOString().split("T")[0]
				: undefined,
		},
	});

	const expectedWithSalesmen = await getExpectedWithSalesmen();

	return { keys, payments, expected: expectedWithSalesmen };
};

export const actions = {
	submit: async ({ request }) => {
		const data = await request.formData();

		const id = data.get("id") as string;
		const key = data.get("key") as string;
		const value = data.get("value") as string;

		const newKey = await createKey({ business: BUSINESS_NAME, key, id, value });

		return {
			data: {
				key: newKey.k,
			},
			method: id ? "update" : "insert",
		};
	},
	printBilling: async () => {
		const data = await generateMergedBilling("desc");

		return { built: data };
	},
} satisfies Actions;
