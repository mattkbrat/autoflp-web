import {
	BUSINESS_NAME,
	CITY,
	PRIMARY_DEALER_NAME,
	STATE,
	STREET,
	ZIP,
} from "$env/static/private";
import { formatDate } from "date-fns";
import type { BuyersOrderTemplate } from "./maps";
import {
	addressFromPerson,
	dateFormatStandard,
	formatCurrency,
	fullNameFromPerson,
} from "$lib/format";
import type { DealFormParams } from ".";
import type { Nullable } from "vitest";

export const fillBuyersOrderData = ({ deal, finance }: DealFormParams) => {
	const {
		creditor,
		inventory,
		account,
		dealSalsemen: salesmen,
		dealTrades: trades,
		dealCharges: charges,
	} = deal;
	if (!deal.lien || !deal.term || !creditor || finance?.type !== "credit")
		return {};
	const { contact, cosigner } = account;
	if (!contact) {
		console.error("No cotact provider for account", account.id, account);
		return {};
	}
	const address = addressFromPerson(contact);
	const dealDate = formatDate(deal.date, dateFormatStandard);

	console.log("salesmen", JSON.stringify(salesmen, null, 2));
	const salesmenText = salesmen
		?.map((s) =>
			fullNameFromPerson({ person: s.salesman?.contact && s.salesman.contact }),
		)
		.join(", ");

	const names = [fullNameFromPerson({ person: contact }), cosigner || null]
		.filter(Boolean)
		.join(", ");
	const { id: iId, color, make, model, year, vin, mileage } = inventory;

	const trade = trades?.[0];

	const totalCharges = charges
		?.map((c) => c.charge?.amount)
		.reduce((a, b) => {
			let c = a + Number(b || 0);
			return c;
		}, 0);
	return {
		"0": BUSINESS_NAME,
		"1": dealDate,
		"2": STREET,
		"3": CITY,
		"4": STATE,
		"5": ZIP,
		"6": salesmenText,
		// "7":,
		// "8":,
		"9": iId.split("-").slice(-1)[0],
		"10": color || "",
		"11": make,
		"12": year,
		"13": model || "0",
		"14": vin,
		"15": names,
		"16": account.licenseNumber,
		"17": formatDate(finance.firstPaymentDueDate, dateFormatStandard),
		"18": formatCurrency(deal.lien),
		"19": mileage || "",
		"20": formatCurrency(totalCharges),
		"21": formatCurrency(deal.cash),
		"22": trade?.inventory.year,
		"23": trade?.inventory.model || "",
		"24": trade?.inventory.id,
		"25": formatCurrency(trade?.value),
		"26": formatCurrency(finance.sellingTradeDifferential),
		"27": formatCurrency(finance.stateTaxDollar),
		"28": formatCurrency(finance.cityTaxDollar),
		"29": formatCurrency(finance.rtdTaxDollar),
		"30": formatCurrency(finance.totalTaxDollar),
		"31": formatCurrency(finance.cashBalanceWithTax),
		"32": formatCurrency(deal.down || 0),
		"33": formatCurrency(0),
		"34": formatCurrency(deal.down || 0),
		"35": formatCurrency(finance.unpaidCashBalance),
		"36": formatCurrency(0), // payoff
		"37": formatCurrency(0),
		"38": formatCurrency(creditor.filingFees),
		"39": formatCurrency(0),
		"40": formatCurrency(creditor.filingFees),
		"41": formatCurrency(finance.financeAmount),
		"42": formatCurrency(finance.totalLoan - finance.financeAmount),
		"43": formatCurrency(finance.totalLoan),
		"44": formatCurrency(finance.deferredPayment),
		"45": formatCurrency(creditor.apr),
		"46": `${Number(deal.term) - 1}; 1`,
		"47": formatCurrency(finance.monthlyPayment),
		"48": formatDate(finance.firstPaymentDueDate, dateFormatStandard),
		"49": formatCurrency(finance.lastPayment),
		"50": formatDate(finance.lastPaymentDueDate, dateFormatStandard),
		"51": PRIMARY_DEALER_NAME,
		"52": address.street,
		"53": contact.phonePrimary,
		"54": address.city,
		"55": " ", // County
		"56": address.state,
		"57": address.zip,
	} satisfies Partial<BuyersOrderTemplate>;
};
