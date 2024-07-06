import { prisma } from "$lib/server/database";
import type { Prisma } from "@prisma/client";
import { getAndGroupDeals } from "./getAndGroupDeals";
import type { AsyncReturnType } from "$lib/types";
export const getPayments = async (deal: string) => {
	if (!deal) return [];
	return prisma.payment.findMany({
		where: {
			dealId: deal,
		},
	});
};

export const getDeals = async (account?: string) => {
	return prisma.deal.findMany({
		where: {
			accountId: account ? account : undefined,
		},
		include: {
			account: {
				select: {
					id: true,
					contact: true,
				},
			},
			inventory: {
				select: {
					make: true,
					model: true,
				},
			},
		},
	});
};

export type Payments = Prisma.PromiseReturnType<typeof getPayments>;
export type Deals = Prisma.PromiseReturnType<typeof getDeals>;
export type GroupedDeals = AsyncReturnType<typeof getAndGroupDeals>;

export { getAndGroupDeals };
