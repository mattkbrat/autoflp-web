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
	dealType: "cash",
	taxCity: 4,
	taxCounty: 0,
	taxRtd: 0,
	taxState: 2.9,
	priceSelling: 0,
	priceDown: 0,
	priceTrade: 0,
	filingFees: 0,
	apr: 0,
	term: 0,
	creditor: "",
	firstPayment: new Date(),
};
