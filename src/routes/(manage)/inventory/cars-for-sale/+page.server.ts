import { BUSINESS_NAME } from "$env/static/private";
import { getProdUrl } from "$lib/server/com";
import { comClient, prisma } from "$lib/server/database";
import { getCurrentInventory } from "$lib/server/database/com/inventory";
import { getInventory } from "$lib/server/database/inventory";
import type { GroupedComInv, MissingVins } from "$lib/types";
import type { Actions } from "@sveltejs/kit";
import type { Inventory as ComInv } from "@prisma/autosales";
import { applyLocal } from "$lib/inventory";

export const load = async () => {
	const currentInventory = await getCurrentInventory();
	const localInventory = await getInventory(1);
	console.log({ currentInventory });
	const missingVins: MissingVins = [];
	const grouped = localInventory.reduce((acc, local) => {
		const matching = currentInventory.find(
			(i) =>
				i.vin?.toLowerCase().slice(-6) === local.vin.toLowerCase().slice(-6),
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
			description:
				inv.title ||
				[inv.make, inv.model, inv.year, inv.vin].join(" ").trim() ||
				inv.id.toString(),
		});
	}

	return { grouped, missingVins };
};
export const actions = {
	populateProd: async ({ request }) => {
		const data = await request.formData();
		const locals = data.getAll("local") as string[];

		const prod = data.getAll("com");
		console.log("populate prod", { locals, prod });

		if (Array.isArray(locals) && locals.length > 0) {
			const localInv = await prisma.inventory.findMany({
				where: {
					vin: {
						in: locals,
					},
				},
			});
			await comClient.inventory.createMany({
				data: locals.map((vin) => {
					const matchingLocal = localInv.find((i) => i.vin === vin);
					const applied =
						(matchingLocal && applyLocal({}, matchingLocal)) || ({} as ComInv);
					applied.hidden = true;
					applied.price = applied.price || 0;
					applied.business = BUSINESS_NAME;
					return applied as ComInv;
				}),
			});
		}
	},
	markSold: async ({ request }) => {
		const data = await request.formData();
		console.log({ data });
	},
} satisfies Actions;
