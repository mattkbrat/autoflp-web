import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import type { ComInventory } from "$lib/types";

export const getProdUrl = (id: ComInventory[number]["id"]) => {
	return `${dev ? env.COM_URL_DEV : env.COM_URL_PROD}/cars-for-sale/${id}`;
};
