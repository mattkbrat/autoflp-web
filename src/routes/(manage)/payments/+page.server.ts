import { getDealIds } from "$lib/server/database/deal";
import { serialize } from "@mikro-orm/core";
import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
	const dealIds = await getDealIds();
	return {
		deals: serialize(dealIds),
	};
};
