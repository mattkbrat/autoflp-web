import { formatCurrency, formatInventory, formatSalesmen } from "$lib/format";
import { getSingleInventory } from "$lib/server/database/inventory";
import { siteUrl } from "$lib/server/env";
import type { Inventory } from "@prisma/client";
import type { PushoverNotification } from "./constants";
import { sendNotification } from "./sendNotification";
import type { InventorySalesmen } from "$lib/types";

type NotifyInventoryParams = {
	notification?: Omit<PushoverNotification, "title" | "message">;
	type: "close" | "delete" | "create" | "update";
} & (
	| {
			id: string;
	  }
	| {
			inventory: Inventory;
	  }
);

export const sendInventoryNotification = async ({
	notification,
	type,
	...i
}: NotifyInventoryParams) => {
	const singleInventory = "id" in i ? await getSingleInventory(i) : i.inventory;

	if (!singleInventory) {
		console.warn("Failed to get inventory, cannot send notification", i);
		return;
	}
	const title =
		type === "close"
			? "Inventory Closed"
			: type === "update"
				? "Inventory Updated"
				: type === "delete"
					? "Inventory deleted"
					: "New Inventory Recorded";

	const invString = formatInventory(singleInventory);

	// const messageSuffix = `lien - ${formatCurrency(
	// 	accountInfo.lien,
	// )}`;

	console.log("notify", singleInventory, i);

	const salesmen =
		"inventory_salesman" in singleInventory
			? formatSalesmen(
					singleInventory.inventory_salesman as InventorySalesmen,
					"firstInitial",
				)
			: "";

	const inventory = "inventory" in i ? i.inventory : singleInventory;
	const cash = formatCurrency(inventory.cash);
	const credit = formatCurrency(inventory.credit);
	const down = formatCurrency(inventory.down);

	const message =
		`${invString} ${salesmen}; d. ${down} c. ${cash} cr. ${credit}`.trim();

	const url = `${siteUrl}/inventory/${inventory.vin}`;

	const fullNotification: PushoverNotification = Object.assign(
		notification || {},
		{
			title,
			message,
			url,
		},
	);

	return sendNotification(fullNotification);
};
