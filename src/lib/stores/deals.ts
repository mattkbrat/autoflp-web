import { writable } from "svelte/store";
import type { Deals, GroupedDeals } from "$lib/server/database/deal";
const defaultDeals: Deals = [];
const defaultGroupedDeals: GroupedDeals = {};

export const deals = writable(defaultDeals);
export const groupedDeals = writable(defaultGroupedDeals);
export const accountDeals = writable([] as Deals);
