import {
	addressFromPerson,
	dateFormatStandard,
	formatCurrency,
	fullNameFromPerson,
} from "$lib/format";
import { formatDate } from "date-fns";
import type { CoverTemplate } from "./maps";
import type { DealFormParams } from ".";

export const fillCoverData = ({ deal, salesmen, finance }: DealFormParams) => {
	const {
		account,
		inventory: { make, model, year, color },
	} = deal;
	const { contact, cosigner } = account;
	const names = [fullNameFromPerson({ person: contact }), cosigner || null]
		.filter(Boolean)
		.join(", ");
	const address = addressFromPerson(contact);
	const salesmenText = salesmen
		?.map((s) => s.salesman.person.firstName)
		.join(", ");
	const dealDate = formatDate(deal.date, dateFormatStandard);
	const lastPaymentDate =
		finance?.type === "credit" &&
		formatDate(finance.lastPaymentDueDate, dateFormatStandard);
	return {
		"0": names,
		"1": formatDate(deal.date, dateFormatStandard),
		"2": address.street,
		"3": address.cityStateZip,
		"4": `${contact.phonePrimary} ${contact.emailPrimary}`,
		"5": `${year || ""} ${make || ""} ${model || ""} ${color || ""}`.trim(),
		"6": `${deal.term}; ${formatCurrency(deal.pmt)}`,
		"7": salesmenText,
		"8": deal.id.split("-").slice(-1)[0],
		"9": `${dealDate} - ${lastPaymentDate}`,
		"10": formatCurrency(deal.lien),
		"11": formatCurrency(deal.down),
		"12": "", // Down owed
	} satisfies Partial<CoverTemplate>;
};
