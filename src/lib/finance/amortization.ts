import {
	addBusinessDays,
	addMonths,
	differenceInMonths,
	endOfMonth,
	formatDate,
	isAfter,
	isBefore,
	isSameMonth,
	isSunday,
	setDate,
	startOfMonth,
} from "date-fns";
import { roundToPenny } from "./roundToPenny";
import type { Deal } from "@prisma/client";
import { getPercent } from "./getPercent";
import type { AmortizationPayments } from "$lib/types";
import { dateFormatStandard, formatCurrency } from "$lib/format";

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
	let n = -1;
	const today = new Date();

	const monthSinceDeal = differenceInMonths(today, startDate);
	const totalExpected = Math.min(monthSinceDeal + 1, term) * pmt;

	const schedule = [];
	const matchedIds: string[] = [];

	while (lastBalance > 0 && n < 100) {
		const pmtRef = lastBalance;
		n++;

		const dueDate = addMonths(startDate, n);
		const dueDateEOM = endOfMonth(dueDate);

		const sameMonth = isSameMonth(today, dueDateEOM);
		const date = startOfMonth(dueDateEOM);

		const nextIndex = history
			?.slice(matchedIds.length)
			.filter((i) => isBefore(i.date, dueDateEOM));
		const matchingPayments = history?.slice(
			matchedIds.length,
			(nextIndex ? nextIndex.length : 0) + matchedIds.length,
		);

		for (const p of matchingPayments || []) {
			matchedIds.push(p.id);
		}

		const totalPaidInMonth =
			matchingPayments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0;

		if (totalPaidInMonth) {
			totalPaid += totalPaidInMonth;
		}
		const dateAfterToday =
			withHistory && !totalPaidInMonth && isAfter(dueDate, today);

		const pmtDiff = dateAfterToday ? 0 : pmt - totalPaidInMonth;

		const schedulePmt = pmt + pmtDiff;

		const interest = lastBalance * monthlyRate;

		let principal =
			(dateAfterToday ? schedulePmt : totalPaidInMonth) - interest;

		if (totalPaidInMonth !== 0 || dateAfterToday) {
			// Principal cannot be applied without a payment
			lastBalance -= principal;
		}
		if (lastBalance < 1) {
			principal += lastBalance;
			lastBalance = 0;
		}

		const percentPrincipal = roundToPenny(principal / (interest + principal));
		const percentInterest = roundToPenny(1 - percentPrincipal);

		lastBalance = roundToPenny(lastBalance);
		const scheduleRow = {
			lastBalance,
			principal: roundToPenny(principal),
			interest: roundToPenny(interest),
			date: formatDate(date, dateFormatStandard),
			paid: dateAfterToday
				? `${formatCurrency(principal + interest)}*`
				: formatCurrency(totalPaidInMonth),
			expected: !dateAfterToday ? pmt : roundToPenny(principal + interest),
			percentPrincipal:
				percentPrincipal < 1 && percentPrincipal > 0 ? percentPrincipal : 0,
			percentInterest:
				percentInterest < 1 && percentInterest > 0 ? percentInterest : 0,
			delinquentBalance: pmtDiff,
			dateType: sameMonth ? "m" : dateAfterToday ? "a" : "b",
		};

		schedule.push(scheduleRow);
	}

	const owed = balance - totalPaid;

	const futurePaymentSum = schedule.reduce((acc, curr) => {
		if (curr.dateType !== "a") return acc;
		return acc + curr.expected;
	}, 0);

	const {
		lastBalance: currLastBal,
		interest,
		paid,
	} = schedule?.find((i) => isSameMonth(i.date, today)) || {
		lastBalance: owed,
		interest: 0,
	};

	const nextDueDate = setDate(
		addMonths(today, paid && Number.isFinite(Number(paid)) ? 1 : 0),
		startDate.getDate(),
	);
	return {
		schedule,
		monthlyRate,
		lastBalance,
		pmt,
		totalPaid,
		futurePaymentSum,
		totalDelinquent: totalExpected - totalPaid,
		totalExpected: roundToPenny(totalExpected),
		owed: currLastBal,
		payoff: currLastBal > 0 ? roundToPenny(currLastBal + interest) : 0,
		startDate,
		nextDueDate: isSunday(nextDueDate)
			? addBusinessDays(nextDueDate, 1)
			: nextDueDate,
	};
};

export const dealAmortization = (
	deal: Deal,
	payments: AmortizationPayments,
) => {
	const balance = Number(deal?.finance);
	const term = Number(deal.term);

	const dealDate = new Date(deal.date);
	const startDate = addMonths(dealDate, 1);

	const apr = getPercent(Number(deal.apr));
	const params: AmortizationParams = {
		term,
		balance,
		apr,
		pmt: Number(deal.pmt),
		startDate,
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
	totalExpected: 0,
	nextDueDate: new Date(),
};
