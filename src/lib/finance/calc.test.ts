import { add } from "date-fns";
import { describe, expect, it, vi } from "vitest";
import { calc_finance } from "./calc";
import type { DealFields } from "./fields";

const params: DealFields = {
	dealType: "cash",
	taxCity: 2.0,
	taxCounty: 2.0,
	taxRtd: 2.6,
	taxState: 4.4,
	priceSelling: 1_000.0,
	priceDown: 500.0,
	priceTrade: 200.0,
	filingFees: 20.0,
	apr: 12,
	term: 12,
	creditor: "",
	firstPayment: new Date(2024, 10, 2),
};

describe("credit test", async () => {
	it("can calc credit", async () => {
		const calced = calc_finance(params);
		expect(calced.type).toBe("credit");
		if (calced.type !== "credit") throw new Error("Invalid calc type");
		expect(calced.sellingTradeDifferential).toBe(800.0);
		expect(calced.stateTaxDollar).toBe(32);
		expect(calced.countyTaxDollar).toBe(16.0);
		expect(calced.cityTaxDollar).toBe(16.0);
		expect(calced.rtdTaxDollar).toBe(24);
		expect(calced.totalTaxDollar).toBe(88.0);
		expect(calced.totalTaxPercent).toBe(11.0);
		expect(calced.cashBalanceWithTax).toBe(476);
		expect(calced.unpaidCashBalance).toBe(388.0);
		expect(calced.financeAmount).toBe(408); // Total loan amount
		expect(calced.totalLoan).toBe(435); // Total of payments
		expect(calced.deferredPayment).toBe(27); // Total loan interest
		expect(calced.monthlyPayment).toBe(36.25);
		expect(calced.lastPayment).toBe(36.25);
		expect(calced.lastPaymentDueDate).toStrictEqual(
			add(params.firstPayment, { months: params.term }),
		);
		expect(calced.firstPaymentDueDate).toStrictEqual(
			add(params.firstPayment, { months: 1 }),
		);
		expect(calced.deferred).toBe(996);
		expect(calced.totalCost).toBe(1_135);
	});
});
