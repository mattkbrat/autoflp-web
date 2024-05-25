import { randomUUID } from "node:crypto";
import {
	type AccountUpdate,
	type PersonUpdate,
	getDetailedAccount,
	serializeDetailedAccount,
	upsertAccount,
	upsertPerson,
} from "$lib/server/database/account";
import { Person } from "$lib/server/database/models/Person";

export const load = async ({ params }) => {
	const id = params.id;

	const account = id === "new" ? [] : await getDetailedAccount(id);

	return {
		account: serializeDetailedAccount(account[0]),
	};
};

export const actions = {
	update: async ({ request }) => {
		const data = await request.formData();

		const account = data.get("account-id") as string;
		const person = data.get("person-id") as string;
		const personId = (person || randomUUID()) as string;
		const accountId = (account || randomUUID()) as string;

		const personObject: PersonUpdate = {
			firstName: data.get("firstName") as string,
			id: personId,
			namePrefix: data.get("namePrefix") as string,
			middleInitial: data.get("middleInitial") as string,
			lastName: data.get("lastName") as string,
			address1: data.get("address1") as string,
			address2: data.get("address2") as string,
			address3: data.get("address3") as string,
			city: data.get("city") as string,
			stateProvince: data.get("stateProvince") as string,
			zipPostal: data.get("zipPostal") as string,
			zip4: data.get("zip4") as string,
			phonePrimary: data.get("phonePrimary") as string,
			phoneSecondary: data.get("phoneSecondary") as string,
			phoneTertiary: data.get("phoneTertiary") as string,
			emailPrimary: data.get("emailPrimary") as string,
			emailSecondary: data.get("emailSecondary") as string,
			country: "United States",
		};

		const upsertedPerson = await upsertPerson(personId, personObject);

		const accountObject: AccountUpdate = {
			id: accountId,
			contact: upsertedPerson,
			licenseNumber: data.get("licenseNumber") as string,
			licenseExpiration: data.get("licenseExpiration") as string,
			notes: data.get("notes") as string,
		};

		const upsertedAccount = await upsertAccount(accountId, accountObject);

		console.info("upserted", upsertedAccount, upsertedPerson);

		const { contact: _, ...returnAccount } = upsertedAccount;

		return {
			data: {
				...returnAccount,
				...upsertedPerson,
			},
			method: "insert",
		};
	},

	delete: async ({ request }) => {},

	search: async ({ request }) => {},
};
