import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { generateMergedBilling } from "$lib/server/deal";
import {
	getExpectedWithSalesmen,
	getSalesmanPayments,
} from "$lib/server/database/deal";
import { addMonths } from "date-fns";

export const load: PageServerLoad = async ({ url }) => {
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

	return { payments, expected: expectedWithSalesmen };
};

export const actions = {
	printBilling: async ({ request }) => {
		const formData = await request.formData();
		const ids = formData.getAll("id").filter((r) => typeof r === "string");
		const data = await generateMergedBilling("desc", undefined, ids);

		return { built: data };
	},
} satisfies Actions;
