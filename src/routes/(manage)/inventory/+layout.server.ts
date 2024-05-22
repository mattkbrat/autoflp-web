import { getAndGroupDeals } from "$lib/server/database/deal";
import {
	getInventory,
	serializeAllInventory,
} from "$lib/server/database/inventory";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ url }) => {
	const stateParam = url.searchParams.get("state");
	const state =
		stateParam === "inactive" ? 0 : stateParam === "active" ? 1 : null;
	const inventory = await serializeAllInventory(state);

	return {
		inventory,
	};
};
