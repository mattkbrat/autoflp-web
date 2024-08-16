import { dealAmortization } from "$lib/finance/amortization";
import { getBilling, type BillingAccounts } from "../database/deal";

const getSchedules = (accounts: BillingAccounts) => {
	return accounts.map((a) => {
		return { account: a.id, schedule: dealAmortization(a, a.payments || []) };
	});
};

const chunkSize = 3;

type Schedule = ReturnType<typeof getSchedules>[number];

type GroupedShedules = Schedule[][];

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

export const getGroupedBillableAccounts = async () => {
	const accounts = await getBilling();
	console.log(accounts.slice(0, 3));
	const schedules = getSchedules(accounts);
	console.log(schedules);
	return chunk(schedules);
};
