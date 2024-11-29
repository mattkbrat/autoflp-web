import { getSalesmen } from "$lib/server/database/account";
import { formatInventory, fullNameFromPerson } from "$lib/format";
import { sumPayments } from "$lib/sum";
import { getMonthlyOpenDeals } from "./getDeals";
import type { AsyncReturnType } from "$lib/types";
import { siteUrl } from "$lib/server/env";
import type { Inventory } from "@prisma/client";

type AccountDetail = {
	name: string;
	vehicle: string;
	link: string;
	phone: string;
};

export type DateFilter = {
	lte?: string;
	gte?: string;
};

export const getExpectedWithSalesmen = async (q?: DateFilter) => {
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
			const paid = sumPayments(curr.payments);

			const accountName = fullNameFromPerson({
				person: curr.account.contact,
			});

			const thisDetail = {
				name: accountName,
				vehicle: formatInventory(curr.inventory as Partial<Inventory>),
				link: `${siteUrl}/payments/${curr.account.id}/${curr.id}`,
				phone: curr.account.contact.phonePrimary,
			} satisfies AccountDetail;

			if (matchingSalesman in acc) {
				acc[matchingSalesman].expected += expected;
				acc[matchingSalesman].paid += paid;
				acc[matchingSalesman][paid ? "paidAccounts" : "unpaidAccounts"].push(
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
