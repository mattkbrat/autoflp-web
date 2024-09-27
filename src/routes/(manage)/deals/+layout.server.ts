import { getCreditors } from "$lib/server/database/account";
import { getInventory } from "$lib/server/database/inventory";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
	const creditors = await getCreditors();
	const inventory = await getInventory(1);

	return { creditors, inventory };
};
