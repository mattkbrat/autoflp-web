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
	update: async ({
		request,
	}): Promise<
		| { status: "error"; title: string; message: string }
		| {
				data: { account: Account; contact: Person };
				method: "insert";
				handled: number;
		  }
	> => {
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

		let upsertedPerson: Person;
		try {
			upsertedPerson = await upsertPerson(personObject);
		} catch (e) {
			return {
				status: "error",
				title: "Failed to update person",
				message:
					e instanceof Error
						? e.message
						: "failed to update person. Are the fields unique?",
			};
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
		let upsertedAccount: Account;
		try {
			upsertedAccount = await upsertAccount(accountObject);
		} catch (e) {
			return {
				status: "error",
				title: "Failed to update account",
				message: e instanceof Error ? e.message : "Are the fields unique?",
			};
		}

		console.info("upserted", upsertedAccount, upsertedPerson);

		return {
			handled: new Date().getTime(),
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
