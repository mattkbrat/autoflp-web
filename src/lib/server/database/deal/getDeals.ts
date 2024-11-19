import { prisma } from "$lib/server/database";
import type { Prisma } from "@prisma/client";
import type { AsyncReturnType } from "$lib/types";
import { fullNameFromPerson } from "$lib/format";
import { endOfMonth, startOfMonth } from "date-fns";
import type { DateFilter } from "./get-expected-with-salesmen";
type DealQuery = Prisma.DealFindUniqueArgs["where"];

export const getMonthlyOpenDeals = async (q?: DateFilter) => {
	const dateFilter = {
		gte: startOfMonth(q?.gte ? new Date(q.gte) : new Date())
			.toISOString()
			.split("T")[0],
		lte:
			q?.gte || q?.lte
				? endOfMonth(new Date(q.gte || q.lte || 0))
						.toISOString()
						.split("T")[0]
				: undefined,
	};

	return prisma.deal.findMany({
		where: {
			state: 1,
			date: {
				lte: dateFilter.lte,
			},
		},
		select: {
			pmt: true,
			id: true,
			date: true,
			account: {
				select: {
					id: true,
					contact: {
						select: {
							phonePrimary: true,
							firstName: true,
							lastName: true,
						},
					},
				},
			},
			inventory: {
				select: {
					make: true,
					model: true,
					year: true,
					vin: true,
					inventory_salesman: {
						select: {
							salesman: {
								select: {
									id: true,
								},
							},
						},
					},
				},
			},
			payments: {
				select: {
					amount: true,
					date: true,
				},
				where: {
					date: dateFilter,
				},
			},
		},
		orderBy: {
			pmt: "desc",
		},
	});
};

export const getDeals = async (account?: string, state?: number) => {
	return prisma.deal.findMany({
		where: {
			accountId: account,
			state,
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
			inventory: {
				include: {
					inventory_salesman: {
						select: {
							salesman: {
								select: {
									contact: {
										select: {
											firstName: true,
											lastName: true,
										},
									},
								},
							},
						},
					},
				},
			},
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

export const getOpenInventoryDeals = async (
	vin: string,
	query?: {
		exclude?: string[];
	},
) => {
	return prisma.deal.findMany({
		where: {
			inventoryId: vin,
			state: 1,
			id: query?.exclude
				? {
						notIn: query.exclude,
					}
				: undefined,
		},
	});
};

export const getBilling = async () => {
	return prisma.deal.findMany({
		where: {
			AND: [
				{
					state: 1,
				},
				{
					pmt: {
						not: null,
					},
				},
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
			inventory: {
				select: {
					make: true,
					year: true,
				},
			},
			payments: {
				select: {
					amount: true,
					date: true,
					id: true,
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
