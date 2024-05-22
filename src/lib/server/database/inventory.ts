import type { AsyncReturnType } from "$lib/types";
import { serialize } from "@mikro-orm/core";
import { orm } from ".";
import { Inventory } from "./models/Inventory";

type State = number | null;

export const getInventory = async (state: State) => {
	return orm.em.findAll(Inventory, {
		where: state ? { state } : undefined,
		fields: ["id", "make", "model", "year", "vin"],
		orderBy: {
			make: "desc",
			model: "asc",
		},
	});
};

export const serializeAllInventory = async (state: State) => {
	return getInventory(state).then((inventory) => serialize(inventory));
};

export type AllInventory = AsyncReturnType<typeof serializeAllInventory>;
