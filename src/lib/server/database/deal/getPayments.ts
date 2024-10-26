import { prisma } from "$lib/server/database";
import type { Prisma } from "@prisma/client";

export const getPayments = async (deal: string) => {
	if (!deal) return [];
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
