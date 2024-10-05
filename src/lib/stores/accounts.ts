import { fullNameFromPerson } from "$lib/format";
import type {
	Accounts,
	Creditors,
	Salesmen,
} from "$lib/server/database/account";
import { derived, writable } from "svelte/store";

export const allAccounts = writable([] as Accounts);
export const allCreditors = writable([] as Creditors);
export const allSalesmen = writable([] as Salesmen);

export const accountOptions = derived(allAccounts, ($acc) =>
	$acc.map((d) => {
		const fullName = fullNameFromPerson({ person: d.contact });
		return {
			text: `${fullName} | ${d.licenseNumber}`,
			value: d.id,
			state: 1,
		};
	}),
);
