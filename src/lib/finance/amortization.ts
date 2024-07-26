import { addMonths, isAfter, isSameMonth } from "date-fns";
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
	const monthlyRate = apr / term;
	let lastBalance = balance;
	let totalDelinquent = 0;
	let actualTotalDelinquent = 0;
	const today = new Date();

	console.log({ monthlyRate, term, apr, balance, pmt });

	const schedule = Array.from(new Array(term).keys()).map((_, n) => {
		const date = addMonths(startDate, n);
		const dateAfterToday = !!history && isAfter(date, today);
		const matchingPayments = history?.filter((p) => isSameMonth(date, p.date));
		const totalPaidInMonth = matchingPayments?.reduce(
			(acc, p) => acc + Number(p.amount),
			0,
		);

		const pmtDiff = totalDelinquent ? totalDelinquent : 0;
		const schedulePmt = !dateAfterToday ? totalPaidInMonth || 0 : pmt + pmtDiff;
		if (dateAfterToday) {
			totalDelinquent = 0;
		}

		const interest = lastBalance * monthlyRate;
		const delinquentBalance = dateAfterToday
			? 0
			: totalPaidInMonth
				? pmt - totalPaidInMonth
				: pmt;

		console.log({
			schedulePmt,
			delinquentBalance,
			date,
			pmtDiff,
			totalDelinquent,
		});

		actualTotalDelinquent += delinquentBalance;
		totalDelinquent += delinquentBalance || 0;

		let principal = roundToPenny(schedulePmt - interest);
		lastBalance -= principal;
		if (lastBalance < 1) {
			principal += lastBalance;
			lastBalance = 0;
		}
		const percentPrincipal = roundToPenny(principal / (interest + principal));
		const percentInterest = roundToPenny(1 - percentPrincipal);

		return {
			lastBalance,
			principal,
			interest,
			date,
			paid: totalPaidInMonth,
			expected: totalPaidInMonth ? 0 : schedulePmt || pmt,
			percentPrincipal:
				percentPrincipal < 1 && percentPrincipal > 0 ? percentPrincipal : 0,
			percentInterest:
				percentInterest < 1 && percentInterest > 0 ? percentInterest : 0,
			delinquentBalance,
		};
	});

	return { schedule, monthlyRate, lastBalance, pmt, totalDelinquent };
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
		startDate: new Date(deal.date),
		history: payments,
	};

	return amoritization(params);
};
