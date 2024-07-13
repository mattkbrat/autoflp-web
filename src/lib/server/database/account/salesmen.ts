import { prisma } from "$lib/server/database";
import type { Prisma } from "@prisma/client";
import { contactSelect, orderContactsBy } from ".";

export const getSalesmen = async () => {
	return prisma.salesman.findMany({
		select: {
			id: true,
			contact: contactSelect,
		},
		orderBy: orderContactsBy,
	});
};
export type Salesmen = Prisma.PromiseReturnType<typeof getSalesmen>;
