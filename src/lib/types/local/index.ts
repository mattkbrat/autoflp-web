import type { DetailedDeal, Payments } from "$lib/server/database/deal";

export type { Inventory as LocalInventory } from "$lib/server/database/inventory";

export type AmortizationPayments = Pick<
	Payments[number],
	"date" | "amount" | "id"
>[];

export type InventorySalesmen =
	NonNullable<DetailedDeal>["inventory"]["inventory_salesman"];
