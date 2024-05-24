import { goto } from "$app/navigation";

type InvNavState = {
	url: URL;
	state?: string | null;
	vin?: string;
};

export const handleInvNav = ({ url, state, vin }: InvNavState) => {
	const newUrl = new URL(url);
	if (vin) {
		newUrl.pathname = `/inventory/${vin}`;
	}
	if (state) {
		newUrl.searchParams.set("state", state);
	} else if (state === null) {
		newUrl.searchParams.delete("state");
	}

	goto(newUrl);
};
