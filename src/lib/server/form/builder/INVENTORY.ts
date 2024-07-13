import type { Inventory } from "$lib/server/database/models/Inventory";
import type { InventoryTemplate } from "./maps";

export const getData = (inventory: Inventory[]) => {
	const acc: Partial<InventoryTemplate> = {};
	for (let n = 0; n++; n < inventory.length) {}
};
