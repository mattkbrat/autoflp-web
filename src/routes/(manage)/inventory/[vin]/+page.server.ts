import { getDetailedInventory } from "$lib/server/database/inventory.js";

export const load = async ({ params }) => {
	const inventory = await getDetailedInventory(params.vin);

	return {
		inventory: { ...inventory[0] },
	};
};
