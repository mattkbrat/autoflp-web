import type { Prisma } from "@prisma/client/edge";
import { prisma } from "..";
import { randomUUID } from "node:crypto";

export const getInventory = async (state: 0 | 1 | null) => {
	return prisma.inventory.findMany({
		where: {
			state: state || undefined,
		},
		include:
			state === 1
				? {
						inventory_salesman: {
							select: {
								salesman: {
									select: {
										contact: {
											select: {
												lastName: true,
												firstName: true,
											},
										},
									},
								},
							},
						},
					}
				: undefined,
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
			inventory_salesman: true,
		},
	});
};

export type Inventory = NonNullable<
	Prisma.PromiseReturnType<typeof getSingleInventory>
>;

export type InventoryField = keyof Inventory;

export const upsertInventory = async (i: Partial<Inventory>) => {
	if (i.vin) {
		const exists = await getSingleInventory({ vin: i.vin });
		if (exists) {
			return prisma.inventory.update({ where: { vin: exists.vin }, data: i });
		}
	}

	const id = i.id || randomUUID();
	const { vin, year, make } = i;
	if (!vin || !year || !make) {
		return new Error("Must provide vin, year, and make");
	}
	return prisma.inventory.create({ data: { ...i, id, vin, year, make } });
};

export const deleteInventory = async (vin: string) => {
	return prisma.inventory.delete({ where: { vin } });
};
