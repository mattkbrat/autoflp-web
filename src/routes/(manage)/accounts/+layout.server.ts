import { serializeAccounts } from "$lib/server/database/account";

export const load = async () => {
	const accounts = await serializeAccounts();

	return {
		accounts,
	};
};
