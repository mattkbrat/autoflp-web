// Adapter from https://github.com/cfpb/amortize/blob/master/index.js

import { roundToPenny } from "./roundToPenny";

type PrincipalPayment = string | number | { [key: string]: number };

export type Amortization = {
	termOffset?: number;
	termsSaved: number;
	principalPaymentsTotal: PrincipalPayment;
	interest: number;
	principal: number;
	preBalance: number;
	balance: number;
	basePayment: number;
	baseBoundedPayment?: number;
	payment: number;
	monthlyPrincipalPayment: number;
	principalBreakingTerm: number;
	term: {
		principal: number;
		interest: number;
	};
};

export const amortizationCalc = ({
	amount,
	rate,
	totalTerm,
	amortizeTerm,
	principalPayment,
	repaymentType,
	partialMonthOffset,
}: {
	amount: number;
	rate: number;
	totalTerm: number;
	amortizeTerm: number;
	principalPayment: PrincipalPayment;
	repaymentType: string;
	partialMonthOffset: number;
}): Amortization | { error: string } => {
	let workingAmount = amount;

	// console.log("calc", { paid });
	let monthlyPayment = 0;
	// let monthlyPayment = 0;
	let summedInterest = 0;
	let summedPrincipal = 0;
	let monthlyIntPaid = 0;
	let monthlyPrincPaid = 0;

	const summedAmortize: Amortization = {
		termsSaved: 0,
		principalPaymentsTotal: 0,
		interest: 0,
		principal: 0,
		preBalance: 0,
		balance: 0,
		basePayment: 0,
		payment: 0,
		monthlyPrincipalPayment: 0,
		principalBreakingTerm: 0,
		term: {
			principal: 0,
			interest: 0,
		},
	};
	let monthlyPrincipalPayment = 0;
	let principalBreakingTerm = 0;

	// Calculate monthly interest rate and monthly payment
	const periodInt = rate / 12 / 100;

	if (repaymentType === "amortize") {
		monthlyPayment =
			workingAmount * (periodInt / (1 - (1 + periodInt) ** -totalTerm));
		// If zero or NaN is returned (i.e. if the rate is 0) calculate the payment without interest
		monthlyPayment = monthlyPayment || workingAmount / totalTerm;
	} else if (repaymentType === "equal-principal-payment") {
		monthlyPrincipalPayment = workingAmount / totalTerm;
	} else {
		return { error: "unsupported repaymentType" };
	}

	const principalPaymentNum: number = !(principalPayment instanceof Object)
		? Number.isFinite(principalPayment)
			? Number(principalPayment)
			: Number.parseInt(principalPayment.toString(), 10)
		: 0;
	// Calculate the interest, principal, and remaining balance for each period
	let boundedMonthlyPayment = 0;
	let termOffset = 0;
	let i = 0;
	while (i < amortizeTerm) {
		const monthPrincipalPayment =
			(principalPayment instanceof Object
				? i.toString() in principalPayment
					? principalPayment[i.toString()]
					: 0
				: principalPaymentNum) || 0;

		if (workingAmount < 0) {
			console.log("No working amount");
			break;
		}

		termOffset = i === 0 ? partialMonthOffset : 1;
		monthlyIntPaid = workingAmount * periodInt * termOffset;
		if (repaymentType === "equal-principal-payment") {
			monthlyPayment = monthlyPrincipalPayment + monthlyIntPaid / termOffset;
		}
		boundedMonthlyPayment = Math.min(
			workingAmount + monthlyIntPaid,
			monthlyPayment,
		);
		monthlyPrincPaid =
			boundedMonthlyPayment * termOffset -
			monthlyIntPaid +
			monthPrincipalPayment;
		summedInterest = summedInterest + monthlyIntPaid;
		summedPrincipal = summedPrincipal + monthlyPrincPaid;
		workingAmount = workingAmount - monthlyPrincPaid;
		i += 1;
		if (!principalBreakingTerm && monthlyPrincPaid > monthlyIntPaid) {
			principalBreakingTerm = i;
		}
	}

	summedAmortize.termOffset = termOffset;
	summedAmortize.termsSaved = amortizeTerm - i;
	summedAmortize.principalPaymentsTotal = i * Number(principalPaymentNum);
	summedAmortize.interest = summedInterest;
	summedAmortize.principal = summedPrincipal;
	summedAmortize.preBalance = workingAmount + monthlyPrincPaid;
	summedAmortize.balance = workingAmount;
	summedAmortize.basePayment = monthlyPayment;
	summedAmortize.baseBoundedPayment = boundedMonthlyPayment;
	summedAmortize.payment =
		boundedMonthlyPayment * termOffset + Number(principalPaymentNum);
	summedAmortize.monthlyPrincipalPayment = monthlyPrincipalPayment;
	summedAmortize.principalBreakingTerm = principalBreakingTerm;
	summedAmortize.term = {
		principal: monthlyPrincPaid,
		interest: monthlyIntPaid,
	};

	return summedAmortize;
};

