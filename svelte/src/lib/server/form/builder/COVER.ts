import {
	addressFromPerson,
	dateFormatStandard,
	formatCurrency,
	formatInventory,
	formatSalesmen,
	fullNameFromPerson,
} from "$lib/format";
import { formatDate } from "date-fns";
import type { CoverTemplate } from "./maps";
import type { DealFormParams } from ".";

export const fillCoverData = ({ deal, finance }: DealFormParams) => {
	const { account, cosigner, inventory, down_owed } = deal;
	const { contact } = account;
	const { inventory_salesman: salesmen } = inventory;
	const names = [fullNameFromPerson({ person: contact }), cosigner || null]
		.filter(Boolean)
		.join("; ");
	const address = addressFromPerson(contact);
	const salesmenText = formatSalesmen(salesmen, "firstName");
	const dealDate = formatDate(deal.date, dateFormatStandard);
	const lastPaymentDate =
		finance?.type === "credit"
			? formatDate(finance.lastPaymentDueDate, dateFormatStandard)
			: dealDate;
	return {
		"0": names,
		"1": formatDate(deal.date, dateFormatStandard),
		"2": address.street,
		"3": address.cityStateZip,
		"4": `${contact.phonePrimary} ${contact.emailPrimary || ""}`,
		"5": formatInventory(inventory),
		"6": `${deal.term}; ${formatCurrency(deal.pmt || 0)}`,
		"7": salesmenText,
		"8": inventory.vin.slice(-6),
		"9": `${dealDate} - ${lastPaymentDate}`,
		"10": formatCurrency(deal.lien || 0),
		"11": formatCurrency(deal.down || 0),
		"12": formatCurrency(down_owed),
	} satisfies Partial<CoverTemplate>;
};
