import { getAccounts } from "$lib/server/database/account";

export const load = async () => {
	const accounts = await getAccounts();

	return {
		accounts,
	};
};
