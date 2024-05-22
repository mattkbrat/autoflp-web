import type {
	GroupedAccountDeals,
	GroupedDeals,
} from "$lib/server/database/deal";
import { writable } from "svelte/store";

const defaultDeals: GroupedDeals = {};
const defaultAccountDeals: GroupedAccountDeals = [];

export const deals = writable(defaultDeals);
export const accountDeals = writable(defaultAccountDeals);
