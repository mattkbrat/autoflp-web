export type DealFields = {
	dealType: "cash" | "credit";
	id: string;
	vin: string;
	account: string;
	taxCity: number;
	taxCounty: number;
	taxRtd: number;
	taxState: number;
	priceSelling: number;
	creditor: "";
	trades: string[];
	salesmen: string[];
	priceDown: number;
	priceTrade: number;
	filingFees: number;
	apr: number;
	term: number;
	date: Date;
};

export const defaultDeal: DealFields = {
	id: "",
	vin: "",
	account: "",
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
	salesmen: [],
	trades: [],
	date: new Date(),
};
