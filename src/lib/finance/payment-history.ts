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
	let futureAdjustment = 0;
	let month = 0;
	let totalPaid = 0;

	const schedule: {
		dateFmt: string;
		date: Date;
		monthType: MonthType;
		paid: number;
		owed: number;
		start: number;
		diff: number;
		totalDiff: number;
		totalPaid: number;
		expected: number;
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

		let matchingPayments = matchingHistory.length
			? matchingHistory.reduce((acc, curr) => {
					return acc + Number(curr.amount);
				}, 0)
			: 0;

		const monthType = (
			isSameMonth(date, now) ||
			(month === 0 && matchingPayments > 0 && startAfterNow)
				? "current"
				: isAfter(date, now)
					? "after"
					: "before"
		) as MonthType;

		const monthAfter = monthType === "after";

		if (monthAfter && matchingPayments === 0) {
			matchingPayments = p.pmt;
			futureAdjustment += p.pmt;
		}

		totalPaid += matchingPayments;

		const skipMissingCurrentMonth =
			monthType === "current" && isAfter(date, now) && matchingPayments === 0;

		const diff = skipMissingCurrentMonth
			? 0
			: matchingPayments - p.pmt > 0.01
				? matchingPayments - p.pmt
				: 0;

		if (workingBalance - matchingPayments < 0.5) {
			matchingPayments = workingBalance;
			workingBalance = 0;
		} else {
			workingBalance = roundToPenny(workingBalance - matchingPayments);
		}

		const monthsSince = differenceInMonths(date, p.startDate);
		const expected = roundToPenny(
			Math.min(
				p.balance,
				p.pmt * (monthsSince + (skipMissingCurrentMonth ? 0 : 1)),
			),
		);
		const thisTotalDiff = roundToPenny(totalPaid - expected);

		const remaining = p.balance - totalPaid;

		schedule.push({
			dateFmt: formatDate(date, "MMM ''yy"),
			date,
			monthType,
			paid: roundToPenny(matchingPayments),
			owed: remaining,
			start: bBal,
			diff,
			totalDiff: thisTotalDiff,
			totalPaid,
			expected,
		});

		if (
			(!history?.length && !withFutures) ||
			(lastPmtDate && isAfter(date, lastPmtDate) && !withFutures)
		) {
			break;
		}

		month++;
	}

	totalPaid -= futureAdjustment;

	const currentMonth = startAfterNow
		? schedule[0]
		: schedule.find((s) => s.monthType === "current");

	const lastPaid = startAfterNow
		? null
		: schedule.findLast((s) => s.monthType !== "after" && s.paid);

	const nextDueDateMonth =
		startAfterNow || !lastPaid
			? p.startDate
			: setDay(addMonths(lastPaid.date, 1), p.startDate.getDate());

	const currOwed = p.balance - totalPaid;
	const expectedMonthsPaid = Math.min(
		p.term,
		differenceInMonths(now, p.startDate) + (startAfterNow ? 0 : 1),
	);
	const totalExpected = expectedMonthsPaid * p.pmt;
	const totalDiff = totalPaid - totalExpected;
	const remainingMonths = Math.ceil(currOwed / p.pmt);

	const presentValue = Math.max(
		0,
		(currentMonth?.owed || 0) / (1 + periodInt) ** remainingMonths,
	);

	const payoff = presentValue;

	const monthsDelinquent = totalDiff / p.pmt;

	return {
		schedule,
		remaining: Math.max(currentMonth?.owed || 0, 0),
		pmt: p.pmt,
		totalPaid: history?.reduce((acc, curr) => {
			return acc + Number(curr.amount);
		}, 0),
		totalDiff: roundToPenny(totalDiff),
		owed: currOwed,
		payoff: roundToPenny(payoff),
		monthsDelinquent: Math.round(monthsDelinquent),
		startDate: p.startDate,
		totalExpected,
		nextDueDate: isSunday(nextDueDateMonth)
			? addDays(nextDueDateMonth, 1)
			: nextDueDateMonth,
	};
};
