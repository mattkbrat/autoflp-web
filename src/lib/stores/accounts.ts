import type {
	Accounts,
	Creditors,
	Salesmen,
} from "$lib/server/database/account";
import { writable } from "svelte/store";

export const allAccounts = writable([] as Accounts);
export const allCreditors = writable([] as Creditors);
export const allSalesmen = writable([] as Salesmen);
