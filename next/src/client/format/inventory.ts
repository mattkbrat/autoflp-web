import type { Inventory } from "~/server/db/queries/inventory/get";
import { toTitleCase } from "./title-case";

export const formatInventory = (
	inventory: Partial<Inventory>,
	titleCase = false,
	joinCharacter = " ",
	// includeSalesman = false, @TODO:
) => {
	if (typeof inventory === "undefined") {
		return "";
	}

	const { make, model, year, color, vin } = inventory;

	const inv = [
		typeof year === "string" ? `'${year?.split(".0")[0]?.slice(-2)}` : year,
		make,
		model,
		vin?.slice(-4),
		color,
		// @TODO
		// includeSalesman && inventory.inventory_salesman
		// 	? formatSalesmen(inventory.inventory_salesman, "firstName")
		// 	: "",
	]
		.filter((p) => typeof p === "string" && p.toLowerCase() !== "none")
		.join(joinCharacter)
		.trim();

	return titleCase ? toTitleCase(inv) : inv.toUpperCase();
};
