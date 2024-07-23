import { addMonths } from "date-fns";
import { roundToPenny } from "./roundToPenny";

export type AmortizationParams = {
	term: number;
	balance: number;
	apr: number;
	pmt: number;
	startDate: Date;
};

export const amoritization = ({
	term,
	balance,
	apr,
	pmt,
	startDate,
}: AmortizationParams) => {
	const monthlyRate = apr / term;
	let lastBalance = balance;

	// console.log({ monthlyRate, term, apr, balance, pmt });

	const schedule = Array.from(new Array(term).keys()).map((_, n) => {
		const interest = lastBalance * monthlyRate;
		let principal = roundToPenny(pmt - interest);
		lastBalance -= principal;
		if (lastBalance < 1) {
			principal += lastBalance;
			lastBalance = 0;
		}
		const date = addMonths(startDate, n);
		const percentPrincipal = roundToPenny(principal / (interest + principal));
		const percentInterest = roundToPenny(1 - percentPrincipal);

		return {
			lastBalance,
			principal,
			interest,
			date,
			percentPrincipal,
			percentInterest,
		};
	});

	return { schedule, monthlyRate, lastBalance };
};
