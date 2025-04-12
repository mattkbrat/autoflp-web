import { assert, describe, expect, it } from "vitest";
import { amoritization, type AmortizationParams } from "./amortization";
import { addMonths, formatDate } from "date-fns";
import type { DealFields } from "./fields";
import { calcFinance } from "./calc";
import { amortize } from "./amortize";
import { roundToPenny } from "./roundToPenny";

const params: DealFields = {
	dealType: "credit",
	priceSelling: 50_000,
	term: 60,
	apr: 5,
	priceDown: 10_000,
	taxState: 4.9,
	taxCity: 2,
	taxCounty: 2,
	taxRtd: 2.3,
	filingFees: 3_400,
	priceTrade: 0,
	creditor: "",
	date: new Date(2023, 1, 2),
	id: "",
	vin: "",
	account: "",
	trades: [],
	downOwed: 0,
	cosigner: "",
	finance: null,
};

const calced = calcFinance(params);

describe("can create a schedule", async () => {
	assert(calced.type === "credit", "Invalid finance calculation");
	console.log("total", calced.totalCost, { pmt: calced.monthlyPayment });

	const expectedSchedule = amortize({
		amount: calced.financeAmount,
		rate: params.apr,
		totalTerm: params.term,
		amortizeTerm: params.term,
	});

	const expectedTotal = 55481.43;

	console.log("expected", expectedSchedule);

	it("checks expected", () => {
		assert(!("error" in expectedSchedule), "Failed to get expected schedule");

		const pPlusI = expectedSchedule.principal + expectedSchedule.interest;

		expect(pPlusI).toBeCloseTo(expectedTotal);
	});

	// console.log(
	// 	Object.entries(calced).map(([k, v]) => {
	// 		return {
	// 			k,
	// 			amount: Number.isFinite(v) ? formatCurrency(v) : v,
	// 		};
	// 	}),
	// );
	it("checks finance", () => {
		expect(calced.type).toBe("credit");
		expect(calced.financeAmount).toEqual(49_000); // Total loan amount
		expect(calced.totalTaxDollar).toEqual(5_600);
		expect(calced.totalLoan).toBeCloseTo(55_481.43, 2);
		expect(calced.totalCost).toBeCloseTo(65_481.43, 2);
		// expect(calced.lastPaymentDueDate).toBeTruthy(65_481.43, 2);
		// expect(calced.).toEqual(); expect(calced.).toEqual();
	});

	it("creates a schedule with equal expected payments", () => {
		const history = Array.from(new Array(params.term).keys()).map((i) => {
			return {
				id: i.toString(),
				date: formatDate(
					addMonths(calced.firstPaymentDueDate, i - 1),
					"yyyy-MM-dd",
				),
				amount: calced.monthlyPayment.toFixed(2),
			};
		});

		const schedule = amoritization({
			term: params.term,
			balance: calced.financeAmount,
			apr: params.apr,
			pmt: calced.monthlyPayment,
			startDate: params.date,
			history: history,
		});

		// writeFileSync("history.json", JSON.stringify(history, null, 2));

		if (!schedule || "error" in schedule) {
			assert(false, "Invalid schedule");
		}

		console.table(
			schedule.map((s) => {
				return {
					interest: roundToPenny(s.term.interest),
					principal: roundToPenny(s.term.principal),
					pre: roundToPenny(s.preBalance),
					ending: roundToPenny(s.balance),
					pp: s.principalPaymentsTotal || 0,
				};
			}),
		);

		const totalPaid = schedule.reduce((acc, s) => {
			return acc + s.payment;
		}, 0);

		console.log({ total: totalPaid });

		const totals = schedule.reduce(
			(acc, curr) => {
				acc[0] += curr.term.principal;
				acc[1] += curr.term.interest;

				return acc;
			},
			[0, 0],
		);
		const pPlusI = totals[0] + totals[1];
		expect(pPlusI).toBeCloseTo(expectedTotal);
		expect(totalPaid).toBeCloseTo(calced.totalLoan);
	});
});
