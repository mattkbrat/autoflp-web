import type { AsyncReturnType } from "$lib/types";
import { type FromEntityType, serialize, wrap } from "@mikro-orm/core";
import { orm } from ".";
import { Inventory } from "./models/Inventory";

type State = number | null;

export const getInventory = async (state: State) => {
	return orm.em.findAll(Inventory, {
		where: state !== null ? { state } : undefined,
		fields: ["id", "make", "model", "year", "vin", "color"],
		orderBy: {
			make: "desc",
			model: "asc",
		},
	});
};

export const getDetailedInventory = async (vin: string) => {
	return orm.em.findAll(Inventory, {
		where: { vin },
		limit: 1,
	});
};

export type InventoryField = Extract<
	keyof ReturnType<typeof parseDetailed>,
	string
>;

export const parseDetailed = (inventory: Inventory = {}) => {
	return {
		...inventory,
		year: !Number.isNaN(+inventory.year) ? Number(inventory.year) : 0,
		down: inventory.down
			? !Number.isNaN(+inventory.down)
				? Number(inventory.down)
				: 0
			: 0,
		cash: inventory.cash
			? !Number.isNaN(+inventory.cash)
				? Number(inventory.cash)
				: 0
			: 0,
		credit: inventory.credit
			? !Number.isNaN(+inventory.credit)
				? Number(inventory.credit)
				: 0
			: 0,
	};
};

export const exists = async (id: string) => {
	return orm.em
		.find(Inventory, {
			id,
		})
		.then((res) => res.length > 0 && res[0].id === id);
};

export const serializeAllInventory = async (state: State) => {
	return getInventory(state).then((inventory) => serialize(inventory));
};

export const insert = async (inventory: Inventory) => {
	return orm.em.insert(inventory);
};

export type Update = FromEntityType<Inventory>;

export const update = async (id: string, inventory: Update) => {
	const orig = await orm.em.findOneOrFail(Inventory, { id });
	const wrapped = wrap(orig).assign(inventory);

	await orm.em.flush();

	return wrapped;
};

export const upsert = async (id: string | null, inventory: Update) => {
	let shouldInsert = !id;
	if (!shouldInsert && id) {
		try {
			await update(id, inventory);
		} catch (e) {
			console.error("could not update", e.message);
			shouldInsert = true;
		}
	}

	if (shouldInsert) {
		const newInventory = new Inventory();
		try {
			await insert(wrap(newInventory).assign(inventory));
		} catch (e) {
			console.error("could not update", e.message);
			shouldInsert = true;
		}
	}
};

export type AllInventory = AsyncReturnType<typeof serializeAllInventory>;

export const deleteInventory = async (vin: string) => {
	const inv = orm.em.getReference(Inventory, vin);
	await orm.em.remove(inv).flush();
};
