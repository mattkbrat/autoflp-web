import { assert, describe, expect, it } from "vitest";
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

	// console.log(
	// 	billing
	// 		.filter((b) => b.payments.length)
	// 		.slice(0, 5)
	// 		.map((b) => {
	// 			return {
	// 				b: b.account.contact,
	// 				pmt: JSON.stringify(b.payments, null, 2),
	// 			};
	// 		}),
	// );
	it("has at most three billing statements per group", () => {
		const fullGrops = descGroups.filter((g) => g.length === 3).length;
		expect(fullGrops).toBeGreaterThan(0);
		for (const group of descGroups) {
			expect(group.length).toBeLessThanOrEqual(3);
			expect(group.length).toBeGreaterThan(0);
		}
		let lastGroupLength = descGroups[0].length;
		for (const group of descGroups) {
			expect(group.length).toBeLessThanOrEqual(lastGroupLength);
			lastGroupLength = group.length;
		}
	});

	it("gets grouped billable accounts in descending order by total delinquent", async () => {
		expect(Array.isArray(descGroups)).toBeTruthy();
		expect(descGroups.length).toBeGreaterThan(0);

		for (const group of descGroups) {
			console.log("checking", group);
			for (let i = 0; i < group.length; i++) {
				const a = group[i];
				const b = group[i + 1];
				if (!a || !b) return;
				expect(a.schedule.totalDiff).toBeGreaterThanOrEqual(
					b.schedule.totalDiff,
				);
			}
		}
	});
	it.skip("gets grouped billable accounts in ascending order by total delinquent", async () => {
		expect(Array.isArray(ascGroups)).toBeTruthy();

		for (const group of ascGroups) {
			console.log("checking", group);
			for (let i = 0; i < group.length; i++) {
				console.log("compare", group[i]);
				const a = group[i];
				const b = group[i + 1];
				if (!a || !b) return;
				expect(a.schedule.totalDiff).toBeGreaterThanOrEqual(
					b.schedule.totalDiff,
				);
			}
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

	it("checks form data", async () => {
		for (const group of descGroups) {
			const schedules = group.map(getBillingParams);
			assert(
				schedules.length <= 3 && schedules.length >= 1,
				"Invalid group length " + schedules.length,
			);

			const formData = fillBilling(schedules as Schedules);

			const hasPayments = group.some((b) =>
				b.schedule.schedule.some((r) => r.paid),
			);
			if (hasPayments) {
				console.log(formData, JSON.stringify(group, null, 2));
				expect(
					!!formData["13"] || !!formData["30"] || !!formData["47"],
				).toBeTruthy();
			}

			for (const g of group) {
				console.log(g.account.account.contact.lastName, g.schedule.schedule);
			}

			expect(formData);
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

	it.runIf(!dev)("generates merged pdf", async () => {
		const generated = await generateMergedBilling("desc");
		const outputPath = join(AUTOFLP_DATA_DIR, generated);
		expect(fs.existsSync(outputPath)).toBeTruthy();
	});
});
