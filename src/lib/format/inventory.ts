import type { Inventory } from "@prisma/client";

export const formatInventory = (
	inventory: Partial<Inventory>,

	titleCase = true,
) => {
	if (typeof inventory === "undefined") {
		return "";
	}

	let { make, model, year, color, vin } = inventory;

	if (!make || make.toLowerCase() === "none") {
		make = "";
	}

	if (!year || year.toLowerCase() === "none") {
		year = "";
	} else {
		year = year.split(".")[0].slice(-2);
	}

	if (!color || color.toLowerCase() === "none") {
		color = "";
	}

	vin = vin?.slice(-4) || "";

	const inv = [color, year, make, model, vin?.slice(-4)]
		.filter(Boolean)
		.join(" ");

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

	return `${color} ${year} ${make} ${vin}`.trim();
};
