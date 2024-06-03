import { goto } from "$app/navigation";
export type NavType = "query" | "folder";
type NavState = {
	url: URL;
	invalidate?: boolean;
	navType?: NavType;
};

type InvNavState = NavState & {
	state?: string | null;
	vin?: string;
};

type AccNavState = NavState & {
	account?: string | null;
};

export const handleInvNav = ({
	url,
	state,
	vin,
	invalidate,
	navType = "folder",
}: InvNavState) => {
	const newUrl = new URL(url);
	console.log(newUrl, navType);
	if (vin) {
		if (navType === "folder") {
			newUrl.pathname = `/inventory/${vin}`;
		} else {
			newUrl.searchParams.set("vin", vin);
		}
	}
	if (state) {
		newUrl.searchParams.set("state", state);
	} else if (state === null) {
		newUrl.searchParams.delete("state");
	}

	goto(newUrl, {
		invalidateAll: invalidate,
	});
};

export const handleAccNav = ({
	url,
	account,
	invalidate,
	navType = "folder",
}: AccNavState) => {
	const newUrl = new URL(url);
	if (typeof account === "string") {
		if (navType === "folder") {
			newUrl.pathname = `/accounts/${account}`;
		} else {
			newUrl.searchParams.set("account", account);
		}
	}

	goto(newUrl, {
		invalidateAll: invalidate,
	});
};
