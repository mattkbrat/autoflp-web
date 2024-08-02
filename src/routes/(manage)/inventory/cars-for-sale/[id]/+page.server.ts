import { getSingleInventory as getComInventory } from "$lib/server/database/com";
import { getSingleInventory } from "$lib/server/database/inventory";
import { redirect } from "@sveltejs/kit";

export const load = async ({ params }) => {
	const selected = await getComInventory(Number(params.id));

	if (!selected) {
		return redirect(307, "/inventory/cars-for-sale");
	}
	const local =
		selected.vin && (await getSingleInventory({ vin: selected.vin }));

	console.log({ local, selected, images: selected.images });
	return {
		selected,
		local,
	};
};
