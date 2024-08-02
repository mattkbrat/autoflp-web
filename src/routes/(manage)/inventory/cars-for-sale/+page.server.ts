import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import {
	getCurrentInventory,
	type ComInventory,
} from "$lib/server/database/com/inventory";
import { getInventory } from "$lib/server/database/inventory";
import type { GroupedComInv, MissingVins } from "$lib/types";

const getProdUrl = (id: ComInventory[number]["id"]) => {
	return `${dev ? env.COM_URL_DEV : env.COM_URL_PROD}/cars-for-sale/${id}`;
};

export const load = async () => {
	const currentInventory = await getCurrentInventory();
	const localInventory = await getInventory(1);
	console.log({ currentInventory });

	const missingVins: MissingVins = [];
	const grouped = localInventory.reduce((acc, local) => {
		const matching = currentInventory.find(
			(i) => i.vin?.toLowerCase() === local.vin,
		);
		if (!matching) {
			missingVins.push({
				type: "local",
				id: local.vin,
				description: `${local.year} ${local.make} ${local.model}`,
			});
			return acc;
		}
		const url = getProdUrl(matching.id);
		acc.push({
			com: {
				...matching,
				url,
			},
			local,
		});
		return acc;
	}, [] as GroupedComInv);

	for (const inv of currentInventory) {
		if (grouped.some((v) => v.com?.id === inv.id)) continue;

		missingVins.push({
			type: "com",
			id: inv.id,
			description: inv.title || inv.make || inv.id.toString(),
		});
	}

	return { grouped, missingVins };
};