/**
 * Throw an error if a string or number below 0 is passed
 */
const errorCheck = (opts: { [key: string]: unknown }) => {
	for (const key in opts) {
		if (!(key in opts)) continue;
		const value = opts[key] as string;
		if (key === "repaymentType") {
			if (["amortize", "equal-principal-payment"].indexOf(value) === -1) {
				throw new Error(
					"repaymentType must be one of: 'amortize', 'equal-principal-payment'",
				);
			}
		} else if (
			key !== "principalPayment" &&
			(typeof opts[key] === "undefined" ||
				Number.isNaN(Number.parseFloat(value)) ||
				opts[key] instanceof Object ||
				(opts[key] as number) < 0)
		) {
			throw new Error(`Loan ${key} must be a non-negative value.`);
		}
	}
};

type NumberObject = { [key: string]: number | NumberObject };

/**
 * Round values to two decimal places
 */
const roundNum = (numObj: NumberObject) => {
	type RoundKey = `${keyof typeof numObj}Round`;
	const tmp: typeof numObj & { [key: RoundKey]: string } = {};
	for (const property of Object.keys(numObj)) {
		tmp[property] = numObj[property];
		const value = numObj[property];
		if (value instanceof Object) {
			continue;
		}
		tmp[`${property}Round`] = roundToPenny(value).toFixed(2);
	}
	return tmp;
};

/**
 * Pass values and return output
 * @example amortize({amount: 180000, rate: 4.25, totalTerm: 360, amortizeTerm: 60, principalPayment: 200})
 */
export const amortize = (opts: {
	amount: number;
	rate: number;
	totalTerm: number;
	amortizeTerm: number;
	principalPayment?: PrincipalPayment;
	repaymentType?: string;
	partialMonthOffset?: number;
	// paid?: number;
}) => {
	errorCheck(opts);
	const amortized = amortizationCalc({
		amount: opts.amount,
		rate: opts.rate,
		totalTerm: opts.totalTerm,
		amortizeTerm: opts.amortizeTerm,
		principalPayment: opts.principalPayment || 0,
		repaymentType: opts.repaymentType || "amortize",
		partialMonthOffset: opts.partialMonthOffset || 1,
		// paid: opts.paid,
	});
	if ("error" in amortized) return amortized;
	return roundNum(amortized) as unknown as AmortizeResultWithRounding;
};

type AmortizeResult = {
	termsSaved: number;
	principalPaymentsTotal: number;
	interest: number;
	principal: number;
	preBalance: number;
	balance: number;
	basePayment: number;
	payment: number;
	monthlyPrincipalPayment: number;
	principalBreakingTerm: number;
	term: { principal: number; interest: number };
	termOffset: number;
	baseBoundedPayment: number;
};

type RoundKey = `${keyof Omit<AmortizeResult, "term">}Round`;

type AmortizeResultWithRounding = AmortizeResult & {
	[key in RoundKey]: string;
};