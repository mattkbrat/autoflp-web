import { dealAmortization } from "$lib/finance/amortization";
import type { AsyncReturnType } from "$lib/types";
import { getBilling, type BillingAccounts } from "../database/deal";

type SortOrder = "asc" | "desc";

const getSchedules = (
	accounts: BillingAccounts,
	sortDelinquent: SortOrder = "desc",
) => {
	const mapped = accounts.map((a) => {
		return { account: a, schedule: dealAmortization(a, a.payments || []) };
	});

	if (sortDelinquent === "desc") {
		return mapped.sort(
			(
				{ schedule: { totalDelinquent: a } },
				{ schedule: { totalDelinquent: b } },
			) => {
				return b - a;
			},
		);
	}
	return mapped.sort(
		(
			{ schedule: { totalDelinquent: a } },
			{ schedule: { totalDelinquent: b } },
		) => {
			return a - b;
		},
	);
};

const chunkSize = 3;

export type Schedule = ReturnType<typeof getSchedules>[number];

export type GroupedShedules = Schedule[][];

const chunk = (schedules: Schedule[]): GroupedShedules => {
	return schedules.reduce((resultArray, item, index) => {
		const chunkIndex = Math.floor(index / chunkSize);

		if (!resultArray[chunkIndex]) {
			resultArray[chunkIndex] = []; // start a new chunk
		}

		resultArray[chunkIndex].push(item);

		return resultArray;
	}, [] as GroupedShedules);
};

export const getGroupedBillableAccounts = async (
	sortOrder?: SortOrder,
	accountList?: AsyncReturnType<typeof getBilling>,
): Promise<GroupedShedules> => {
	const accounts = accountList || (await getBilling());
	const schedules = getSchedules(accounts, sortOrder);
	return chunk(schedules);
};

export const getBillingParams = (s: GroupedShedules[number][number]) => {
	return {
		schedule: s,
		deal: s.account,
	};
};
