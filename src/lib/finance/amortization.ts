import {
	addMonths,
	isAfter,
	isBefore,
	isSameMonth,
	nextMonday,
	startOfMonth,
} from "date-fns";
import { roundToPenny } from "./roundToPenny";
import type { Deal } from "@prisma/client";
import { getPercent } from "./getPercent";
import type { Payments } from "$lib/server/database/deal";

export type AmortizationParams = {
	term: number;
	balance: number;
	apr: number;
	pmt: number;
	startDate: Date;
	history?: Payments;
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

	console.log({ monthlyRate, term, apr, balance, pmt });

	let schedule = [];

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
			console.log({
				schedulePmt,
				delinquentBalance,
				date,
				pmtDiff,
				totalDelinquent,
			});
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

	// console.log({ totalPaid, actualTotalDelinquent, lastBalance, balance });
	return {
		schedule,
		monthlyRate,
		lastBalance,
		pmt,
		totalDelinquent: actualTotalDelinquent,
		totalPaid,
	};
};

export const dealAmortization = (deal: Deal, payments: Payments) => {
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
