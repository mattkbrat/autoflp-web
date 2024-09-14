import { prisma } from "$lib/server/database";
import type { Prisma } from "@prisma/client";
import type { AsyncReturnType } from "$lib/types";
import { fullNameFromPerson } from "$lib/format";
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
					contact: {
						select: {
							firstName: true,
							lastName: true,
							namePrefix: true,
							nameSuffix: true,
							middleInitial: true,
						},
					},
				},
			},
			inventory: {
				select: {
					make: true,
					model: true,
					vin: true,
				},
			},
		},
		orderBy: [
			{
				account: {
					contact: {
						lastName: "asc",
					},
				},
			},
			{
				state: "desc",
			},
			{
				inventory: {
					make: "asc",
				},
			},
			{
				inventory: {
					model: "asc",
				},
			},
			{
				date: "desc",
			},
		],
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

export const groupDeals = (deals: Deals) => {
	return deals.reduce(
		(acc, curr) => {
			const key = fullNameFromPerson({
				person: curr.account.contact,
			}).toUpperCase();

			const { account, ...thisDeal } = curr;
			// console.log(key, { curr });
			if (!acc[key]) {
				acc[key] = [thisDeal];
			} else {
				acc[key].push(thisDeal);
			}

			return acc;
		},
		{} as { [key: string]: Omit<Deals[number], "account">[] },
	);
};

export const getAndGroupDeals = async () => {
	return getDeals().then(groupDeals);
};

export const getOpenInventoryDeals = async (vin: string) => {
	return prisma.deal.findMany({
		where: {
			inventoryId: vin,
			state: 1,
		},
	});
};

export const getBilling = async () => {
	return prisma.deal.findMany({
		where: {
			state: 1,
			AND: [
				{
					lien: {
						not: null,
					},
				},
				{
					lien: {
						not: "0",
					},
				},
			],
		},
		include: {
			account: {
				select: {
					contact: true,
				},
			},
			payments: {
				select: {
					amount: true,
					date: true,
				},
			},
		},
	});
};

export type Deals = Prisma.PromiseReturnType<typeof getDeals>;
export type SimpleDeal = Prisma.PromiseReturnType<typeof getDeal>;
export type DetailedDeal = Prisma.PromiseReturnType<typeof getDetailedDeal>;
export type GroupedDeals = AsyncReturnType<typeof getAndGroupDeals>;
export type BillingAccounts = AsyncReturnType<typeof getBilling>;
