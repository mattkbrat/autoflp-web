import { prisma } from "$lib/server/database";
import type { Prisma } from "@prisma/client";
import { getDeals } from ".";

export const getPayments = async (deal?: string) => {
	return prisma.payment.findMany({
		where: {
			dealId: deal,
		},
	});
};

type MonthlyPaymentsQuery = {
	month: number;
	year: number;
} & Omit<Prisma.PaymentWhereInput, "date">;

export const getExpectedMonthlyPayments = async () => {
	const openDeals = await getDeals(undefined, 1);

	console.log(openDeals);
};

export const getMonthlyPayments = async (query: MonthlyPaymentsQuery) => {
	const { year, month, ...filter } = query;
	const date = new Date(query.year, query.month, 2);
	return prisma.payment.findMany({
		where: {
			date: {
				startsWith: `${date.getFullYear()}-${date.getMonth()}`,
			},
			...filter,
		},
		include: {
			deal: {
				select: {
					inventory: {
						select: {
							inventory_salesman: {
								select: {
									salesman: {
										select: {
											contact: true,
										},
									},
								},
							},
						},
					},
				},
			},
		},
	});
};

export const sumMonthlyPayments = async (query: MonthlyPaymentsQuery) => {
	return getMonthlyPayments(query).then((payments) => {
		return payments.reduce(
			(acc, curr) => {
				const { amount, dealId } = curr;
				const paid = Number(amount);
				if (dealId in acc) {
					acc[dealId] += paid;
					return acc;
				}
				acc[dealId] = paid;
				return acc;
			},
			{} as { [key: string]: number },
		);
	});
};
