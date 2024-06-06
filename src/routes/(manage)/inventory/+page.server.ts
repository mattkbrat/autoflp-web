import { handleFetch, parseNHTSA } from "$lib/server/inventory";
import { redirect } from "@sveltejs/kit";

export const load = ({ locals }) => {
	return redirect(307, "/inventory/new");
};

export const actions = {
	search: async ({ request }) => {
		const data = await request.formData();
		const vin = data.get("vin") as string;
		if (!vin) return null;
		const searched = await handleFetch(vin);
		const parsed = parseNHTSA(searched);

		return parsed ? { ...parsed } : null;
	},

	random: async () => {
		if (import.meta.env.PROD) return {};
		return fetch("https://randomvin.com/getvin.php?type=fake")
			.then((res) => {
				if (!res.ok) return;
				return res.text();
			})
			.then((vin) => {
				if (!vin) return;
				return { vin };
			});
	},
};
