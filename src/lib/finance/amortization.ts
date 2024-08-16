import { addMonths, isAfter, isSameMonth, startOfMonth } from "date-fns";
import { roundToPenny } from "./roundToPenny";
import type { Deal } from "@prisma/client";
import { getPercent } from "./getPercent";
import type { AmortizationPayments } from "$lib/types";

export type AmortizationParams = {
	term: number;
	balance: number;
	apr: number;
	pmt: number;
	startDate: Date;
	history?: AmortizationPayments;
};

export type AmortizationSchedule = ReturnType<typeof amoritization>;

export const amoritization = ({
	term,
	balance,
	apr,
	pmt,
	startDate,
	history,
}: AmortizationParams) => {
	const withHistory = !!history;
	const monthlyRate = apr / term;
	let lastBalance = balance;
	let totalDelinquent = 0;
	let actualTotalDelinquent = 0;
	let totalPaid = 0;
	let n = -1;
	const today = new Date();

	// console.log({ monthlyRate, term, apr, balance, pmt });

	const schedule = [];

	while (lastBalance > 0 && n < 100) {
		n++;

		const dueDate = addMonths(startDate, n);

		const dateAfterToday = withHistory && isAfter(dueDate, today);
		const date = startOfMonth(dueDate);

		const matchingPayments = history?.filter((p) => isSameMonth(date, p.date));
		const ignore = !dateAfterToday && !matchingPayments?.length;
		const totalPaidInMonth = matchingPayments?.reduce(
			(acc, p) => acc + Number(p.amount),
			0,
		);

		if (totalPaidInMonth) {
			totalPaid += totalPaidInMonth || 0;
		}

		const pmtDiff = totalDelinquent
			? Math.min(totalDelinquent, balance - totalPaid)
			: 0;
		const schedulePmt = !dateAfterToday ? totalPaidInMonth || 0 : pmt + pmtDiff;
		if (dateAfterToday) {
			totalDelinquent = 0;
		}

		const interest = ignore ? 0 : lastBalance * monthlyRate;
		const delinquentBalance = dateAfterToday
			? 0
			: pmt - (totalPaidInMonth || 0);

		if (withHistory) {
			actualTotalDelinquent += delinquentBalance;
			totalDelinquent = Math.min(
				totalDelinquent + delinquentBalance,
				balance - totalPaid,
			);
		}

		let principal = ignore ? 0 : roundToPenny(schedulePmt - interest);
		lastBalance -= principal;
		if (lastBalance < 1) {
			principal += lastBalance;
			lastBalance = 0;
		}
		const percentPrincipal = roundToPenny(principal / (interest + principal));
		const percentInterest = roundToPenny(1 - percentPrincipal);

		const scheduleRow = {
			lastBalance,
			principal,
			interest,
			date,
			paid: totalPaidInMonth,
			expected: !dateAfterToday ? pmt : schedulePmt,
			percentPrincipal:
				percentPrincipal < 1 && percentPrincipal > 0 ? percentPrincipal : 0,
			percentInterest:
				percentInterest < 1 && percentInterest > 0 ? percentInterest : 0,
			delinquentBalance,
		};

		schedule.push(scheduleRow);
	}

	const owed =
		schedule[0] && isAfter(schedule[0].date, today)
			? schedule[0].lastBalance
			: schedule.find((s) => isSameMonth(s.date, today))?.lastBalance;
	return {
		schedule,
		monthlyRate,
		lastBalance,
		pmt,
		totalDelinquent: actualTotalDelinquent,
		totalPaid,
		owed: Math.max(actualTotalDelinquent, owed || 0),
	};
};

export const dealAmortization = (
	deal: Deal,
	payments: AmortizationPayments,
) => {
	const balance = Number(deal?.finance);
	const term = Number(deal.term);

	const apr = getPercent(Number(deal.apr));
	const params: AmortizationParams = {
		term,
		balance,
		apr,
		pmt: Number(deal.pmt),
		startDate: addMonths(new Date(deal.date), 1),
		history: payments,
	};

	return amoritization(params);
};

export type AmortizedDeal = ReturnType<typeof dealAmortization>;

export const defaultSchedule: AmortizedDeal = {
	schedule: [],
	monthlyRate: 0,
	lastBalance: 0,
	pmt: 0,
	totalDelinquent: 0,
	totalPaid: 0,
	owed: 0,
};
