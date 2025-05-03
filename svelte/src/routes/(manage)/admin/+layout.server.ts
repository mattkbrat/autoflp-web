import { fullNameFromPerson } from "$lib/format";
import { getSalesmen } from "$lib/server/database/account";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
	const salesmen = await getSalesmen();

	return {
		salesmen: salesmen.map((s) =>
			Object.assign({}, s, { name: fullNameFromPerson({ person: s.contact }) }),
		),
	};
};
