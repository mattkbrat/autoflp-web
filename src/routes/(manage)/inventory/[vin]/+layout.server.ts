import { getSalesmen } from "$lib/server/database/account";
import { getInventory } from "$lib/server/database/inventory";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ url }) => {
	const stateParam = Number(url.searchParams.get("state"));
	const filter = stateParam !== 0 && stateParam !== 1 ? null : stateParam;
	const inventory = await getInventory(filter);
	const salesmen = await getSalesmen(1);

	return {
		inventory,
		salesmen,
	};
};
