import { serializeAccounts } from "$lib/server/database/account";
import { serializeAllInventory } from "$lib/server/database/inventory";
import type { LayoutServerLoad } from "./$types";
import { getAndGroupDeals } from "./payments/getAndGroupDeals";

export const load: LayoutServerLoad = async ({ url }) => {
	const deals = await getAndGroupDeals();
	const inventory = await serializeAllInventory(1);
	const accounts = await serializeAccounts();

	return {
		deals,
		inventory,
		accounts,
	};
};
