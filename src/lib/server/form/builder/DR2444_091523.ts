import { dateFormatStandardShortYear, fullNameFromPerson } from "$lib/format";
import type { DetailedDeal } from "$lib/server/database/deal";
import { formatDate } from "date-fns";
import type { DR2444_091523Template } from "./maps";

export const fillStatementOfFact091523 = (deal: NonNullable<DetailedDeal>) => {
	const fullName = fullNameFromPerson({ person: deal.account.contact });
	const dealDate = formatDate(deal.date, dateFormatStandardShortYear);
	return {
		Signature: "",
		Name: fullName,
		"Vehicle Identification Number (V I N)": deal.inventory.vin,
		Year: deal.inventory.year,
		Make: deal.inventory.make,
		"Title Number": "",
		Statement: "",
		"Date of Signature": dealDate,
	} satisfies DR2444_091523Template;
};
