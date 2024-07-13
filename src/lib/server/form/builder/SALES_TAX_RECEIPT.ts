import {
	BUSINESS_ADDRESS,
	DEALER_NUMBER,
	EMAIL,
	INVOICE_NUMBER,
	PHONE_NUMBER,
	PRIMARY_DEALER_NAME,
	SALES_TAX_NUMBER,
	STATE,
} from "$env/static/private";
import {
	addressFromPerson,
	dateFormatStandard,
	formatCurrency,
	fullNameFromPerson,
} from "$lib/format";
import type { DetailedDeal } from "$lib/server/database/deal";
import { formatDate } from "date-fns";
import type { DealFormParams } from ".";
import type { BuyersGuideTemplate, SalesTaxReceiptTemplate } from "./maps";

export const fillSalesTax0024Data = ({ deal }: DealFormParams) => {
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

	const { inventory } = deal;
	const { make, model, year, vin } = inventory;
	const personFullName = fullNameFromPerson({ person: deal.account.contact });
	const creditorName = deal.creditor?.businessName;
	const personAddress = addressFromPerson(deal.account.contact);
	const creditorAddress =
		deal.creditor && addressFromPerson(deal.creditor.contact);

	const legalNames = [personFullName, deal.account.cosigner]
		.filter(Boolean)
		.join("\n");
	return {
		"Dealer Number": DEALER_NUMBER,
		"Dealer Invoice Number": INVOICE_NUMBER,
		"Gross Selling Price": formatCurrency(deal.cash),
		"Gross Amount of Trade-in (if any)": formatCurrency(totalTradeValue),
		"Date of Sale": formatDate(deal.date, dateFormatStandard),
		"Model Year": year,
		Make: make,
		Model: model || "",
		"Vehicle Identification Number": vin,
		"Trade-in Model Year 1.0": tradesArr?.[0]?.year,
		"Trade-in Model Year 1.1": tradesArr?.[1]?.year,
		"Trade-in Make 1.0": tradesArr?.[0]?.make,
		"Trade-in Make 1.1": tradesArr?.[1]?.make,
		"Trade-in Model 1.0": tradesArr?.[0]?.model || "",
		"Trade-in Model 1.1": tradesArr?.[1]?.model || "",
		"Trade-in Vehicle Identification Number 1.0": tradesArr?.[0]?.vin,
		"Trade-in Vehicle Identification Number 1.1": tradesArr?.[1]?.vin,
		"Purchaser's Name": legalNames,
		"Purchaser's Address": personAddress.full,
		"Dealer City Sales Tax Account # (if applicable)": SALES_TAX_NUMBER,
		"State of Sale": STATE,
		"Sales Tax Remitted with DR 0100": "",
		"Use Tax Remitted with DR 0024": "",
		"RTD/SCFD Name.0": "",
		"Tax Rate.0": "",
		"Tax Rate.1": "",
		"Tax Rate.2": "",
		"Tax Rate.3": "",
		"Sales Tax Remitted with DR 0100 1.0.0": "",
		"Sales Tax Remitted with DR 0100 1.0.1": "",
		"Sales Tax Remitted with DR 0100 1.0.2": "",
		"Sales Tax Remitted with DR 0100 1.0.3": "",
		"Use Tax Remitted with DR 0024 1.0.0": "",
		"Use Tax Remitted with DR 0024 1.0.1": "",
		"Use Tax Remitted with DR 0024 1.0.2": "",
		"Use Tax Remitted with DR 0024 1.0.3": "",
		"Statutory City Name (If Applicable)": "",
		"Special District Name": "",
		"County Name": "",
		"Home Rule City Name (if applicable)": "",
		"Taxable Amount": "",
		"Tax Rate Part 3": "",
		"Tax Remitted with DR 0024 Part 3": "",
		"Tax Remitted to City": "",
		'Sum of amounts in Part 2 and 3 Under "Tax Remitted with dR 0024"': "",
		"Dealer/Retailer Address": "",
		"Deale?Retailer Name": "",
		"Net Sales Price": "",
		"DealerRetailer Colorado Sales Tax Account Number": "",
		"Veh Del to Purch Add?": "",
		Comment: "",
		"Net Sales Price 2": "",
	} satisfies Partial<SalesTaxReceiptTemplate>;
};
