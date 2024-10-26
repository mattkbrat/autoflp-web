import type { FinanceCalcResult } from "./calc";

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
	priceDown: number;
	downOwed: number;
	priceTrade: number;
	filingFees: number;
	apr: number;
	term: number;
	date: Date;
	cosigner: string;
	finance: FinanceCalcResult | null;
};

export const defaultDeal: DealFields = {
	id: "",
	vin: "",
	account: "",
	dealType: "credit",
	taxCity: 0,
	taxCounty: 0,
	taxRtd: 0,
	taxState: 2.9,
	priceSelling: 0,
	priceDown: 0,
	priceTrade: 0,
	filingFees: 0,
	downOwed: 0,
	apr: 10,
	term: 12,
	creditor: "",
	trades: [],
	date: new Date(),
	finance: null,
	cosigner: "",
};

export type DealFieldsWithFinance = DealFields & { finance: FinanceCalcResult };
