import { prisma } from "$lib/server/database";
import type { Prisma } from "@prisma/client";
import type { AsyncReturnType } from "$lib/types";
type DealQuery = Prisma.DealFindUniqueArgs["where"];
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

export const getDeal = async (query: DealQuery) => {
	return prisma.deal.findUnique({ where: query });
};

export const getDetailedDeal = async (query: DealQuery) => {
	return prisma.deal.findUnique({
		where: query,
		include: {
			account: {
				include: {
					contact: true,
				},
			},
			inventory: true,
			creditor: {
				include: {
					contact: true,
				},
			},
			dealCharges: {
				select: {
					charge: true,
				},
			},
			dealSalsemen: {
				select: {
					salesman: {
						include: {
							contact: true,
						},
					},
				},
			},
			dealTrades: {
				select: {
					value: true,
					vin: true,
					inventory: true,
				},
			},
		},
	});
};

export const getAndGroupDeals = async () => {
	return getDeals().then((deals) => {
		return deals.reduce(
			(acc, curr) => {
				const key = `${curr.account.contact.lastName} ${curr.account.contact.firstName}`;

				if (key in acc) {
					return acc;
				}

				const { account, ...thisDeal } = curr;
				if (!acc[key]) {
					acc[key] = [thisDeal];
				} else {
					acc[key].push(thisDeal);
				}

				return acc;
			},
			{} as { [key: string]: Omit<Deals[number], "account">[] },
		);
	});
};

export const getOpenInventoryDeals = async (vin: string) => {
	return prisma.deal.findMany({
		where: {
			inventoryId: vin,
			state: 1,
		},
	});
};

export type Deals = Prisma.PromiseReturnType<typeof getDeals>;
export type SimpleDeal = Prisma.PromiseReturnType<typeof getDeal>;
export type DetailedDeal = Prisma.PromiseReturnType<typeof getDetailedDeal>;
export type GroupedDeals = AsyncReturnType<typeof getAndGroupDeals>;
