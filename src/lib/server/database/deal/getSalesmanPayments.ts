import type { Prisma } from "@prisma/client";
import { prisma } from "..";
import type { AsyncReturnType } from "$lib/types";
import { groupSalesmanPayments } from "$lib/finance";

type SalesmanPaymentsQuery = {
	account?: string;
	accountState?: 0 | 1;
	date?:
		| string
		| {
				gte?: string;
				lte?: string;
		  };
};

export const getSalesmanPayments = async (q?: SalesmanPaymentsQuery) => {
	return prisma.payment.findMany({
		where: {
			deal: {
				state: q?.accountState,

				accountId: q?.account,
			},
			amount: {
				not: undefined,
			},
			date: q?.date
				? typeof q?.date === "string"
					? {}
					: {
							gte: q.date.gte,
							lte: q.date.lte,
						}
				: undefined,
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
		orderBy: [
			{
				date: "asc",
			},
		],
	});
};

export const getCashDeals = async (q?: SalesmanPaymentsQuery) => {
	return prisma.deal.findMany({
		include: {
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
		orderBy: {
			state: "asc",
		},
		where: {
			date: q?.date
				? typeof q?.date === "string"
					? {}
					: {
							gte: q.date.gte,
							lte: q.date.lte,
						}
				: undefined,
			cash: {
				gte: "0.00",
			},
			OR: [
				{
					lien: {
						lte: "0.00",
					},
				},
				{
					lien: null,
				},
			],
		},
	});
};
export type CashDeals = Prisma.PromiseReturnType<typeof getCashDeals>;

export type SalesmanPayments = Prisma.PromiseReturnType<
	typeof getSalesmanPayments
>;

export type SalemanPaymentsGroupBy = {
	month?: boolean;
	year?: boolean;
	quarter?: boolean;
	salesman?: boolean;
};

export const getGroupedSalesmanPayments = async (
	q?: SalesmanPaymentsQuery & { groupBy: SalemanPaymentsGroupBy },
) => {
	const cashDeals = await getCashDeals(q);
	return getSalesmanPayments(q).then((r) =>
		groupSalesmanPayments(r, cashDeals, q?.groupBy),
	);
};

export type GroupedSalesmanPayments = AsyncReturnType<
	typeof getGroupedSalesmanPayments
>;
