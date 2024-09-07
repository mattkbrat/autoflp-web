import { comClient } from "$lib/server/database";
import type { Prisma } from "@prisma/client";
import type { Image, Inventory, InventoryImage } from "@prisma/autosales";
export const getCurrentInventory = async () => comClient.inventory.findMany({});

export const getSingleInventory = async (id: number) => {
	return comClient.inventory.findUnique({
		where: { id },
		include: {
			inventoryImages: {
				select: {
					image: true,
				},
				orderBy: {
					order: "asc",
				},
			},
		},
	});
};

export const updateInventory = async (id: number, data: Partial<Inventory>) => {
	console.log("Update com inv", { id, data });
	return comClient.inventory.update({ where: { id }, data });
};

export const getSingleImage = async ({
	id,
	url,
}: { id?: number; url?: string }) => {
	return comClient.image.findFirst({
		where: id ? { id } : url ? { url } : undefined,
		include: {
			inventoryImages: {
				select: {
					inventory: true,
				},
			},
		},
	});
};

export const deleteImage = async ({ id }: { id: number }) => {
	return comClient.image.delete({
		where: { id },
	});
};

export const deleteImages = async ({ ids }: { ids: number[] }) => {
	return comClient.image.deleteMany({
		where: { id: { in: ids } },
	});
};

export const upsertInventoryImage = async ({
	image,
	invImage,
}: {
	image: Partial<Image> & { id?: number };
	invImage: Partial<InventoryImage> & { id?: number };
}) => {
	if (image.id) {
		return comClient.$transaction([
			comClient.image.update({
				where: {
					id: image.id,
				},
				data: image,
			}),
			comClient.inventoryImage.update({
				where: {
					id: invImage.id,
				},
				data: invImage,
			}),
		]);
	}
	return comClient.$transaction(async (tx) => {
		const { url } = image;
		if (!url) {
			throw new Error("Must provide image URL");
		}
		image.url = url;
		const newImage = await tx.image.create({
			data: {
				...image,
				url,
			},
		});
		invImage.imageId = newImage.id;
		await tx.inventoryImage.update({
			where: {
				id: invImage.id,
			},
			data: invImage,
		});
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
