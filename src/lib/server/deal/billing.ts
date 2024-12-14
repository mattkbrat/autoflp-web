import type { AsyncReturnType } from "$lib/types";
import { writeFileSync } from "node:fs";
import {
	closeUnbillableDeals,
	getBilling,
	type BillingAccounts,
} from "../database/deal";
import type { GenerateFormParams } from "../form";
import { fillBilling, type Schedules } from "../form/builder/BILLING";
import { mergePdfs } from "../form/merge";
import { join } from "node:path";
import { AUTOFLP_DATA_DIR } from "..";
import { cleanup } from "../form/cleanupBillingDir";
import { dev } from "$app/environment";
import { generate } from "../form/generate";
import { getPaymentSchedule } from "$lib/finance/payment-history";

type SortOrder = "asc" | "desc";

const getSchedules = (
	accounts: BillingAccounts,
	sortDelinquent: SortOrder = "desc",
) => {
	const mapped = accounts.map((a) => {
		// console.log("using", a);
		return {
			account: a,
			schedule: getPaymentSchedule(
				{
					apr: Number(a.apr),
					pmt: Number(a.pmt),
					term: Number(a.term),
					balance: Number(a.lien),
					startDate: new Date(a.date),
					finance: Number(a.finance),
				},
				a.payments || [],
				false,
			),
		};
	});

	if (sortDelinquent === "desc") {
		return mapped.sort(
			({ schedule: { totalDiff: a } }, { schedule: { totalDiff: b } }) => {
				return b - a;
			},
		);
	}
	return mapped.sort(
		({ schedule: { totalDiff: a } }, { schedule: { totalDiff: b } }) => {
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

const devCutoff = dev ? 40 : -1;

export const generateMergedBilling = async (
	sort: SortOrder = "desc",
	cutoff = devCutoff,
) => {
	cleanup();
	const billing = await getBilling();
	await closeUnbillableDeals(billing);

	const all = await getGroupedBillableAccounts(sort, billing);
	const groups = cutoff !== -1 ? all.slice(0, cutoff) : all;
	const data = groups.map((group) => {
		const schedules = group.map(getBillingParams);
		if (schedules.length > 3 || schedules.length < 1) {
			throw new Error("Invalid group");
		}
		const formData = fillBilling(schedules as Schedules);
		const p = {
			form: "billing",
			data: formData,
			output: formData["3"],
			attachments: [],
			returnType: "bytes",
		} satisfies GenerateFormParams;

		return p;
	});

	const doc = await mergePdfs(
		data.map((d) => {
			return [d.data, "billing"];
		}),
	);

	const fromRoot = join("documents", "billing-merged.pdf");
	const outputPath = join(AUTOFLP_DATA_DIR, fromRoot);

	return doc.save().then((bytes) => {
		writeFileSync(outputPath, bytes);
		return fromRoot;
	});
};

export const generateBilling = async (
	sort: SortOrder = "desc",
	cutoff = devCutoff,
) => {
	cleanup();
	const billing = await getBilling();
	const all = await getGroupedBillableAccounts(sort, billing);
	const groups = cutoff !== -1 ? all.slice(0, cutoff) : all;
	const generated: string[] = [];
	for (const group of groups) {
		const schedules = group.map(getBillingParams);
		if (schedules.length > 3 || schedules.length < 1) {
			throw new Error("Invalid group");
		}
		const formData = fillBilling(schedules as Schedules);
		const filename = [formData["3"], formData["20"], formData["37"]]
			.filter(Boolean)
			.join("-");
		const output = `billing/${filename}`;
		const p: GenerateFormParams = {
			form: "billing",
			data: formData,
			output,
			attachments: [],
		};
		await generate(p).then((res) => {
			if (!res || !("output" in res)) throw new Error("Invalid result");
			generated.push(res.output);
		});
	}

	return generated;
};
