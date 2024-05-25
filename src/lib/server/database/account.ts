import type { AsyncReturnType } from "$lib/types";
import { type FromEntityType, serialize, wrap } from "@mikro-orm/core";
import { orm } from ".";
import { Account } from "./models/Account";
import { Person } from "./models/Person";

export const getAccounts = async () => {
	return orm.em.find(
		Account,
		{},
		{
			limit: 5,
			populate: ["contact"],
			fields: [
				"id",
				"contact.id",
				"contact.lastName",
				"contact.firstName",
				"licenseNumber",
			],
			orderBy: {
				contact: {
					lastName: "desc",
					firstName: "desc",
				},
			},
		},
	);
};

export const serializeAccounts = async () => {
	return getAccounts().then((accounts) => {
		return accounts.map((ac) => {
			return {
				contact: ac.contact.id,
				id: ac.id,
				license: ac.licenseNumber,
				firstName: ac.contact.firstName,
				lastName: ac.contact.lastName,
			};
		});
	});
};

export type Accounts = AsyncReturnType<typeof serializeAccounts>;

export const getDetailedAccount = async (id: string) => {
	return orm.em.find(
		Account,
		{ id },
		{
			populate: ["contact"],
		},
	);
};

export const serializeDetailedAccount = (
	account: AsyncReturnType<typeof getDetailedAccount>[number],
) => {
	const { contact, dateOfBirth, licenseExpiration, ...acc } = account || {};

	return {
		...acc,
		...contact,
		account: acc?.id,
		contact: account?.contact?.id,
		licenseExpiration: new Date(licenseExpiration || new Date()),
		dateOfBirth: new Date(dateOfBirth || new Date()),
	};
};

export type AccountField = Extract<
	keyof ReturnType<typeof serializeDetailedAccount>,
	string
>;

///

export const insertPerson = async (p: Person) => {
	return orm.em.insert(p);
};

export type PersonUpdate = FromEntityType<Person>;

const getPerson = async (id: string) => orm.em.findOneOrFail(Person, { id });
const getAccount = async (id: string) => orm.em.findOneOrFail(Account, { id });
export const updatePerson = async (id: string, p: PersonUpdate) => {
	const orig = await getPerson(id);
	const wrapped = wrap(orig).assign(p);

	await orm.em.flush();

	return wrapped;
};

export const upsertPerson = async (id: string | null, p: PersonUpdate) => {
	let shouldInsert = !id;
	if (!shouldInsert && id) {
		try {
			await updatePerson(id, p);
		} catch (e) {
			console.error("could not update", e.message);
			shouldInsert = true;
		}
	}

	if (shouldInsert) {
		const newP = new Person();
		try {
			await insertPerson(wrap(newP).assign(p));
		} catch (e) {
			console.error("could not update", e.message);
		}
	}

	return getPerson(id || p.id);
};

export type AccountUpdate = FromEntityType<Account>;

export const updateAccount = async (id: string, a: AccountUpdate) => {
	const orig = await getAccount(id);
	const wrapped = wrap(orig).assign(a);

	await orm.em.flush();

	return wrapped;
};

export const insertAccount = async (a: Account) => {
	return orm.em.insert(a);
};
export const upsertAccount = async (id: string | null, a: AccountUpdate) => {
	let shouldInsert = !id;
	if (!shouldInsert && id) {
		try {
			await updateAccount(id, a);
		} catch (e) {
			console.error("could not update", e.message);
			shouldInsert = true;
		}
	}

	if (shouldInsert) {
		const newP = new Account();
		try {
			await insertAccount(wrap(newP).assign(a));
		} catch (e) {
			console.error("could not update", e.message);
			shouldInsert = true;
		}
	}

	return getAccount(id || a.id);
};
