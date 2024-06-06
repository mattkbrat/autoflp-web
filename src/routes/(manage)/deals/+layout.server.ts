import {
	serializeCreditors,
	serializeSalesmen,
} from "$lib/server/database/account";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
	const creditors = await serializeCreditors();
	const salesmen = await serializeSalesmen();

	return { creditors, salesmen };
};
