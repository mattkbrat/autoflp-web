import { prisma } from "$lib/server/database";
import type { Prisma } from "@prisma/client";
import { contactSelect, orderContactsBy } from ".";
import { randomUUID } from "node:crypto";

export const getSalesmen = async (state?: 0 | 1) => {
	return prisma.salesman.findMany({
		select: {
			id: true,
			contact: contactSelect,
		},
		where: {
			state,
		},
		orderBy: orderContactsBy,
	});
};
// {deal, salesmen}: {deal: string, salesmen: string[]}
export const editSalesmen = async (updates: { [deal: string]: string[] }) => {
	return prisma.$transaction(async (tx) => {
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
};

export type Salesmen = Prisma.PromiseReturnType<typeof getSalesmen>;
