import { browser } from "$app/environment";
import { handleAccNav, handleInvNav, type NavType } from "$lib/navState";
import { derived, writable } from "svelte/store";

const getStoredValue = (key: string) => {
	return (browser && localStorage.getItem(key)) || "";
};

const ids = ["deal", "inventory", "salesman", "account", "payment"] as const;

type BaseId = (typeof ids)[number];

type Id = `${BaseId}ID`;

type StateValue = { value: string; state: NavType };
type State = { [key in Id]: StateValue };
const defaultState: State = {
	dealID: {
		value: getStoredValue("dealId"),
		state: "folder",
	},
	inventoryID: {
		value: getStoredValue("inventoryId"),
		state: "folder",
	},
	salesmanID: {
		value: getStoredValue("salesmanId"),
		state: "folder",
	},
	accountID: {
		value: getStoredValue("accountId"),
		state: "folder",
	},
	paymentID: {
		value: getStoredValue("paymentId"),
		state: "folder",
	},
};

export const selectedStates = writable(defaultState);

export const inventoryID = derived(selectedStates, (s) => s.inventoryID);
export const accountID = derived(selectedStates, (s) => s.accountID);

export const handleSelect = (k: BaseId, value: string, state: NavType) => {
	console.log("Selecting", k, value, state);
	selectedStates.update((s) => {
		const key = `${k}ID`;
		return {
			...s,
			[key]: {
				value,
				state: state || s[key].state,
			},
		};
	});
};

const handleNav = (k: Id, v: StateValue) => {
	console.log("Updating", v, k);
	if (!browser || !v) return;
	localStorage.setItem(k, v.value);

	if (k === "accountID") {
		handleAccNav({
			url: window.location.href,
			account: v.value,
			navType: v.state,
		});
	} else if (k === "inventoryID") {
		handleInvNav({ url: window.location.href, vin: v.value, navType: v.state });
		return;
	}
};

accountID.subscribe((v) => {
	handleNav("accountID", v);
});

inventoryID.subscribe((v) => {
	handleNav("inventoryID", v);
});
