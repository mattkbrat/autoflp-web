import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { derived, writable } from "svelte/store";

const getStoredValue = (key: string) => {
	return (browser && localStorage.getItem(key)) || "";
};

const ids = ["deal", "inventory", "account", "payment", "creditor"] as const;

export type BaseId = (typeof ids)[number];

type Id = `${BaseId}ID`;

type StateValue = string;
type State = { [key in Id]: StateValue };
const defaultState: State = {
	dealID: getStoredValue("dealId"),
	inventoryID: getStoredValue("inventoryId"),
	accountID: getStoredValue("accountId"),
	paymentID: getStoredValue("paymentId"),
	creditorID: getStoredValue("creditorID"),
};

export const selectedStates = writable(defaultState);

export const dealID = derived(selectedStates, (s) => s.dealID);
export const inventoryID = derived(selectedStates, (s) => s.inventoryID);
export const accountID = derived(selectedStates, (s) => s.accountID);
export const creditorID = derived(selectedStates, (s) => s.creditorID);
export const paymentID = derived(selectedStates, (s) => s.paymentID);

export const handleSelect = (k: BaseId, value: string) => {
	selectedStates.update((s) => {
		const key = `${k}ID`;
		return {
			...s,
			[key]: value,
		};
	});
};

const accountDealLink = derived([accountID, dealID], ([$acc, $deal]) => {
	if (!$acc || !$deal) return null;
	return `${$acc}/${$deal}`;
});

accountDealLink.subscribe((link) => {
	if (!browser) {
		console.warn("No browser");
		return;
	}
	if (!link) {
		console.warn("invalid link", link);
		return;
	}
	goto(`/payments/${link}`);
});
