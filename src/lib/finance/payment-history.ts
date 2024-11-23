import {
	addDays,
	addMonths,
	differenceInMonths,
	formatDate,
	isAfter,
	isBefore,
	isSameMonth,
	isSunday,
	setDay,
} from "date-fns";
import type { AmortizationParams } from "./amortization";
import { roundToPenny } from "./roundToPenny";

type MonthType = "current" | "after" | "before";
export const getPaymentSchedule = (
	p: Pick<
		AmortizationParams,
		"pmt" | "balance" | "startDate" | "term" | "apr"
	> & { finance: number },
	history: AmortizationParams["history"],
	withFutures = true,
) => {
	const now = new Date();
	const startAfterNow = isAfter(p.startDate, now);

	let workingBalance = p.balance;
	let totalPaid = 0;
	let month = 0;
	let currOwed = 0;
	let totalDiff = 0;
	let currDiff = 0;

	let hasPaid = false;

	const schedule: {
		dateFmt: string;
		date: Date;
		monthType: MonthType;
		paid: number;
		owed: number;
		start: number;
		diff: number;
		totalDiff: number;
	}[] = [];

	const lastPmtDate = history?.slice(-1)[0]?.date;
	const periodInt = p.apr / 100 / 12;

	while (workingBalance > 0 && month < 50) {
		const date = addMonths(p.startDate, month);

		const bBal = workingBalance;

		const matchingHistory = !lastPmtDate
			? []
			: history.filter((r) => {
					const sameMonth = isSameMonth(r.date, date);
					if (month === 0) {
						const before = isBefore(r.date, date);
						return sameMonth || before;
					}

					return sameMonth;
				});

		const matchingPayments = matchingHistory.length
			? matchingHistory.reduce((acc, curr) => {
					return acc + Number(curr.amount);
				}, 0)
			: 0;
		const monthType = (
			isSameMonth(date, now) || (month === 0 && matchingPayments)
				? "current"
				: isAfter(date, now)
					? "after"
					: "before"
		) as MonthType;

		const monthAfter = monthType === "after";
		let paid = matchingPayments ? matchingPayments : monthAfter ? p.pmt : 0;

		const skipMissingCurrentMonth =
			monthType === "current" && isAfter(date, now) && paid === 0;

		const diff = skipMissingCurrentMonth
			? 0
			: paid - p.pmt > 0.01
				? paid - p.pmt
				: 0;
		totalPaid += paid;

		if (workingBalance - paid < 0.5) {
			paid = workingBalance;
			workingBalance = 0;
		} else {
			workingBalance = roundToPenny(workingBalance - paid);
		}

		const monthsSince = differenceInMonths(date, p.startDate);
		const expected = roundToPenny(
			Math.min(p.balance, p.pmt * (monthsSince + 1)) -
				(skipMissingCurrentMonth ? p.pmt : 0),
		);

		const thisTotalDiff = roundToPenny(totalPaid - expected);

		const remaining = p.balance - totalPaid;

		totalDiff = thisTotalDiff;

		if (totalDiff < remaining * -1) {
			totalDiff = remaining * -1;
		} else if (totalDiff > remaining) {
			totalDiff = remaining;
		}

		if ((monthType === "current" || startAfterNow) && !currOwed) {
			currOwed = expected;
			currDiff = totalDiff;
			hasPaid = totalDiff > p.pmt || p.pmt - paid <= 10;
		}
		schedule.push({
			dateFmt: formatDate(date, "MMM ''yy"),
			date,
			monthType,
			paid: roundToPenny(paid),
			owed: workingBalance,
			start: bBal,
			diff,
			totalDiff,
		});
		if (
			(!history?.length && !withFutures) ||
			(lastPmtDate && isAfter(date, lastPmtDate) && !withFutures)
		) {
			break;
		}

		month++;
	}

	const nextDueDateMonth = setDay(
		startAfterNow ? p.startDate : hasPaid ? addMonths(now, 1) : now,
		p.startDate.getDate(),
	);

	const remainingMonths = Math.ceil(currOwed / p.pmt);

	const currentMonth = startAfterNow
		? schedule[0]
		: schedule.find((s) => s.monthType === "current");

	const presentValue = Math.max(
		0,
		(currentMonth?.owed || 0) / (1 + periodInt) ** remainingMonths,
	);

	const payoff = presentValue;

	const monthsDelinquent = currDiff / p.pmt;

	return {
		schedule,
		remaining: Math.max(currentMonth?.owed || 0, 0),
		pmt: p.pmt,
		totalPaid: history?.reduce((acc, curr) => {
			return acc + Number(curr.amount);
		}, 0),
		totalDiff: currDiff,
		owed: currOwed,
		payoff: roundToPenny(payoff),
		monthsDelinquent: Math.round(monthsDelinquent),
		startDate: p.startDate,
		nextDueDate: isSunday(nextDueDateMonth)
			? addDays(nextDueDateMonth, 1)
			: nextDueDateMonth,
	};
};
