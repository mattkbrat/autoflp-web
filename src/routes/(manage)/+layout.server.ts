import { getAccounts } from "$lib/server/database/account";
import { getAndGroupDeals, getDeals } from "$lib/server/database/deal";
import { getInventory } from "$lib/server/database/inventory";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ url }) => {
	const deals = await getAndGroupDeals();
	const inventory = await getInventory(1);
	const accounts = await getAccounts();

	return {
		deals,
		inventory,
		accounts,
	};
};
