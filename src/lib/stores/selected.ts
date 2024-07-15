import { browser } from "$app/environment";
import { handleAccNav, handleInvNav, type NavType } from "$lib/navState";
import { derived, writable } from "svelte/store";

const getStoredValue = (key: string) => {
	return (browser && localStorage.getItem(key)) || "";
};

const ids = [
	"deal",
	"inventory",
	"salesman",
	"account",
	"payment",
	"creditor",
] as const;

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
	creditorID: {
		value: getStoredValue("creditorID"),
		state: "folder",
	},
};

export const selectedStates = writable(defaultState);

export const dealID = derived(selectedStates, (s) => s.dealID);
export const inventoryID = derived(selectedStates, (s) => s.inventoryID);
export const accountID = derived(selectedStates, (s) => s.accountID);
export const creditorID = derived(selectedStates, (s) => s.creditorID);
export const paymentID = derived(selectedStates, (s) => s.paymentID);

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

export const handleNav = (k: Id, v: StateValue) => {
	if (!browser || !v) return;
	const hasChanged = localStorage.getItem(k) !== v.value;
	if (!hasChanged) {
		return;
	}

	console.log("Updating", v, k);
	const url = window.location.toString();
	localStorage.setItem(k, v.value);
	const kFormatted = k.replaceAll("ID", "");

	if (kFormatted === "inventory") {
		handleInvNav({ url, vin: v.value, navType: v.state });
	} else {
		handleAccNav({
			url,
			account: v.value,
			navType: v.state,
			accType: kFormatted,
		});
	}
};

accountID.subscribe((v) => {
	handleNav("accountID", v);
});

creditorID.subscribe((v) => {
	handleNav("creditorID", v);
});

inventoryID.subscribe((v) => {
	handleNav("inventoryID", v);
});

paymentID.subscribe((v) => {
	handleNav("paymentID", v);
});

dealID.subscribe((v) => {
	handleNav("dealID", v);
});
