import { describe, expect, it } from "vitest";
import {
	generateBilling,
	generateMergedBilling,
	getBillingParams,
	getGroupedBillableAccounts,
} from "./billing";
import { fillBilling, type Schedules } from "../form/builder/BILLING";
import fs from "node:fs";
import { AUTOFLP_DATA_DIR } from "..";
import { join } from "node:path";
import { getBilling } from "../database/deal";
import { dev } from "$app/environment";

describe("Can run billing", async () => {
	const billing = await getBilling();
	const descGroups = await getGroupedBillableAccounts("desc", billing);
	const ascGroups = await getGroupedBillableAccounts("asc", billing);

	it("has at most three billing statements per group", () => {
		for (const group of descGroups) {
			expect(group.length).toBeLessThanOrEqual(3);
			expect(group.length).toBeGreaterThan(0);
		}
	});

	it("gets grouped billable accounts in descending order by total delinquent", async () => {
		expect(Array.isArray(descGroups)).toBeTruthy();

		for (let i = 0; i++; i < descGroups[0].length) {
			const a = descGroups[0][i];
			const b = descGroups[0][i + 1];
			if (!a || !b) return;
			expect(a.schedule.totalDiff).toBeGreaterThan(b.schedule.totalDiff);
		}
	});
	it("gets grouped billable accounts in ascending order by total delinquent", async () => {
		expect(Array.isArray(ascGroups)).toBeTruthy();

		for (let i = 0; i++; i < ascGroups[0].length) {
			const a = ascGroups[0][i];
			const b = ascGroups[0][i + 1];
			if (!a || !b) return;
			expect(a.schedule.totalDiff).toBeLessThan(b.schedule.totalDiff);
		}
	});

	it("can generate correct billing groups", async () => {
		for (const group of descGroups.slice(0, 1)) {
			const schedules = group.map(getBillingParams);
			if (schedules.length > 3 || schedules.length < 1) {
				throw new Error("Invalid group");
			}
			const formData = fillBilling(schedules as Schedules);

			const length = Object.keys(formData).length - 2; // Two empty fields
			const mod = length % 17;

			expect(mod === 0).toBeTruthy();
			expect([1, 2, 3].includes(length / 17)).toBeTruthy();

			for (const v of Object.values(formData)) {
				expect(v).toBeTypeOf("string");
				expect(typeof v === "string" && v.toLowerCase()).not.includes(
					"undefined",
				);
			}
		}
	});

	it.runIf(dev)("generates individual pdfs", async () => {
		const generated = await generateBilling();
		expect(generated).toBeInstanceOf(Array);
		for (const doc of generated) {
			const outputPath = join(AUTOFLP_DATA_DIR, doc);
			expect(fs.existsSync(outputPath)).toBeTruthy();
		}
	});

	it.runIf(dev)("generates merged pdf", async () => {
		const generated = await generateMergedBilling("desc");
		const outputPath = join(AUTOFLP_DATA_DIR, generated);
		expect(fs.existsSync(outputPath)).toBeTruthy();
	});
});
