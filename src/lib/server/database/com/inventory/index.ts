import { comClient } from "$lib/server/database";
import type { Prisma } from "@prisma/client";
export const getCurrentInventory = async () => comClient.inventory.findMany({});

export const getSingleInventory = async (id: number) => {
	return comClient.inventory.findUnique({
		where: { id },
		include: { images: true },
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
