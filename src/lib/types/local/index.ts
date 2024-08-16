import type { Payments } from "$lib/server/database/deal";

export type { Inventory as LocalInventory } from "$lib/server/database/inventory";

export type AmortizationPayments = Pick<Payments[number], "date" | "amount">[];
