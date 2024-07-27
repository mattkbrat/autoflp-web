import { getAccounts } from "$lib/server/database/account";
import { getAndGroupDeals } from "$lib/server/database/deal";
import { getDeals } from "$lib/server/database/deal/getDeals";
import { getInventory } from "$lib/server/database/inventory";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ url }) => {
	const deals = await getDeals();
	const inventory = await getInventory(1);
	const accounts = await getAccounts();

	return {
		deals,
		inventory,
		accounts,
	};
};
