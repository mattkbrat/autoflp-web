import {
	BUSINESS_CITY_STATE_ZIP,
	BUSINESS_NAME,
	PRIMARY_DEALER_NAME,
	STREET,
} from "$env/static/private";
import {
	addressFromPerson,
	dateFormatStandard,
	formatCurrency,
	fullNameFromPerson,
} from "$lib/format";
import { formatDate } from "date-fns";
import type { DealFormParams } from ".";
import type { SecurityTemplate } from "./maps";

export const fillSecurityData = ({ deal, finance }: DealFormParams) => {
	const { cosigner, creditor, inventory } = deal;
	const financeType = finance?.type || !deal?.term ? "cash" : "credit";
	if (finance?.type !== "credit" || financeType !== "credit") {
		console.log("Must provide finance data for security generation.");
		return [];
	}
	if (!deal.lien || !creditor) {
		console.log("Missing data for security", {
			lien: deal.lien,
			creditor,
			type: financeType,
		});
		return [];
	}

	const firstEqualsLast = finance.monthlyPayment === finance.lastPayment;

	const payments = [
		finance.monthlyPayment,
		!firstEqualsLast && finance.lastPayment,
	]
		.filter((p) => Number.isFinite(p))
		.map((p) => formatCurrency(p || 0))
		.join(" & ");
	const noOfPayments = firstEqualsLast
		? deal.term
		: `${Number(deal.term) - 1} & 1`;

	const { contact } = deal.account;
	const contactName = fullNameFromPerson({ person: contact });
	const contactAddress = addressFromPerson(contact);
	const creditorAddress = addressFromPerson(creditor.contact);
	const filing = formatCurrency(creditor.filingFees);
	const financeAmount = formatCurrency(finance.financeAmount);
	const dealDate = formatDate(deal.date, dateFormatStandard);
	const obj: Partial<SecurityTemplate> = {
		"0": deal.account.id.split("-").slice(-1)[0].slice(-4),
		"1": deal.id.split("-").slice(-1)[0].slice(-4),
		"2": formatCurrency(deal.lien),
		"3": dealDate,
		"4": formatDate(finance.lastPaymentDueDate, dateFormatStandard),
		"5": contact.phonePrimary,
		"6": contactName,
		"7": cosigner ? cosigner : contactAddress.street,
		"8": cosigner ? contactAddress.full : contactAddress.cityStateZip,
		"9": BUSINESS_NAME,
		"10": STREET,
		"11": BUSINESS_CITY_STATE_ZIP,
		"12": (+creditor.apr).toFixed(2),
		"13": formatCurrency(Number(deal.lien) - finance.financeAmount),
		"14": financeAmount,
		"15": formatCurrency(finance.totalLoan),
		"16": formatCurrency(deal.down || 0),
		"17": formatCurrency(finance.financeAmount + Number(deal.down || 0)),
		"18": noOfPayments,
		"19": payments,
		"20": `${formatCurrency(finance.monthlyPayment)}: starting ${formatDate(
			finance.firstPaymentDueDate,
			dateFormatStandard,
		)}`,
		"21": firstEqualsLast
			? undefined
			: `${formatCurrency(finance.lastPayment)}: by ${formatDate(
					finance.lastPaymentDueDate,
					dateFormatStandard,
				)}`,
		"22": creditor.businessName,
		"23": creditorAddress.full,
		"24": formatCurrency(deal.cash),
		"25": formatCurrency(finance.totalTaxDollar),
		"26": formatCurrency(deal.down || 0),
		"27": formatCurrency(finance.tradeValue),
		"28": formatCurrency(finance.unpaidCashBalance),
		"29": filing,
		"30": filing,
		"31": " ",
		"32": financeAmount,
		"33": inventory.year,
		"34": inventory.make,
		"35": `${inventory.model} ${inventory.color ?? ""}`.trim(),
		"36": inventory.vin,
		"37": PRIMARY_DEALER_NAME,
	};
	if (deal.creditor?.businessName === BUSINESS_NAME) {
		return obj;
	}

	obj[38] = dealDate;
	obj[39] = PRIMARY_DEALER_NAME;

	return obj;
};
