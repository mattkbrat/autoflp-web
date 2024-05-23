import { getDetailedInventory } from "$lib/server/database/inventory.js";

export const load = async ({ params }) => {
	const inventory = await getDetailedInventory(params.vin);

	const [first] = inventory;

	return {
		inventory: {
			...first,
			year: Number.isFinite(+first.year) ? Number(first.year) : 0,
			down: first.down
				? Number.isFinite(+first.down)
					? Number(first.down)
					: 0
				: 0,
			cash: first.cash
				? Number.isFinite(+first.cash)
					? Number(first.cash)
					: 0
				: 0,
			credit: first.credit
				? Number.isFinite(+first.credit)
					? Number(first.credit)
					: 0
				: 0,
		},
	};
};
