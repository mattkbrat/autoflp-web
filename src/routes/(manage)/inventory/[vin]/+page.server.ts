import { randomUUID } from "crypto";
import {
	type Update,
	exists,
	getDetailedInventory,
	insert,
	parseDetailed,
	update,
	upsert,
} from "$lib/server/database/inventory.js";
import { Inventory } from "$lib/server/database/models/Inventory.js";
import { handleFetch, parseNHTSA } from "$lib/server/inventory";

export const load = async ({ params }) => {
	const inventory = await getDetailedInventory(params.vin);

	const [first] = inventory;

	return {
		inventory: parseDetailed(first),
	};
};

export const actions = {
	update: async ({ request }) => {
		const data = await request.formData();

		const id = data.get("id") as string;
		const vin = data.get("vin") as string;

		const inventory: Update = {};
		inventory.id = (data.get("id") || randomUUID()) as string;
		inventory.body = data.get("body") as string;
		inventory.make = data.get("make") as string;
		inventory.model = data.get("model") as string;
		inventory.year = data.get("year") as string;
		inventory.vin = vin;
		inventory.fuel = data.get("fuel") as string;
		inventory.mileage = data.get("mileage") as string;
		inventory.cwt = data.get("cwt") as string;
		inventory.color = data.get("color") as string;
		inventory.cash = data.get("cash") as string;
		inventory.credit = data.get("credit") as string;
		inventory.down = data.get("down") as string;

		console.log("updating", inventory);
		const handled = await upsert(id, inventory);

		const updated = await getDetailedInventory(vin).then((inv) => {
			return { ...inv[0] };
		});

		console.log({ handled, updated });

		return {
			data: updated,
			method: id ? "update" : "insert",
		};
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		return {};
	},

	search: async ({ request }) => {
		const data = await request.formData();
		const vin = data.get("vin") as string;
		if (!vin) return null;
		const searched = await handleFetch(vin);
		const parsed = parseNHTSA(searched);

		return parsed ? { ...parsed } : null;
	},
};
