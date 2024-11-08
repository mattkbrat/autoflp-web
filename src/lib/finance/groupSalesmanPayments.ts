import { formatSalesmen } from "$lib/format";
import type {
	SalemanPaymentsGroupBy,
	SalesmanPayments,
} from "$lib/server/database/deal";
import { formatDate } from "date-fns";

export const groupSalesmanPayments = (
	payments: SalesmanPayments,
	q?: SalemanPaymentsGroupBy,
) => {
	return payments?.reduce(
		(acc, curr) => {
			const date = new Date(curr.date);
			const salesman =
				formatSalesmen(curr.deal.inventory.inventory_salesman, "contact") ||
				"Unasigned";
			const dateKey =
				q?.month || q?.year || q?.quarter
					? formatDate(
							date,
							q.quarter
								? "QQQ yyyy"
								: `${q?.month ? "MM" : ""}${q?.year && q?.month ? "-" : ""}${
										q?.year ? "yyyy" : ""
									}`,
						)
					: "";

			const amount = Number(curr.amount);

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

			return acc;
		},
		{} as { [key: string]: { [key: string]: number[] } },
	);
};
