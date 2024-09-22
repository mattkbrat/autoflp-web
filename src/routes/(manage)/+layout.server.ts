import {
	BUSINESS_ADDRESS,
	BUSINESS_MOTTO,
	BUSINESS_NAME,
	PHONE_NUMBER,
} from "$env/static/private";
import { getAccounts } from "$lib/server/database/account";
import { getDeals } from "$lib/server/database/deal/getDeals";
import { getInventory } from "$lib/server/database/inventory";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ url }) => {
	const deals = await getDeals();
	const inventory = await getInventory(1);
	const accounts = await getAccounts();

	const businessData = {
		name: BUSINESS_NAME,
		motto: BUSINESS_MOTTO,
		phone: PHONE_NUMBER,
		address: BUSINESS_ADDRESS,
	};

	return {
		deals,
		inventory,
		accounts,
		businessData,
	};
};
