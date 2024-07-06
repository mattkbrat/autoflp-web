import { writable } from "svelte/store";
import type { Deals, GroupedDeals } from "$lib/server/database/deal";
const defaultDeals: GroupedDeals = {};
const defaultAccountDeals: GroupedAccountDeals = [];

export const deals = writable(defaultDeals);
export const accountDeals = writable([] as Deals);
