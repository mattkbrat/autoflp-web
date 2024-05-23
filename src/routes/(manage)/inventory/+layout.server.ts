import { getAndGroupDeals } from "$lib/server/database/deal";
import {
	getInventory,
	serializeAllInventory,
} from "$lib/server/database/inventory";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ url }) => {
	const stateParam = url.searchParams.get("state");
	const inventory = await serializeAllInventory(
		stateParam ? +stateParam : null,
	);

	return {
		inventory,
	};
};
