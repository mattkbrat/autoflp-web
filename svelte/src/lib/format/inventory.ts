import type { Inventory } from "$lib/server/database/inventory";
import { formatSalesmen } from "./salesmen";

export const formatInventory = (
	inventory: Partial<Inventory>,
	titleCase = false,
	joinCharacter = " ",
	includeSalesman = false,
) => {
	if (typeof inventory === "undefined") {
		return "";
	}

	const { make, model, year, color, vin } = inventory;

	const inv = [
		year ? `'${year.split(".")[0].slice(-2)}` : "",
		make,
		model,
		vin?.slice(-4),
		color,
		includeSalesman && inventory.inventory_salesman
			? formatSalesmen(inventory.inventory_salesman, "firstName")
			: "",
	]
		.filter((p) => p && p.toLowerCase() !== "none")
		.join(joinCharacter)
		.trim();

	if (titleCase) {
		return inv
			.trim()
			.split(" ")
			.map((word) => {
				if (word.length === 0) {
					return "";
				}
				return word[0].toUpperCase() + word.slice(1);
			})
			.join(" ");
	}

	return inv.toUpperCase();
};
