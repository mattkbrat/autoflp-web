import type { Prisma } from "@prisma/client/edge";
import { prisma } from "..";
import { randomUUID } from "node:crypto";
import { sendInventoryNotification } from "$lib/server/notify";

const includeInvSalesman = (alwaysIncludeSalesmen = false) => {
	return {
		select: {
			salesman: {
				select: {
					contact: {
						select: {
							id: true,
							lastName: true,
							firstName: true,
						},
					},
				},
			},
		},
		where: alwaysIncludeSalesmen
			? undefined
			: {
					inventory: {
						state: 1,
					},
				},
		orderBy: {
			salesman: {
				contact: {
					lastName: "asc" as const,
				},
			},
		},
	};
};

export const getInventory = async (state: 0 | 1 | null) => {
	return prisma.inventory.findMany({
		where: {
			state: state || undefined,
		},
		include: {
			inventory_salesman: includeInvSalesman(),
		},
		orderBy: [
			{
				make: "desc",
			},
			{
				model: "asc",
			},
		],
	});
};

export const getSingleInventory = async ({
	id,
	vin,
}: { id?: string; vin?: string }) => {
	return prisma.inventory.findUnique({
		where: vin
			? {
					vin,
				}
			: { id },
		include: {
			inventory_salesman: includeInvSalesman(true),
		},
	});
};

export type Inventory = NonNullable<
	Prisma.PromiseReturnType<typeof getSingleInventory>
>;

export type AllInventory = Prisma.PromiseReturnType<typeof getInventory>;

export type InventoryField = keyof Inventory;

export const upsertInventory = async (
	i: Exclude<Partial<Inventory>, "inventory_salesman">,
	actions: {
		notify?: boolean;
		excludeCloseDeals?: string[];
	} = {
		notify: true,
		excludeCloseDeals: [],
	},
) => {
	const exists = i.vin && (await getSingleInventory({ vin: i.vin }));
	if (exists) {
		return prisma.$transaction(async (tx) => {
			const updated = await tx.inventory.update({
				where: { vin: exists.vin },
				data: i,
			});
			if (updated.state === 1) {
				return updated;
			}
			await tx.deal.updateMany({
				where: {
					inventoryId: exists.vin,
					id: { notIn: actions.excludeCloseDeals },
				},
				data: { state: 0 },
			});

			if (actions.notify) {
				sendInventoryNotification({ inventory: updated, type: "update" });
			}
			return updated;
		});
	}

	const id = i.id || randomUUID();
	const { vin, year, make } = i;
	if (!vin || !year || !make) {
		return new Error("Must provide vin, year, and make");
	}
	return prisma.inventory
		.create({ data: { ...i, id, vin, year, make } })
		.then((i) => {
			if (actions.notify) {
				sendInventoryNotification({ inventory: i, type: "create" });
			}
			return i;
		});
};

export const deleteInventory = async (vin: string) => {
	return prisma.inventory.delete({ where: { vin } }).then((i) => {
		sendInventoryNotification({ inventory: i, type: "delete" });
		return i;
	});
};
