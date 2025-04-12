import { CITY, STATE } from "$env/static/private";
import {
	addressFromPerson,
	dateFormatStandard,
	formatCurrency,
	formatDate,
	formatSalesmen,
	fullNameFromPerson,
} from "$lib/format";
import type { DealFormParams } from ".";
import type { SalesTaxStatement } from "./maps";

export const fillSalesTaxStatement = ({ deal, finance }: DealFormParams) => {
	const { dealTrades: trades } = deal;
	const tradesArr = trades?.map((trade) => {
		return {
			year: trade.inventory.year,
			make: trade.inventory.make,
			model: trade.inventory.model,
			vin: trade.vin,
			value: trade.value,
		};
	});
	const totalTradeValue = tradesArr?.reduce(
		(acc, trade) => acc + +(trade.value || 0),
		0,
	);

	const { inventory, date } = deal;
	const { make, model, year, vin } = inventory;
	const { contact } = deal.account;
	const personFullName = fullNameFromPerson({ person: contact });
	const personAddress = addressFromPerson(deal.account.contact);

	const salesmen = formatSalesmen(
		deal.inventory.inventory_salesman,
		"firstName",
	);

	return {
		"0": formatCurrency(deal.cash),
		"1": formatCurrency(finance?.sellingTradeDifferential || 0),
		"2": formatDate(date, dateFormatStandard),
		"3": salesmen,
		"4": year,
		"5": make,
		"6": model || "",
		"7": vin,
		"8": formatCurrency(finance?.totalTaxDollar),
		"9": CITY,
		"10": deal.taxCity || "",
		"11": formatCurrency(finance?.cityTaxDollar),
		"12": "",
		"13": deal.taxCounty || "",
		"14": formatCurrency(finance?.countyTaxDollar),
		"15": STATE,
		"16": deal.taxState || "",
		"17": formatCurrency(finance?.stateTaxDollar),
		"18": personFullName,
		"19": personAddress.street,
		"20": personAddress.city,
		"21": personAddress.state,
		"22": personAddress.zip,
	} satisfies SalesTaxStatement;
};
