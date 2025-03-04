import {
	getDetailedAccount,
	upsertAccount,
	upsertPerson,
	type DetailedAccount,
} from "$lib/server/database/account";
import type { Account, Person } from "@prisma/client";
import { fail, type Actions } from "@sveltejs/kit";
import { randomUUID } from "node:crypto";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id;

	const account =
		id === "new" ? ({} as DetailedAccount) : await getDetailedAccount({ id });

	return {
		account,
	};
};

export const actions = {
	update: async ({ request }) => {
		const data = await request.formData();

		const account = data.get("account-id") as string;
		const person = data.get("person-id") as string;
		const personId = (person || randomUUID()) as string;
		const accountId = (account || randomUUID()) as string;

		const personObject: Person = {
			firstName: data.get("firstName") as string,
			nameSuffix: data.get("nameSuffix") as string,
			id: personId,
			namePrefix: data.get("namePrefix") as string,
			middleInitial: data.get("middleInitial") as string,
			lastName: data.get("lastName") as string,
			address_1: data.get("address_1") as string,
			address_2: data.get("address_2") as string,
			address_3: data.get("address_3") as string,
			city: data.get("city") as string,
			stateProvince: data.get("stateProvince") as string,
			zipPostal: data.get("zipPostal") as string,
			zip_4: data.get("zip_4") as string,
			phonePrimary: data.get("phonePrimary") as string,
			phoneSecondary: data.get("phoneSecondary") as string,
			phoneTertiary: data.get("phoneTertiary") as string,
			emailPrimary: data.get("emailPrimary") as string,
			emailSecondary: data.get("emailSecondary") as string,
			country: "United States",
		};

		const upsertedPerson = await upsertPerson(personObject);
		if (upsertedPerson instanceof Error) {
			return fail(400, {
				message: `Could not update contact: ${upsertedPerson.message}`,
			});
		}

		const accountObject: Partial<Account> = {
			id: accountId,
			contact_id: upsertedPerson.id,
			licenseNumber: data.get("licenseNumber") as string,
			licenseExpiration: data.get("licenseExpiration") as string,
			notes: data.get("notes") as string,
			dateOfBirth: data.get("dateOfBirth") as string,
			dateAdded: undefined,
			dateModified: new Date().toISOString(),
			currentStanding: null,
		};

		const upsertedAccount = await upsertAccount(accountObject).catch(
			(e) => new Error(e.message),
		);

		if (upsertedAccount instanceof Error) {
			return fail(400, {
				message: `Could not update contact: ${upsertedAccount.message}`,
			});
		}

		console.info("upserted", upsertedAccount, upsertedPerson);

		return {
			data: {
				account: upsertedAccount,
				contact: upsertedPerson,
			},
			method: "insert",
		};
	},

	delete: async ({ request }) => {},

	search: async ({ request }) => {},
} satisfies Actions;
