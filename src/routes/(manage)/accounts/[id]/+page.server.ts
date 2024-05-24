import {
	getDetailedAccount,
	serializeDetailedAccount,
} from "$lib/server/database/account";

export const load = async ({ params }) => {
	const id = params.id;

	const account = id === "new" ? [] : await getDetailedAccount(id);

	return {
		account: serializeDetailedAccount(account[0]),
	};
};

export const actions = {
	update: async ({ request }) => {
		return {
			data: null,
			method: "insert",
		};
	},

	delete: async ({ request }) => {},

	search: async ({ request }) => {},
};
