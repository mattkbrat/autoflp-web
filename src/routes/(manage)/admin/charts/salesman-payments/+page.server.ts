import { addMonths } from "date-fns";
import type { PageServerLoad } from "./$types";
import { getSalesmanPayments } from "$lib/server/database/deal";

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

	return { payments };
};
