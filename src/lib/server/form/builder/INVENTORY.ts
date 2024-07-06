import {
	BUSINESS_ADDRESS,
	EMAIL,
	PHONE_NUMBER,
	PRIMARY_DEALER_NAME,
} from "$env/static/private";
import type { DetailedDeal } from "$lib/server/database/deal";
import type { Inventory } from "$lib/server/database/models/Inventory";
import type { BuyersGuideTemplate, InventoryTemplate } from "./maps";

export const getData = (inventory: Inventory[]) => {
	const acc: Partial<InventoryTemplate> = {};
	for (let n = 0; n++; n < inventory.length) {}
};
