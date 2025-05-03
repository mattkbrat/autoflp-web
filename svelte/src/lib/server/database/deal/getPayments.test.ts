import { describe, expect, it, assert } from "vitest";
import { getMonthlyPayments, sumMonthlyPayments } from "./getPayments";
import { env } from "$env/dynamic/private";
import { prisma } from "..";

describe("Can get payments within a month and year", () => {
	const testYear = 2024;
	const testMonth = 10;

	const dateBegins = new Date(testYear, testMonth, 1);
	const dateEnds = new Date(testYear, testMonth + 1, 0);
	const dealId = env.TEST_DEAL_ID;

	expect(dealId?.length).toBeGreaterThan(0);

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
		const gte = new Date(testYear, 9, 1).toISOString().split("T")[0];
		const lte = new Date(testYear, 9, 30).toISOString().split("T")[0];
		const matchingDeal = await prisma.payment.findFirst({
			where: {
				AND: [
					{
						date: {
							gte,
						},
					},
					{
						date: {
							lte,
						},
					},
				],
			},
			select: {
				deal: {
					select: {
						id: true,
					},
				},
			},
		});
		const payments = await sumMonthlyPayments({
			year: testYear,
			month: testMonth,
			dealId: matchingDeal?.deal.id,
		});
		console.log({ payments });
		expect(Object.keys(payments).length).toBeGreaterThanOrEqual(1);
		expect(payments[dealId]).not.toBeNaN();
	});
});
