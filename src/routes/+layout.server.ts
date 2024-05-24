import {
	getAndGroupDeals,
	getAndGroupSelected,
} from "$lib/server/database/deal";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ url }) => {
	const deals = await getAndGroupDeals();

	return {
		deals,
	};
};
