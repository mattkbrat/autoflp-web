import { add } from "date-fns";
import { roundToPenny } from "~/client/format";
import type { DealFields } from "./fields";
import { getPercent } from "./getPercent";

type FinanceCalc = {
	sellingTradeDifferential: number;
	stateTaxDollar: number;
	countyTaxDollar: number;
	cityTaxDollar: number;
	rtdTaxDollar: number;
	totalTaxDollar: number;
	totalTaxPercent: number;
	cashBalanceWithTax: number;
	unpaidCashBalance: number;
	tradeValue: number;
};

type FinanceCalcCash = FinanceCalc & {
	type: "cash";
};

export type FinanceCalcCredit = FinanceCalc & {
	type: "credit";
	financeAmount: number;
	totalLoan: number;
	deferredPayment: number;
	monthlyPayment: number;
	lastPayment: number;
	lastPaymentDueDate: Date;
	firstPaymentDueDate: Date;
	deferred: number;
	totalCost: number;
};

export type FinanceCalcResult = FinanceCalcCash | FinanceCalcCredit;

export const calcFinance = (
	p: DealFields,
): FinanceCalcCash | FinanceCalcCredit => {
	const cityTax = getPercent(p.taxCity);
	const countyTax = getPercent(p.taxCounty);
	const rtdTax = getPercent(p.taxRtd);
	const stateTax = getPercent(p.taxState);

	const sellingTradeDiff = p.priceSelling - p.priceTrade;

	const totalTaxPercent = roundToPenny(
		(cityTax + countyTax + rtdTax + stateTax) * 100.0,
	);
	const totalTaxDollar = roundToPenny(
		(sellingTradeDiff * totalTaxPercent) / 100.0,
	);

	const unpaidCashBalance =
		p.term > 0
			? sellingTradeDiff - p.priceDown + totalTaxDollar
			: sellingTradeDiff + totalTaxDollar;

	const financeAmount = unpaidCashBalance + p.filingFees;

	const cashBalanceWithTax = unpaidCashBalance + totalTaxDollar;
	const cashBalanceWithTaxAndDown = cashBalanceWithTax + p.priceDown; // For a form calcsum
	const deferred = cashBalanceWithTaxAndDown + p.filingFees;

	const financeCalc: FinanceCalc = {
		tradeValue: p.priceTrade,
		sellingTradeDifferential: sellingTradeDiff,
		stateTaxDollar: sellingTradeDiff * stateTax,
		countyTaxDollar: sellingTradeDiff * countyTax,
		cityTaxDollar: sellingTradeDiff * cityTax,
		rtdTaxDollar: sellingTradeDiff * rtdTax,
		totalTaxDollar: totalTaxDollar,
		totalTaxPercent,
		cashBalanceWithTax,
		unpaidCashBalance,
	};

	if (p.term === 0) {
		const financeCalcCash: FinanceCalcCash = { ...financeCalc, type: "cash" };
		return financeCalcCash;
	}

	const interestRate = getPercent(p.apr) / 12.0;

	const payment =
		(financeAmount * interestRate * (1.0 + interestRate) ** p.term) /
		((1.0 + interestRate) ** p.term - 1.0);

	const totalLoan = payment * p.term;

	const deferredPayment = totalLoan - financeAmount;

	const paymentRoundedToCents = roundToPenny(payment);

	const lastPayment =
		paymentRoundedToCents + totalLoan - paymentRoundedToCents * p.term;

	const firstPaymentDueDate = add(p.date, { months: 1 });
	const lastPaymentDueDate = add(firstPaymentDueDate, { months: p.term });

	const totalCost =
		p.priceSelling + totalTaxDollar + p.filingFees + deferredPayment;

	const financeCalcCredit: FinanceCalcCredit = {
		...financeCalc,
		type: "credit",
		monthlyPayment: roundToPenny(paymentRoundedToCents),
		lastPayment: roundToPenny(lastPayment),
		lastPaymentDueDate,
		totalLoan: roundToPenny(totalLoan),
		deferredPayment: roundToPenny(deferredPayment),
		totalCost: roundToPenny(totalCost),
		financeAmount: roundToPenny(financeAmount),
		firstPaymentDueDate,
		deferred: roundToPenny(deferred),
	};

	return financeCalcCredit;
};
