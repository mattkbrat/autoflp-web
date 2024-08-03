import { comClient } from "$lib/server/database";
import type { Prisma } from "@prisma/client";
import type { Image } from "@prisma/autosales";
export const getCurrentInventory = async () => comClient.inventory.findMany({});

export const getSingleInventory = async (id: number) => {
	return comClient.inventory.findUnique({
		where: { id },
		include: {
			images: {
				orderBy: {
					order: "asc",
				},
			},
		},
	});
};

export const getSingleImage = async ({
	id,
	url,
}: { id?: number; url?: string }) => {
	return comClient.image.findFirst({
		where: id ? { id } : url ? { url } : undefined,
		include: {
			Inventory: true,
		},
	});
};

export const insertInventoryImage = async (data: Partial<Image>) => {
	const { url } = data;
	if (!url) {
		throw new Error("Must provide url");
	}
	if (!data.inventory) {
		throw new Error("Must link image to inventory");
	}
	return comClient.image.upsert({
		where: {
			url,
		},
		create: {
			...data,
			url,
		},
		update: data,
	});
};

export const updateInventoryImage = async (
	id: number,
	data: Partial<Image>,
) => {
	return comClient.image.update({
		where: {
			id,
		},
		data,
	});
};

export type ComInventory = Prisma.PromiseReturnType<typeof getCurrentInventory>;

export type ComSingleInventory = Prisma.PromiseReturnType<
	typeof getSingleInventory
>;

export type ComInventoryWithUrl = (ComInventory[number] & { url: string })[];
export type ComSingleInventoryWithUrl = (ComSingleInventory & {
	url: string;
})[];
