import {
	addMonths,
	isAfter,
	isBefore,
	isSameMonth,
	startOfMonth,
} from "date-fns";
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
	let totalPaid = 0;
	let totalDelinquent = 0;
	let actualDelinquent = 0;
	let n = -1;
	const today = new Date();

	const schedule = [];

	while (lastBalance > 0 && n < 100) {
		n++;

		const dueDate = addMonths(startDate, n);

		const sameMonth = isSameMonth(today, dueDate);
		const dateAfterToday = withHistory && isAfter(dueDate, today) && !sameMonth;
		const date = startOfMonth(dueDate);

		const matchingPayments =
			history?.filter((p) => isSameMonth(date, p.date)) || [];

		if (n === 0) {
			const matchingIds = matchingPayments.map((p) => p.id);
			for (const p of history || []) {
				if (!isBefore(p.date, startDate)) break;
				if (matchingIds.includes(p.id)) continue;
				matchingPayments.push(p);
			}
		}

		const totalPaidInMonth =
			matchingPayments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0;

		if (totalPaidInMonth) {
			totalPaid += totalPaidInMonth;
		}

		const pmtDiff = dateAfterToday ? 0 : pmt - totalPaidInMonth;
		if ((pmtDiff > 0 && totalDelinquent < balance - totalPaid) || pmtDiff < 0) {
			totalDelinquent += pmtDiff;
		} else if (dateAfterToday && totalDelinquent > 0) {
			totalDelinquent -= Math.min(pmt, totalDelinquent);
		}

		const schedulePmt = pmt + pmtDiff;

		const interest = lastBalance * monthlyRate;

		let principal = dateAfterToday ? schedulePmt : totalPaidInMonth - interest;
		lastBalance -= principal;
		if (lastBalance < 1) {
			principal += lastBalance;
			lastBalance = 0;
		}

		// if (totalDelinquent < 1) {
		// 	totalDelinquent = 0;
		// }

		if (totalDelinquent > lastBalance) {
			totalDelinquent = lastBalance;
		}

		if (!dateAfterToday) {
			actualDelinquent = totalDelinquent;
		}

		// totalDelinquent
		const percentPrincipal = roundToPenny(principal / (interest + principal));
		const percentInterest = roundToPenny(1 - percentPrincipal);

		lastBalance = roundToPenny(lastBalance);
		const scheduleRow = {
			lastBalance,
			principal: roundToPenny(principal),
			interest: roundToPenny(interest),
			date,
			paid: totalPaidInMonth,
			expected: !dateAfterToday ? pmt : schedulePmt,
			percentPrincipal:
				percentPrincipal < 1 && percentPrincipal > 0 ? percentPrincipal : 0,
			percentInterest:
				percentInterest < 1 && percentInterest > 0 ? percentInterest : 0,
			delinquentBalance: totalDelinquent,
		};

		schedule.push(scheduleRow);
	}

	const owed = balance - totalPaid;

	const { lastBalance: currLastBal, interest } = schedule?.find((i) =>
		isSameMonth(i.date, today),
	) || { lastBalance: owed, interest: 0 };
	return {
		schedule,
		monthlyRate,
		lastBalance,
		pmt,
		totalPaid,
		totalDelinquent: Math.min(owed, actualDelinquent),
		owed: currLastBal,
		payoff: currLastBal + interest,
		nextDueDate: addMonths(startDate, 1),
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
	payoff: 0,
};
