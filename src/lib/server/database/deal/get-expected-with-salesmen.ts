import {
	addressFromPerson,
	formatCurrency,
	formatInventory,
	fullNameFromPerson,
} from "$lib/format";
import { getSalesmen } from "$lib/server/database/account";
import { siteUrl } from "$lib/server/env";
import { sumPayments } from "$lib/sum";
import type { AsyncReturnType } from "$lib/types";
import type { Inventory } from "@prisma/client";
import { addMonths, differenceInWeeks, formatDate, isAfter } from "date-fns";
import { getMonthlyOpenDeals } from "./getDeals";

export type AccountDetail = {
	name: string;
	vehicle: string;
	link: string;
	phone: string;
	lastPaid: string;
	address: string;
};

export type DateFilter = {
	lte?: string;
	gte?: string;
};

export const getExpectedWithSalesmen = async (q?: DateFilter) => {
	const now = new Date();
	const salesmen = await getSalesmen().then((s) => {
		return s.map((s) => {
			return {
				id: s.id,
				contact: fullNameFromPerson({ person: s.contact }),
			};
		});
	});
	const expected = await getMonthlyOpenDeals(q);

	return expected.reduce(
		(acc, curr) => {
			if (!curr.pmt) return acc;
			const lastPaid = curr.payments.slice(-1)[0];

			const lastPaidWeeks = lastPaid
				? Math.abs(differenceInWeeks(lastPaid.date, q?.gte || now))
				: null;
			const matchingSalesman =
				salesmen
					.filter((s) =>
						curr.inventory.inventory_salesman.some(
							(s2) => s.id === s2.salesman.id,
						),
					)
					.map((i) => i.contact)
					.join("; ") || "Unasigned";

			const expected = Number(curr.pmt);

			const hasPaid = lastPaidWeeks != null && lastPaidWeeks <= 4;
			const paid = sumPayments(
				q?.gte
					? curr.payments.filter((p) => {
							isAfter(q.gte as string, p.date);
						})
					: curr.payments,
			);

			// console.log(lastPaidWeeks, { hasPaid, paid }, lastPaid, curr.payments);

			const accountName = fullNameFromPerson({
				person: curr.account.contact,
			});

			const address = addressFromPerson(curr.account.contact);
			const firstExpected = addMonths(curr.date, 1);

			const expectedInWeeks = differenceInWeeks(firstExpected, now);

			const thisDetail = {
				name: accountName,
				vehicle: formatInventory(curr.inventory as Partial<Inventory>),
				link: `${siteUrl}/payments/${curr.account.id}/${curr.id}`,

				address: address.full,
				lastPaid: (lastPaid
					? [
							"Paid",
							formatCurrency(lastPaid.amount),

							lastPaidWeeks === 0
								? "recently"
								: `${lastPaidWeeks} weeks ${q?.gte ? `From ${q.gte}` : "ago"}`,
						]
					: [
							"Expected ",
							formatCurrency(curr.pmt),
							"by",
							formatDate(firstExpected, "MMM. do ''yy"),
							`(${[
								Math.abs(expectedInWeeks),
								"weeks",

								expectedInWeeks < 0
									? `ago: ~ $${formatCurrency(
											Math.min(
												Math.round((expectedInWeeks * -1) / 4) *
													Number(curr.pmt),
												Number(curr.lien),
											),
										)}`
									: "from now",
							].join(" ")})`,
						]
				).join(" "),
				phone: curr.account.contact.phonePrimary,
			} satisfies AccountDetail;

			if (matchingSalesman in acc) {
				acc[matchingSalesman].expected += expected;
				acc[matchingSalesman].paid += paid;
				acc[matchingSalesman][hasPaid ? "paidAccounts" : "unpaidAccounts"].push(
					thisDetail,
				);
			} else {
				acc[matchingSalesman] = {
					expected,
					paid,
					paidAccounts: paid ? [thisDetail] : [],
					unpaidAccounts: paid ? [] : [thisDetail],
				};
			}
			return acc;
		},
		{} as {
			[key: string]: {
				paid: number;
				expected: number;
				paidAccounts: AccountDetail[];
				unpaidAccounts: AccountDetail[];
			};
		},
	);
};

export type ExpectedWithPayments = AsyncReturnType<
	typeof getExpectedWithSalesmen
>;
