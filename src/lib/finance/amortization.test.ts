import { assert, describe, expect, it } from "vitest";
import { amoritization, type AmortizationParams } from "./amortization";
import { getDeal } from "$lib/server/database/deal";
import { getPercent } from "./getPercent";
import { addMonths } from "date-fns";

describe("can create a schedule", async () => {
	const deal = await getDeal({ id: "af3dc147-cea2-46cd-a25e-3e83c1236a68" });
	assert(!!deal, "deal must be defined by id");
	const balance = Number(deal?.finance);
	const term = Number(deal.term);
	assert(!!balance, "deal must have a lien");
	assert(term > 1, "deal must have a term greater than 1");

	const apr = getPercent(Number(deal.apr));
	assert(Number(apr) < 1, "Invalid apr");

	// console.log("Testing with", deal);
	it("creates a schedule", () => {
		const params: AmortizationParams = {
			term,
			balance,
			apr,
			pmt: Number(deal.pmt),
			startDate: addMonths(new Date(deal.date), 1),
		};
		const { schedule, lastBalance, monthlyRate } = amoritization(params);

		expect(monthlyRate).toBeLessThanOrEqual(1);
		expect(schedule[0].lastBalance).toBeLessThanOrEqual(Number(deal.lien));
		expect(schedule).toBeInstanceOf(Array);
		expect(lastBalance).toEqual(0);
		expect(schedule.length).toEqual(Number(deal.term));
		expect(schedule[0].percentPrincipal).toBeGreaterThan(
			schedule[0].percentInterest,
		);
		expect(schedule[0].percentPrincipal).toBeLessThan(
			schedule[1].percentPrincipal,
		);
	});
});
