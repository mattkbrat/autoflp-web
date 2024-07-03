import { BUSINESS_NAME } from "$env/static/private";
import { createKey, getKeys, serializeKeys } from "$lib/server/database/keys";
import { type Trades, upsertDeal } from "$lib/server/deal";
import { serialize } from "@mikro-orm/core";

export const load = async ({ params }) => {
	const keys = await getKeys(BUSINESS_NAME);
	return { keys: serialize(keys) };
};

export const actions = {
	submit: async ({ request }) => {
		const data = await request.formData();

		const id = data.get("id") as string;
		const key = data.get("key") as string;
		const value = data.get("value") as string;

		const newKey = await createKey({ business: BUSINESS_NAME, key, id, value });

		return {
			data: {
				key: { ...newKey },
			},
			method: id ? "update" : "insert",
		};
	},
};