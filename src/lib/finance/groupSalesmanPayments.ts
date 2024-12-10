import { formatSalesmen } from "$lib/format";
import type {
	CashDeals,
	SalemanPaymentsGroupBy,
	SalesmanPayments,
} from "$lib/server/database/deal";
import { formatDate } from "date-fns";
// import { writeFileSync } from "fs";

const getDateKey = (date: Date | string, q?: SalemanPaymentsGroupBy) => {
	return q?.month || q?.year || q?.quarter
		? formatDate(
				date,
				q.quarter
					? "QQQ yyyy"
					: `${q?.month ? "MM" : ""}${q?.year && q?.month ? "-" : ""}${
							q?.year ? "yyyy" : ""
						}`,
			)
		: "";
};
export type GroupedSalesmanPayments = {
	[date: string]: {
		[salesman: string]: number[];
	};
};

export const groupSalesmanPayments = (
	payments: SalesmanPayments,
	cashDeals?: CashDeals,
	q?: SalemanPaymentsGroupBy,
) => {
	const totalGrouped: GroupedSalesmanPayments = {};
	const paymentsGrouped = payments?.reduce((acc, curr) => {
		const date = new Date(curr.date);
		const salesman =
			formatSalesmen(curr.deal.inventory.inventory_salesman, "contact") ||
			"Unasigned";

		const amount = Number(curr.amount);
		const dateKey = getDateKey(date, q);

		if (dateKey in acc) {
			if (salesman in acc[dateKey]) {
				acc[dateKey][salesman].push(amount);
			} else {
				acc[dateKey][salesman] = [amount];
			}
		} else {
			acc[dateKey] = {
				[salesman]: [amount],
			};
		}
		if (dateKey in totalGrouped) {
			if (salesman in totalGrouped[dateKey]) {
				totalGrouped[dateKey][salesman].push(amount);
			} else {
				totalGrouped[dateKey][salesman] = [amount];
			}
		} else {
			totalGrouped[dateKey] = {
				[salesman]: [amount],
			};
		}

		return acc;
	}, {} as GroupedSalesmanPayments);

	const cashDealsGrouped: GroupedSalesmanPayments = {};

	if (cashDeals) {
		for (const curr of cashDeals) {
			const date = new Date(curr.date);
			const salesman =
				formatSalesmen(curr.inventory.inventory_salesman, "contact") ||
				"Unasigned";

			const amount = Number(curr.cash);
			if (Number.isNaN(amount)) continue;
			const dateKey = getDateKey(date, q);

			if (dateKey in cashDealsGrouped) {
				if (salesman in cashDealsGrouped[dateKey]) {
					cashDealsGrouped[dateKey][salesman].push(amount);
				} else {
					cashDealsGrouped[dateKey][salesman] = [amount];
				}
			} else {
				cashDealsGrouped[dateKey] = {
					[salesman]: [amount],
				};
			}
			if (dateKey in totalGrouped) {
				if (salesman in totalGrouped[dateKey]) {
					totalGrouped[dateKey][salesman].push(amount);
				} else {
					totalGrouped[dateKey][salesman] = [amount];
				}
			} else {
				totalGrouped[dateKey] = {
					[salesman]: [amount],
				};
			}
		}
	}

	// if (!browser) {
	// 	writeFileSync("./cash.json", JSON.stringify(cashDealsGrouped, null, 2));
	// 	writeFileSync("./total.json", JSON.stringify(totalGrouped, null, 2));
	// 	writeFileSync("./payments.json", JSON.stringify(paymentsGrouped, null, 2));
	// }

	return { paymentsGrouped, cashDealsGrouped, totalGrouped };
};
