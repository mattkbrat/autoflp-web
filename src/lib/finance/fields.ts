export type DealFields = {
	dealType: "cash" | "credit";
	taxCity: number;
	taxCounty: number;
	taxRtd: number;
	taxState: number;
	priceSelling: number;
	priceDown: number;
	priceTrade: number;
	filingFees: number;
	apr: number;
	term: number;
	creditor: string;
	firstPayment: Date;
};

export const defaultDeal: DealFields = {
	dealType: "credit",
	taxCity: 4,
	taxCounty: 0,
	taxRtd: 0,
	taxState: 2.9,
	priceSelling: 15_000,
	priceDown: 3_000,
	priceTrade: 2_000,
	filingFees: 220.75,
	apr: 8.5,
	term: 12,
	creditor: "",
	firstPayment: new Date(),
};
