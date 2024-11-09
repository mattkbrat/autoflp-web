import { getExpectedWithSalesmen } from "$lib/server/database/deal";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
	const monthFilter = url.searchParams.get("month");
	const yearFilter = url.searchParams.get("year");

	// const lte = url.searchParams.get("lte") || undefined;

	const expectedWithSalesmen = await getExpectedWithSalesmen({
		gte: yearFilter && monthFilter ? `${monthFilter}-01-${yearFilter}` : "",
	});
	return { expected: expectedWithSalesmen };
};
