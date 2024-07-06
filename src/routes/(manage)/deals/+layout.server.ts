import { getCreditors, getSalesmen } from "$lib/server/database/account";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
	const salesmen = await getSalesmen();
	const creditors = await getCreditors();

	console.log({ creditors });

	return { creditors, salesmen };
};
