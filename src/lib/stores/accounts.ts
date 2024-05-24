import type { Accounts } from "$lib/server/database/account";
import { writable } from "svelte/store";

export const allAccounts = writable([] as Accounts);
