import { dateFormatStandard, fullNameFromPerson } from "$lib/format";
import type { DetailedDeal } from "$lib/server/database/deal";
import { add, formatDate } from "date-fns";

export const fillStatementOfFact = (deal: NonNullable<DetailedDeal>) => {
	return {
		"0": " ",
		"1": add(deal.date, { months: 1 }).toDateString(),
		"2": deal.inventory.mileage,
	} satisfies Partial<STATEMENT_OF_FACT>;
};
