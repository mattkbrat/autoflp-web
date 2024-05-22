import {
	getAccountDeals,
	getAndGroupDeals,
	getAndGroupSelected,
} from "$lib/server/database/deal";

export const load = async ({ locals, url }) => {
	const selected = url.searchParams.get("id");

	if (!selected) return { accountDeals: null };

	const accountDeals = await getAndGroupSelected(selected);

	return {
		accountDeals: accountDeals || null,
	};
};
