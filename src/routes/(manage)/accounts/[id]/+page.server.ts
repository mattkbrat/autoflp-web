import { getAccounts } from "$lib/server/database/account.js";
import { serialize } from "@mikro-orm/core";

export const load = async ({ params }) => {};

export const actions = {
	update: async ({ request }) => {
		return {
			data: null,
			method: "insert",
		};
	},

	delete: async ({ request }) => {},

	search: async ({ request }) => {},
};
