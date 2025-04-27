export type PrincipalPayment = string | number | { [key: string]: number };

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
