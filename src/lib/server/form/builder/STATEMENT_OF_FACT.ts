import { dateFormatStandard, formatDate } from "$lib/format";
import type { DetailedDeal } from "$lib/server/database/deal";
import { add } from "date-fns";
import type { DownPaymentTemplate } from "./maps";

export const fillStatementOfFact = (deal: NonNullable<DetailedDeal>) => {
	return {
		"0": Number(deal.down_owed).toFixed(2),
		"1": formatDate(add(deal.date, { months: 1 }), dateFormatStandard),
		"2":
			deal.inventory.mileage?.toUpperCase() === "EXEMPT"
				? ""
				: deal.inventory.mileage || "",
	} satisfies Partial<DownPaymentTemplate>;
};
