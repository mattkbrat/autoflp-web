import { describe, expect, it, assert } from "vitest";
import { getMonthlyPayments, sumMonthlyPayments } from "./getPayments";

describe("Can get payments within a month and year", () => {
	const testYear = 2022;
	const testMonth = 11;

	const dateBegins = new Date(testYear, testMonth, 1);
	const dateEnds = new Date(testYear, testMonth + 1, 0);

	assert(
		dateBegins.getFullYear() === testYear &&
			dateBegins.getMonth() === testMonth,
		`Invalid start date conversion: ${JSON.stringify(dateBegins)}`,
	);
	assert(
		dateEnds.getFullYear() === testYear && dateEnds.getMonth() === testMonth,
		"Invalid end date conversion",
	);
	const testDate = (date: Date) => {
		const month = date.getMonth();
		const year = date.getFullYear();
		return month === testMonth - 1 && year === testYear;
	};

	it("fetches payments and expects each payment to fall within date", async () => {
		const payments = await getMonthlyPayments({
			year: testYear,
			month: testMonth,
		});

		for (const payment of payments) {
			const date = new Date(payment.date);
			expect(date).toBeInstanceOf(Date);

			// console.debug("testing", date);
			expect(testDate(date)).toBeTruthy();
		}
	});

	it("fetches and sums payments made by a single account within a month", async () => {
		const dealId = "af3dc147-cea2-46cd-a25e-3e83c1236a68";
		const payments = await sumMonthlyPayments({
			year: testYear,
			month: testMonth,
			dealId,
		});
		expect(Object.keys(payments).length).toEqual(1);
		expect(payments[dealId]).not.toBeNaN();
	});
});
