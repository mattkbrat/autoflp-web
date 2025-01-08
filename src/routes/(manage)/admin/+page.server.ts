import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { generateMergedBilling } from "$lib/server/deal";
import { getDetailedDeals } from "$lib/server/database/deal";
import { formatInventory, fullNameFromPerson } from "$lib/format";
import type { MappedDeals } from "./types";
import type { Inventory } from "@prisma/client";
import { prisma } from "$lib/server/database";
import { randomUUID } from "node:crypto";

export const load: PageServerLoad = async ({ url }) => {
	const p = url.searchParams;
	const includeAll = p.get("all") === "true";
	const page = p.get("page");

	const deals = await getDetailedDeals(
		!includeAll
			? {
					state: 1,
				}
			: undefined,
		page
			? {
					items: 100,
					start: Number(page || 0),
				}
			: undefined,
	);

	const dealRows = deals.reduce((acc, opt) => {
		acc.push({
			id: opt.id,
			date: opt.date,
			state: opt.state as 0 | 1,
			contact: fullNameFromPerson({
				person: opt.account.contact,
			}).toLowerCase(),
			salesmen: opt.inventory.inventory_salesman.map((s) => s.salesmanId),
			inventory: formatInventory(opt.inventory as Inventory).toLowerCase(),
			pmt: opt.pmt ? Number(opt.pmt) : 0,
		});
		return acc;
	}, [] as MappedDeals);

	return { deals: dealRows };
};

export const actions = {
	printBilling: async ({ request }) => {
		const formData = await request.formData();
		const ids = formData.getAll("id").filter((r) => typeof r === "string");
		const data = await generateMergedBilling("desc", undefined, ids);

		return { built: data };
	},
	updateSalesmen: async ({ request }) => {
		const formData = await request.formData();
		const keys = (formData.get("deals") as string).split(",");
		const updates = keys.reduce(
			(acc, k) => {
				if (k in acc) {
					return acc;
				}

				const salesmen = formData.getAll(k) as string[];
				acc[k] = salesmen || [];

				return acc;
			},
			{} as { [deal: string]: string[] },
		);

		await prisma.$transaction(async (tx) => {
			for (const [dealId, inventory] of Object.entries(updates)) {
				const deal = await tx.deal.findUnique({
					where: {
						id: dealId,
					},
					select: {
						inventoryId: true,
					},
				});

				if (!deal) {
					console.error("no deal by id", deal);
					continue;
				}

				await tx.inventorySalesman.deleteMany({
					where: {
						vin: deal.inventoryId,
					},
				});

				for (const id of inventory) {
					await tx.inventorySalesman.create({
						data: {
							id: randomUUID(),
							vin: deal.inventoryId,
							salesmanId: id,
						},
					});
				}
			}
		});
	},
} satisfies Actions;
