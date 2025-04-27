import { addMonths, isSameMonth } from "date-fns";
import { roundToPenny } from "~/client/format";
import { amortize } from "~/lib/finance/amortize";
import type { DetailedDeal } from "~/server/db/queries/deal/get-detailed";
import type { Payments } from "~/server/db/queries/deal/get-payments";

export type AmortizationParams = {
	term: number;
	balance: number;
	apr: number;
	pmt: number;
	startDate: Date;
	history?: AmortizationPayments;
};

export type AmortizationPayments = Pick<
	Payments[number],
	"date" | "amount" | "id"
>[];

export type InventorySalesmen =
	NonNullable<DetailedDeal>["inventory"]["inventorySalesmen"];
export type AmortizationSchedule = ReturnType<typeof amoritization>;

export const amoritization = ({
	term,
	balance,
	apr,
	startDate,
	history,
	pmt,
}: AmortizationParams) => {
	const scheduleRows = Array.from(new Array(term + 1).keys()).map((i) => {
		const date = addMonths(startDate, i);
		const matchingHistory = history?.find((r) => isSameMonth(r.date, date));

		return { amortizeTerm: i + 1, date, matchingHistory };
	});

	let aheadBalance = 0;
	let totalDelinquent = 0;

	type Amortize = Exclude<ReturnType<typeof amortize>, { error: string }>;

	type ScheduleRow = Amortize & {
		date: Date;
	};

	const schedule: ScheduleRow[] = [];

	for (let i = 0; i <= scheduleRows.length; i++) {
		const r = scheduleRows[i];
		if (!r) continue;

		const monthsRemaining = term - r.amortizeTerm - 1;
		let principalPayment = 0;
		const termAhead = roundToPenny(
			r.matchingHistory?.amount ? Number(r.matchingHistory.amount) - pmt : 0,
		);

		totalDelinquent += termAhead;
		aheadBalance += termAhead;

		principalPayment = aheadBalance / monthsRemaining;

		aheadBalance -= principalPayment;

		const calced = amortize({
			amount: balance,
			rate: apr,
			totalTerm: term,
			amortizeTerm: r.amortizeTerm,
			principalPayment,
		});

		if ("error" in calced) {
			console.error(
				"Failed to calculate amortization for month",
				r.date,
				calced.error,
			);
			return undefined;
		}

		if ("error" in calced) {
			continue;
		}
		const scheduleRow: ScheduleRow = calced as ScheduleRow;
		scheduleRow.date = r.date;
		schedule.push(scheduleRow);
		if (calced.balance <= 0) {
			break;
		}
	}

	return schedule;
};
