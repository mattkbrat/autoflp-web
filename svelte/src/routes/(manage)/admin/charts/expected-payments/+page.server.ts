import { getExpectedWithSalesmen } from "$lib/server/database/deal";
import { differenceInMonths, endOfMonth, isSameMonth } from "date-fns";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
	const monthFilter = url.searchParams.get("month");
	const yearFilter = url.searchParams.get("year");
	const now = new Date();
	const start =
		yearFilter && monthFilter
			? new Date(Number(yearFilter), Number(monthFilter) - 1, 1, 12, 10, 10)
			: "";

	const sameMonth = start ? isSameMonth(start, now) : false;

	const expectedWithSalesmen = await getExpectedWithSalesmen(
		start && !sameMonth
			? {
					gte: start.toISOString().split("T")[0],
					lte: endOfMonth(start).toISOString().split("T")[0],
				}
			: undefined,
	);
	return { expected: expectedWithSalesmen };
};
