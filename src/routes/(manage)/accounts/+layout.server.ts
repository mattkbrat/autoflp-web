import { serializeAccounts } from "$lib/server/database/account";

export const load = async () => {
	const accounts = await serializeAccounts();

	console.log(accounts[0]);
	return {
		accounts,
	};
};
