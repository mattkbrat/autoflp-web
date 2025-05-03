import { prisma } from "$lib/server/database";
import type { Prisma } from "@prisma/client";
import { contactSelect, orderContactsBy } from ".";

export const getCreditors = async () => {
	return prisma.creditor.findMany({
		select: {
			id: true,
			apr: true,
			businessName: true,
			filingFees: true,
			contact: contactSelect,
		},
		orderBy: orderContactsBy,
	});
};

export const getCreditor = async ({ id }: { id: string }) => {
	return prisma.creditor.findUnique({
		where: { id },
		include: { contact: contactSelect },
	});
};
export type Creditors = Prisma.PromiseReturnType<typeof getCreditors>;
