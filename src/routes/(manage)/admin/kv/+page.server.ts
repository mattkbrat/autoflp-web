import { BUSINESS_NAME } from "$env/static/private";
import { createKey, getKeys } from "$lib/server/database/keys";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const keys = await getKeys(BUSINESS_NAME);

	return { keys };
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
				key: newKey.k,
			},
			method: id ? "update" : "insert",
		};
	},
} satisfies Actions;
